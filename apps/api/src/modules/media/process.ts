import { spawn } from "node:child_process";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { createReadStream, createWriteStream } from "node:fs";
import { encode } from "blurhash";
import { PDFDocument } from "pdf-lib";
import sharp from "sharp";
import type { StorageDriver } from "../../storage/driver.js";
import { variantKey } from "./files.js";

export type VariantFile = { key: string; mime: string; width?: number; height?: number };
export type VariantMap = {
  error?: string;
  preview?: "ready" | "download";
  blurhash?: string;
  lqip?: string;
  peaks?: number[];
  w800?: VariantFile;
  w1600?: VariantFile;
  poster?: VariantFile;
  thumb?: VariantFile;
  play?: VariantFile;
  mp3?: VariantFile;
  previewPdf?: VariantFile;
};

export async function processImage(storage: StorageDriver, sourceKey: string, assetId: string) {
  const input = await readObject(storage, sourceKey);
  const meta = await sharp(input).rotate().metadata();
  const [w800, w1600, lqip, blurhash] = await Promise.all([
    webpVariant(storage, input, assetId, "w800", 800),
    webpVariant(storage, input, assetId, "w1600", 1600),
    sharp(input).rotate().resize({ width: 16, withoutEnlargement: true }).webp({ quality: 30 }).toBuffer(),
    blurHash(input),
  ]);
  return {
    width: meta.width ?? null,
    height: meta.height ?? null,
    variants: {
      w800,
      w1600,
      blurhash,
      lqip: `data:image/webp;base64,${lqip.toString("base64")}`,
      preview: "ready" as const,
    },
  };
}

export async function processAudio(storage: StorageDriver, sourceKey: string, assetId: string) {
  const file = await objectToTemp(storage, sourceKey, ".bin");
  try {
    const durationSec = await probeDuration(file);
    const mp3Path = path.join(path.dirname(file), "audio.mp3");
    await run("ffmpeg", ["-y", "-i", file, "-vn", "-codec:a", "libmp3lame", "-b:a", "128k", mp3Path]);
    const key = variantKey(assetId, "audio", "mp3");
    await storage.put(key, createReadStream(mp3Path), { contentType: "audio/mpeg" });
    const peaks = await waveformPeaks(file, durationSec);
    return { durationSec, variants: { mp3: { key, mime: "audio/mpeg" }, peaks, preview: "ready" as const } };
  } finally {
    await rm(path.dirname(file), { recursive: true, force: true });
  }
}

export async function processVideo(storage: StorageDriver, sourceKey: string, assetId: string) {
  const file = await objectToTemp(storage, sourceKey, ".bin");
  try {
    const probed = await probe(file);
    const durationSec = Number(probed.format.duration ?? 0) || null;
    const video = probed.streams.find((stream) => stream.codec_type === "video");
    const audio = probed.streams.find((stream) => stream.codec_type === "audio");
    const friendly = video?.codec_name === "h264" && (!audio || audio.codec_name === "aac") && (probed.format.format_name ?? "").includes("mp4");
    const variants: VariantMap = { preview: "ready" };
    if (!friendly) {
      const mp4Path = path.join(path.dirname(file), "play.mp4");
      await run("ffmpeg", ["-y", "-i", file, "-c:v", "libx264", "-c:a", "aac", "-movflags", "+faststart", mp4Path]);
      const key = variantKey(assetId, "play", "mp4");
      await storage.put(key, createReadStream(mp4Path), { contentType: "video/mp4" });
      variants.play = { key, mime: "video/mp4" };
    }
    const posterPath = path.join(path.dirname(file), "poster.jpg");
    await run("ffmpeg", ["-y", "-ss", "0", "-i", file, "-frames:v", "1", "-vf", "scale=800:-2", posterPath]);
    const posterKey = variantKey(assetId, "poster", "jpg");
    await storage.put(posterKey, createReadStream(posterPath), { contentType: "image/jpeg" });
    variants.poster = { key: posterKey, mime: "image/jpeg" };
    return { durationSec, variants };
  } finally {
    await rm(path.dirname(file), { recursive: true, force: true });
  }
}

export async function processDocument(storage: StorageDriver, sourceKey: string, assetId: string, mime: string) {
  if (mime === "application/pdf") {
    const bytes = await readObject(storage, sourceKey);
    const pageCount = await pdfPageCount(bytes);
    const thumb = await pdfThumb(storage, bytes, assetId);
    return { pageCount, variants: { preview: thumb ? ("ready" as const) : ("download" as const), ...(thumb ? { thumb } : {}) } };
  }
  if (!(await commandExists("soffice"))) {
    return { pageCount: null, variants: { preview: "download" as const } };
  }
  const file = await objectToTemp(storage, sourceKey, mime.endsWith("document") ? ".docx" : ".doc");
  try {
    await run("soffice", ["--headless", "--convert-to", "pdf", "--outdir", path.dirname(file), file]);
    const pdfPath = file.replace(/\.[^.]+$/, ".pdf");
    const pdf = await readFile(pdfPath);
    const key = variantKey(assetId, "preview", "pdf");
    await storage.put(key, Readable.from(pdf), { contentType: "application/pdf" });
    return { pageCount: await pdfPageCount(pdf), variants: { preview: "ready" as const, previewPdf: { key, mime: "application/pdf" } } };
  } finally {
    await rm(path.dirname(file), { recursive: true, force: true });
  }
}

