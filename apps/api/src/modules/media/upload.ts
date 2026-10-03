import { randomUUID } from "node:crypto";
import { Readable } from "node:stream";
import { prisma } from "../../db.js";
import { enqueueMediaProcess } from "../../jobs/boss.js";
import { getStorage } from "../../storage/index.js";
import { classifyMime, originalKey, sanitizeFileName, SIZE_LIMITS, sniffMime } from "./files.js";

export class UploadError extends Error {
  constructor(
    readonly code: string,
    readonly messageKa: string,
    readonly statusCode: number,
  ) {
    super(messageKa);
  }
}

export async function splitHead(stream: AsyncIterable<Buffer | Uint8Array | string>, size: number) {
  const iterator = stream[Symbol.asyncIterator]();
  const chunks: Buffer[] = [];
  let total = 0;
  let extra: Buffer | null = null;
  while (total < size) {
    const next = await iterator.next();
    if (next.done) break;
    const buf = Buffer.isBuffer(next.value) ? next.value : Buffer.from(next.value);
    if (total + buf.length > size) {
      chunks.push(buf.subarray(0, size - total));
      extra = buf.subarray(size - total);
      break;
    }
    chunks.push(buf);
    total += buf.length;
  }
  async function* rest() {
    if (extra?.length) yield extra;
    while (true) {
      const next = await iterator.next();
      if (next.done) return;
      yield Buffer.isBuffer(next.value) ? next.value : Buffer.from(next.value);
    }
  }
  return { head: Buffer.concat(chunks), rest: Readable.from(rest()) };
}

export async function saveUpload(fileName: string, stream: Readable) {
  stream.on("error", () => undefined);
  const { head, rest } = await splitHead(stream, 4100);
  const mime = sniffMime(head);
  const classified = mime ? classifyMime(mime) : null;
  if (!mime || !classified) {
    stream.destroy();
    throw new UploadError("UNSUPPORTED_TYPE", "ამ ტიპის ფაილი არ მიიღება.", 400);
  }
  const body = Readable.from(
    (async function* () {
      yield head;
      for await (const chunk of rest) yield chunk;
    })(),
  );
  const limited = limitStream(body, SIZE_LIMITS[classified.kind]);
  const asset = await prisma.mediaAsset.create({
    data: {
      kind: classified.kind,
      originalName: sanitizeFileName(fileName),
      mime,
      sizeBytes: 0,
      storageKey: `pending/${randomUUID()}`,
      status: "UPLOADING",
    },
  });
  const key = originalKey(asset.id, classified.ext);
  const storage = getStorage();
  try {
    await prisma.mediaAsset.update({ where: { id: asset.id }, data: { storageKey: key } });
    const stored = await storage.put(key, limited, { contentType: mime });
    await prisma.mediaAsset.update({
      where: { id: asset.id },
      data: { sizeBytes: stored.size, checksum: stored.checksum, status: "PROCESSING" },
    });
    await enqueueMediaProcess(asset.id);
    return { id: asset.id, kind: classified.kind, status: "PROCESSING" as const };
  } catch (error) {
    await storage.delete(key).catch(() => undefined);
    const uploadError = error instanceof UploadError ? error : null;
    await prisma.mediaAsset.update({
      where: { id: asset.id },
      data: { status: "FAILED", variants: { error: uploadError?.messageKa ?? "ატვირთვა ვერ მოხერხდა." } },
    });
    if (uploadError) throw uploadError;
    throw error;
  }
}

function limitStream(stream: AsyncIterable<Buffer | Uint8Array | string>, maxBytes: number) {
  return Readable.from(
    (async function* () {
      let size = 0;
      try {
        for await (const chunk of stream) {
          const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
          size += buf.length;
          if (size > maxBytes) throw new UploadError("FILE_TOO_LARGE", "ფაილი ძალიან დიდია.", 413);
          yield buf;
        }
      } catch (error) {
        if (error instanceof UploadError) throw error;
        throw new UploadError("UPLOAD_INTERRUPTED", "ატვირთვა შეწყდა. სცადე თავიდან.", 400);
      }
    })(),
  );
}
