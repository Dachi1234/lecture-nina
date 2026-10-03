import type { FastifyInstance } from "fastify";
import { MATERIAL_TYPES, collectAssetIds } from "@nina/contracts";
import { prisma } from "../../db.js";
import { requireRole } from "../auth/guard.js";
import { signMediaUrl } from "../media/sign.js";
import { bad } from "../lessons/load.js";

const types = new Set<string>(MATERIAL_TYPES);

export async function adminLegacyRoutes(app: FastifyInstance) {
  app.get("/v1/admin/legacy", async (request, reply) => {
    if (!(await requireRole(request, reply, "ADMIN"))) return;
    const query = request.query as { q?: string; type?: string };
    const q = query.q?.trim();
    const rows = await prisma.legacyMaterial.findMany({
      where: {
        ...(query.type && types.has(query.type) ? { type: query.type as never } : {}),
        ...(q
          ? { OR: [{ title: { contains: q, mode: "insensitive" } }, { topicLabel: { contains: q, mode: "insensitive" } }, { tags: { has: q } }] }
          : {}),
      },
      select: { id: true, type: true, title: true, subtitle: true, unitLabel: true, topicLabel: true, topicOrder: true },
      orderBy: [{ topicOrder: { sort: "asc", nulls: "last" } }, { title: "asc" }],
    });
    const copies = await prisma.material.findMany({
      where: { legacySourceId: { in: rows.map((row) => row.id) } },
      select: { id: true, legacySourceId: true },
    });
    const copied = new Map(copies.map((row) => [row.legacySourceId!, row.id]));
    const counts = await prisma.legacyMaterial.groupBy({ by: ["type"], _count: true });
    return {
      items: rows.map((row) => ({ ...row, copiedTo: copied.get(row.id) ?? null })),
      counts: Object.fromEntries(counts.map((row) => [row.type, row._count])),
      words: await prisma.legacyWord.count(),
    };
  });

  app.get("/v1/admin/legacy/words", async (request, reply) => {
    if (!(await requireRole(request, reply, "ADMIN"))) return;
    const rows = await prisma.legacyWord.findMany({ orderBy: [{ topicOrder: { sort: "asc", nulls: "last" } }, { es: "asc" }] });
    return { items: rows };
  });

  app.get("/v1/admin/legacy/:id", async (request, reply) => {
    if (!(await requireRole(request, reply, "ADMIN"))) return;
    const { id } = request.params as { id: string };
    const row = await prisma.legacyMaterial.findUnique({ where: { id } });
    if (!row) return reply.code(404).send(bad("მასალა ვერ მოიძებნა.", "NOT_FOUND"));
    const copy = await prisma.material.findFirst({ where: { legacySourceId: id }, select: { id: true } });
    const assets: Record<string, string> = {};
    for (const assetId of collectAssetIds(row.content)) {
      try {
        assets[assetId] = signMediaUrl(assetId, "original").path;
      } catch {
        continue;
      }
    }
    return {
      id: row.id,
      type: row.type,
      title: row.title,
      subtitle: row.subtitle,
      description: row.description,
      content: row.content,
      tags: row.tags,
      estMinutes: row.estMinutes,
      unitLabel: row.unitLabel,
      topicLabel: row.topicLabel,
      copiedTo: copy?.id ?? null,
      assets,
    };
  });

  app.post("/v1/admin/legacy/:id/copy", async (request, reply) => {
    const user = await requireRole(request, reply, "ADMIN");
    if (!user) return;
    const { id } = request.params as { id: string };
    const material = await copyLegacyMaterial(id, user.id);
    if (!material) return reply.code(404).send(bad("მასალა ვერ მოიძებნა.", "NOT_FOUND"));
    return material;
  });
}

/** Copies a legacy item into the new library as a draft. Media files are shared, not duplicated. */
export async function copyLegacyMaterial(legacyId: string, userId: string | null, publish = false) {
  const existing = await prisma.material.findFirst({ where: { legacySourceId: legacyId }, select: { id: true } });
  if (existing) return { id: existing.id, created: false };
  const source = await prisma.legacyMaterial.findUnique({ where: { id: legacyId }, include: { assets: true } });
  if (!source) return null;
  const material = await prisma.material.create({
    data: {
      type: source.type,
      title: source.title,
      subtitle: source.subtitle,
      description: source.description,
      content: source.content as object,
      status: publish ? "PUBLISHED" : "DRAFT",
      origin: "IMPORTED",
      tags: source.tags,
      estMinutes: source.estMinutes,
      legacySourceId: source.id,
      createdById: userId,
      assets: { create: source.assets.map((asset) => ({ assetId: asset.assetId, role: asset.role, order: asset.order })) },
      ...(publish ? { revisions: { create: { title: source.title, content: source.content as object, note: "legacy copy", createdById: userId } } } : {}),
    },
  });
  return { id: material.id, created: true };
}
