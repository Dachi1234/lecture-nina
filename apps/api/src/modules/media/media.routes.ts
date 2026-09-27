import multipart from "@fastify/multipart";
import type { FastifyInstance } from "fastify";
import { prisma } from "../../db.js";
import { getStorage } from "../../storage/index.js";
import { issueMediaUrl } from "./access.js";
import { parseByteRange } from "./range.js";
import { signMediaUrl, verifyMediaToken } from "./sign.js";
import { UploadError, saveUpload } from "./upload.js";
import type { VariantFile, VariantMap } from "./process.js";
import { enqueueMediaProcess } from "../../jobs/boss.js";
import { requireRole } from "../auth/guard.js";

const kinds = new Set(["IMAGE", "VIDEO", "AUDIO", "DOCUMENT", "OTHER"]);

export async function mediaRoutes(app: FastifyInstance) {
  await app.register(multipart, { limits: { fileSize: 1024 * 1024 * 1024, files: 1 } });

  app.post("/v1/admin/media", async (request, reply) => {
    const user = await requireRole(request, reply, "ADMIN");
    if (!user) return;
    const file = await request.file();
    if (!file) return reply.code(400).send({ error: { code: "VALIDATION", messageKa: "ფაილი არ არის." } });
    try {
      const saved = await saveUpload(file.filename, file.file);
      return reply.code(201).send({ ...saved, originalName: file.filename, path: previewPath(saved.id) });
    } catch (error) {
      if (error instanceof UploadError) {
        return reply.code(error.statusCode).send({ error: { code: error.code, messageKa: error.messageKa } });
      }
      throw error;
    }
  });

  app.get("/v1/admin/media", async (request, reply) => {
    const user = await requireRole(request, reply, "ADMIN");
    if (!user) return;
    const query = request.query as { cursor?: string; limit?: string; kind?: string };
    const limit = Math.min(200, Math.max(1, Number(query.limit) || 20));
    const kind = query.kind && kinds.has(query.kind) ? query.kind : undefined;
    const cursor = query.cursor ? await prisma.mediaAsset.findUnique({ where: { id: query.cursor }, select: { createdAt: true, id: true } }) : null;
    const items = await prisma.mediaAsset.findMany({
      where: {
        ...(kind ? { kind: kind as "IMAGE" | "VIDEO" | "AUDIO" | "DOCUMENT" | "OTHER" } : {}),
        ...(cursor ? { OR: [{ createdAt: { lt: cursor.createdAt } }, { createdAt: cursor.createdAt, id: { lt: cursor.id } }] } : {}),
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: limit + 1,
    });
    const page = items.slice(0, limit);
    return { items: page.map(present), nextCursor: items.length > limit ? page.at(-1)?.id ?? null : null };
  });

  app.get("/v1/admin/media/:id", async (request, reply) => {
    const user = await requireRole(request, reply, "ADMIN");
    if (!user) return;
    const { id } = request.params as { id: string };
    const asset = await prisma.mediaAsset.findUnique({ where: { id } });
    if (!asset) return reply.code(404).send({ error: { code: "NOT_FOUND", messageKa: "ფაილი ვერ მოიძებნა." } });
    const names = ["original", ...variantNames(asset.variants)];
    const urls: Record<string, string> = {};
    for (const name of names) {
      const signed = await issueMediaUrl(user, asset.id, name);
      if (signed) urls[name] = signed.url;
    }
    return { ...present(asset), urls };
  });

  app.post("/v1/admin/media/:id/retry", async (request, reply) => {
    const user = await requireRole(request, reply, "ADMIN");
    if (!user) return;
    const { id } = request.params as { id: string };
    const asset = await prisma.mediaAsset.findUnique({ where: { id } });
    if (!asset) return reply.code(404).send({ error: { code: "NOT_FOUND", messageKa: "ფაილი ვერ მოიძებნა." } });
    await prisma.mediaAsset.update({ where: { id }, data: { status: "PROCESSING" } });
    await enqueueMediaProcess(id);
    return { ok: true };
  });

  app.delete("/v1/admin/media/:id", async (request, reply) => {
    const user = await requireRole(request, reply, "ADMIN");
    if (!user) return;
    const { id } = request.params as { id: string };
    const asset = await prisma.mediaAsset.findUnique({ where: { id }, include: { _count: { select: { usedBy: true } } } });
    if (!asset) return reply.code(404).send({ error: { code: "NOT_FOUND", messageKa: "ფაილი ვერ მოიძებნა." } });
    if (asset._count.usedBy > 0) {
      return reply.code(409).send({ error: { code: "IN_USE", messageKa: "ეს ფაილი მასალაში გამოიყენება." } });
    }
    const storage = getStorage();
    await storage.delete(asset.storageKey);
    for (const file of variantFiles(asset.variants)) await storage.delete(file.key);
    await prisma.mediaAsset.delete({ where: { id } });
    return reply.code(204).send();
  });

  app.get("/v1/media/:assetId/:variant", async (request, reply) => {
    const { assetId, variant } = request.params as { assetId: string; variant: string };
    const query = request.query as { token?: string; exp?: string };
    if (!/^[A-Za-z0-9]+$/.test(variant) || !verifyMediaToken(assetId, variant, query.token ?? "", Number(query.exp))) {
      return reply.code(403).send({ error: { code: "FORBIDDEN", messageKa: "ბმულს ვადა გაუვიდა." } });
    }
    const asset = await prisma.mediaAsset.findUnique({ where: { id: assetId } });
    const located = asset ? locate(asset, variant) : null;
    if (!located) return reply.code(404).send({ error: { code: "NOT_FOUND", messageKa: "ფაილი ვერ მოიძებნა." } });
    const storage = getStorage();
    const meta = await storage.head(located.key);
    if (!meta) return reply.code(404).send({ error: { code: "NOT_FOUND", messageKa: "ფაილი ვერ მოიძებნა." } });
    const range = parseByteRange(request.headers.range, meta.size);
    if (range.status === 416) {
      reply.header("Content-Range", `bytes */${meta.size}`);
      return reply.code(416).send();
    }
    const etag = asset?.checksum ? `"${asset.checksum}"` : undefined;
    if (etag && request.headers["if-none-match"] === etag) return reply.code(304).send();
    const object = await storage.get(located.key, { start: range.start, end: range.end });
    reply.header("Accept-Ranges", "bytes");
    reply.header("Cache-Control", "private, max-age=3600");
    reply.header("Content-Type", located.mime);
    reply.header("Content-Length", String(range.end - range.start + 1));
    if (etag) reply.header("ETag", etag);
    if (range.status === 206) {
      reply.code(206);
      reply.header("Content-Range", `bytes ${range.start}-${range.end}/${meta.size}`);
    }
    return reply.send(object.stream);
  });
}

function present(asset: {
  id: string;
  kind: string;
  originalName: string;
  mime: string;
  sizeBytes: bigint;
  status: string;
  width: number | null;
  height: number | null;
  durationSec: number | null;
  pageCount: number | null;
  alt: string | null;
  tags: string[];
  variants: unknown;
  createdAt: Date;
}) {
  return {
    id: asset.id,
    kind: asset.kind,
    originalName: asset.originalName,
    mime: asset.mime,
    sizeBytes: Number(asset.sizeBytes),
    status: asset.status,
    width: asset.width,
    height: asset.height,
    durationSec: asset.durationSec,
    pageCount: asset.pageCount,
    alt: asset.alt,
    tags: asset.tags,
    variants: asset.variants,
    createdAt: asset.createdAt.toISOString(),
    path: previewPath(asset.id),
  };
}

function previewPath(assetId: string) {
  try {
    return signMediaUrl(assetId, "original").path;
  } catch {
    return null;
  }
}

function variantNames(value: unknown) {
  return variantFiles(value).map((file) => file.name);
}

function variantFiles(value: unknown) {
  if (!value || typeof value !== "object") return [];
  const files: { name: string; key: string }[] = [];
  for (const [name, entry] of Object.entries(value as VariantMap)) {
    if (isVariantFile(entry)) files.push({ name, key: entry.key });
  }
  return files;
}

function locate(asset: { storageKey: string; mime: string; variants: unknown }, variant: string) {
  if (variant === "original") return { key: asset.storageKey, mime: asset.mime };
  const entry = asset.variants && typeof asset.variants === "object" ? (asset.variants as VariantMap)[variant as keyof VariantMap] : null;
  if (!isVariantFile(entry)) return null;
  return { key: entry.key, mime: entry.mime };
}

function isVariantFile(value: unknown): value is VariantFile {
  return Boolean(value && typeof value === "object" && "key" in value && "mime" in value);
}
