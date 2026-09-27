import sharp from "sharp";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { Readable } from "node:stream";
import { afterEach, describe, expect, it } from "vitest";
import { LocalVolumeDriver } from "../../storage/local.js";
import { classifyMime, originalKey, sanitizeFileName, SIZE_LIMITS, sniffMime } from "./files.js";
import { parseByteRange } from "./range.js";
import { pdfPageCount, processImage } from "./process.js";
import { decideMediaAccess, signMediaUrl, verifyMediaToken } from "./sign.js";

describe("media files", () => {
  it("sniffs a png and classifies it under the image limit", () => {
    const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    expect(sniffMime(png)).toBe("image/png");
    expect(classifyMime("image/png")).toEqual({ kind: "IMAGE", ext: "png" });
    expect(SIZE_LIMITS.IMAGE).toBe(20 * 1024 * 1024);
    expect(SIZE_LIMITS.VIDEO).toBe(1024 * 1024 * 1024);
  });

  it("drops path pieces and odd characters from a file name", () => {
    expect(sanitizeFileName("..\\C:\\secret\\ფოტო .png")).toBe("ფოტო .png");
  });

  it("builds the original key from the upload month", () => {
    expect(originalKey("asset1", "jpg", new Date("2026-09-26T00:00:00Z"))).toBe("orig/2026/09/asset1.jpg");
  });
});

describe("byte ranges", () => {
  it("parses open, closed, and suffix ranges", () => {
    expect(parseByteRange(undefined, 10)).toEqual({ status: 200, start: 0, end: 9 });
    expect(parseByteRange("bytes=0-2", 10)).toEqual({ status: 206, start: 0, end: 2 });
    expect(parseByteRange("bytes=8-", 10)).toEqual({ status: 206, start: 8, end: 9 });
    expect(parseByteRange("bytes=-3", 10)).toEqual({ status: 206, start: 7, end: 9 });
    expect(parseByteRange("bytes=20-30", 10).status).toBe(416);
  });
});

describe("signed media urls", () => {
  it("accepts a fresh token and rejects a changed one", () => {
    process.env.MEDIA_SIGNING_SECRET = "test-secret";
    const signed = signMediaUrl("asset", "original", 1_000);
    expect(verifyMediaToken("asset", "original", signed.token, signed.exp, 1_000)).toBe(true);
    expect(verifyMediaToken("asset", "w800", signed.token, signed.exp, 1_000)).toBe(false);
    expect(verifyMediaToken("asset", "original", signed.token, signed.exp, signed.exp + 1)).toBe(false);
  });

  it("lets an admin through and a student only when the assignment is ready", () => {
    expect(decideMediaAccess("ADMIN", false)).toBe(true);
    expect(decideMediaAccess("STUDENT", true)).toBe(true);
    expect(decideMediaAccess("STUDENT", false)).toBe(false);
    expect(decideMediaAccess(null, true)).toBe(false);
  });
});

describe("image and pdf processing", () => {
  const roots: string[] = [];
  afterEach(async () => {
    await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
  });

  it("writes webp variants and a blurhash", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "nina-image-"));
    roots.push(root);
    const storage = new LocalVolumeDriver(root);
    const png = await sharp({ create: { width: 64, height: 40, channels: 3, background: { r: 180, g: 70, b: 40 } } }).png().toBuffer();
    await storage.put("orig/pic.png", Readable.from(png), { contentType: "image/png" });
    const result = await processImage(storage, "orig/pic.png", "pic");
    expect(result.width).toBe(64);
    expect(result.height).toBe(40);
    expect(result.variants.blurhash).toEqual(expect.any(String));
    expect(result.variants.w800?.mime).toBe("image/webp");
    const webp = await storage.head(result.variants.w800!.key);
    expect(webp?.contentType).toBe("image/webp");
    expect(webp?.size).toBeGreaterThan(0);
  });

  it("counts pages in a one-page pdf", async () => {
    const pdf = `%PDF-1.1
1 0 obj<< /Type /Catalog /Pages 2 0 R >>endobj
2 0 obj<< /Type /Pages /Count 1 /Kids [3 0 R] >>endobj
3 0 obj<< /Type /Page /Parent 2 0 R /MediaBox [0 0 200 200] >>endobj
trailer<< /Root 1 0 R >>
%%EOF`;
    expect(await pdfPageCount(Buffer.from(pdf))).toBe(1);
  });
});