export async function pdfPageCount(bytes: Uint8Array) {
  const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  return doc.getPageCount();
}

async function pdfThumb(storage: StorageDriver, bytes: Buffer, assetId: string) {
  try {
    const image = await sharp(bytes, { page: 0 }).resize({ width: 400, withoutEnlargement: true }).webp({ quality: 80 }).toBuffer();
    const meta = await sharp(image).metadata();
    const key = variantKey(assetId, "thumb", "webp");
    await storage.put(key, Readable.from(image), { contentType: "image/webp" });
    return { key, mime: "image/webp", width: meta.width, height: meta.height };
  } catch {
    return null;
  }
}

async function webpVariant(storage: StorageDriver, input: Buffer, assetId: string, name: string, width: number): Promise<VariantFile> {
  const image = sharp(input).rotate().resize({ width, withoutEnlargement: true });
  const buffer = await image.webp({ quality: 80 }).toBuffer();
  const meta = await sharp(buffer).metadata();
  const key = variantKey(assetId, name, "webp");
  await storage.put(key, Readable.from(buffer), { contentType: "image/webp" });
  return { key, mime: "image/webp", width: meta.width, height: meta.height };
}

async function blurHash(input: Buffer) {
  const { data, info } = await sharp(input).rotate().resize(32, 32, { fit: "inside" }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  if (!info.width || !info.height) return undefined;
  return encode(new Uint8ClampedArray(data), info.width, info.height, 4, 3);
}

async function readObject(storage: StorageDriver, key: string) {
  const object = await storage.get(key);
  const chunks: Buffer[] = [];
  for await (const chunk of object.stream) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  return Buffer.concat(chunks);
}

async function objectToTemp(storage: StorageDriver, key: string, ext: string) {
  const dir = await mkdtemp(path.join(tmpdir(), "nina-media-"));
  const file = path.join(dir, `source${ext}`);
  const object = await storage.get(key);
  await pipeline(object.stream, createWriteStream(file));
  return file;
}

async function probeDuration(file: string) {
  const probed = await probe(file);
  return Number(probed.format.duration ?? 0) || null;
}

async function probe(file: string) {
  const { stdout } = await run("ffprobe", ["-v", "error", "-print_format", "json", "-show_format", "-show_streams", file]);
  return JSON.parse(stdout.toString()) as {
    format: { duration?: string; format_name?: string };
    streams: { codec_type?: string; codec_name?: string }[];
  };
}

async function waveformPeaks(file: string, durationSec: number | null) {
  const buckets = 180;
  const sampleRate = 8000;
  const total = Math.max(1, Math.floor((durationSec ?? 1) * sampleRate));
  const per = total / buckets;
  const peaks = Array.from({ length: buckets }, () => 0);
  let index = 0;
  await new Promise<void>((resolve, reject) => {
    const child = spawn("ffmpeg", ["-v", "error", "-i", file, "-ac", "1", "-ar", String(sampleRate), "-f", "f32le", "pipe:1"], { windowsHide: true });
    let leftover = Buffer.alloc(0);
    child.stdout.on("data", (chunk: Buffer) => {
      const data = leftover.length ? Buffer.concat([leftover, chunk]) : chunk;
      const usable = data.length - (data.length % 4);
      leftover = Buffer.from(data.subarray(usable));
      for (let offset = 0; offset < usable; offset += 4) {
        const sample = Math.abs(data.readFloatLE(offset));
        const bucket = Math.min(buckets - 1, Math.floor(index / per));
        if (sample > peaks[bucket]!) peaks[bucket] = sample;
        index += 1;
      }
    });
    child.on("error", reject);
    child.on("close", (code) => (code === 0 ? resolve() : reject(new Error("waveform failed"))));
  });
  const max = Math.max(...peaks, 0.0001);
  return peaks.map((value) => Math.round((value / max) * 1000) / 1000);
}

function run(command: string, args: string[]) {
  return new Promise<{ stdout: Buffer; stderr: string }>((resolve, reject) => {
    const child = spawn(command, args, { windowsHide: true });
    const out: Buffer[] = [];
    let err = "";
    child.stdout.on("data", (chunk: Buffer) => out.push(chunk));
    child.stderr.on("data", (chunk: Buffer) => {
      err += chunk.toString();
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve({ stdout: Buffer.concat(out), stderr: err });
      else reject(new Error(`${command} exited ${code}`));
    });
  });
}

export function commandExists(command: string) {
  return new Promise<boolean>((resolve) => {
    const child = spawn(command, ["-version"], { windowsHide: true });
    child.on("error", () => resolve(false));
    child.on("close", (code) => resolve(code === 0));
  });
}
