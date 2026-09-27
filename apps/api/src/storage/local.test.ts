import { Readable } from "node:stream";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { LocalVolumeDriver } from "./local.js";

const roots: string[] = [];

afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

async function driver() {
  const root = await mkdtemp(path.join(tmpdir(), "nina-storage-"));
  roots.push(root);
  return new LocalVolumeDriver(root);
}

describe("LocalVolumeDriver", () => {
  it("stores a file and reads a byte range", async () => {
    const storage = await driver();
    const stored = await storage.put("orig/2026/09/a.txt", Readable.from(Buffer.from("abcdefghijklmnopqrstuvwxyz")), { contentType: "text/plain" });
    expect(stored.size).toBe(26);
    expect(stored.checksum).toHaveLength(64);

    const full = await storage.get("orig/2026/09/a.txt");
    expect(full.contentType).toBe("text/plain");
    expect(Buffer.concat(await read(full.stream)).toString()).toBe("abcdefghijklmnopqrstuvwxyz");

    const slice = await storage.get("orig/2026/09/a.txt", { start: 0, end: 2 });
    expect(Buffer.concat(await read(slice.stream)).toString()).toBe("abc");
    expect(await storage.head("missing")).toBeNull();
  });

  it("refuses a key that leaves the volume", async () => {
    const storage = await driver();
    await expect(storage.put("../secret.txt", Readable.from(Buffer.from("no")), { contentType: "text/plain" })).rejects.toThrow(/invalid storage key/);
  });
});

async function read(stream: Readable) {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  return chunks;
}
