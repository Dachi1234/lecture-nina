import { createHash } from "node:crypto";
import { createReadStream, createWriteStream } from "node:fs";
import { mkdir, rename, rm, stat, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { Readable, Transform } from "node:stream";
import { pipeline } from "node:stream/promises";
import type { StorageDriver, StorageObject } from "./driver.js";

export class StorageNotFound extends Error {
  constructor(key: string) {
    super(`missing object: ${key}`);
  }
}

export class LocalVolumeDriver implements StorageDriver {
  constructor(private readonly root: string) {}

  async put(key: string, stream: Readable, opts: { contentType: string }) {
    const dest = this.resolve(key);
    await mkdir(path.dirname(dest), { recursive: true });
    const partial = `${dest}.part`;
    const hash = createHash("sha256");
    let size = 0;
    const hasher = new Transform({
      transform(chunk, _encoding, callback) {
        const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
        size += buf.length;
        hash.update(buf);
        callback(null, buf);
      },
    });
    try {
      await pipeline(stream, hasher, createWriteStream(partial));
      await rename(partial, dest);
      await writeFile(`${dest}.ctype`, opts.contentType, "utf8");
      return { size, checksum: hash.digest("hex") };
    } catch (error) {
      await rm(partial, { force: true });
      throw error;
    }
  }

  async get(key: string, range?: { start: number; end?: number }): Promise<StorageObject> {
    const meta = await this.head(key);
    if (!meta) throw new StorageNotFound(key);
    const end = range?.end === undefined ? meta.size - 1 : Math.min(range.end, meta.size - 1);
    const start = range?.start ?? 0;
    const stream = createReadStream(this.resolve(key), { start, end: Math.max(start, end) });
    return { stream, size: meta.size, contentType: meta.contentType };
  }

  async head(key: string) {
    const dest = this.resolve(key);
    try {
      const info = await stat(dest);
      if (!info.isFile()) return null;
      const contentType = await readFile(`${dest}.ctype`, "utf8").catch(() => "application/octet-stream");
      return { size: info.size, contentType: contentType.trim() || "application/octet-stream" };
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
      throw error;
    }
  }

  async delete(key: string) {
    const dest = this.resolve(key);
    await rm(dest, { force: true });
    await rm(`${dest}.ctype`, { force: true });
  }

  private resolve(key: string) {
    const normalized = key.replaceAll("\\", "/").replace(/^\/+/, "");
    if (!normalized || normalized.includes("..")) throw new Error("invalid storage key");
    const root = path.resolve(this.root);
    const full = path.resolve(root, normalized);
    if (full !== root && !full.startsWith(root + path.sep)) throw new Error("invalid storage key");
    return full;
  }
}
