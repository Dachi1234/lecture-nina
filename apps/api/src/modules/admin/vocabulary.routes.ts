import type { FastifyInstance } from "fastify";
import { prisma } from "../../db.js";
import { requireRole } from "../auth/guard.js";

export async function adminVocabularyRoutes(app: FastifyInstance) {
  app.get("/v1/admin/vocabulary", async (request, reply) => {
    const admin = await requireRole(request, reply, "ADMIN");
    if (!admin) return;
    const query = request.query as { q?: string };
    const q = query.q?.trim();
    const rows = await prisma.vocabularyEntry.findMany({
      where: q
        ? { OR: [{ es: { contains: q, mode: "insensitive" } }, { ka: { contains: q, mode: "insensitive" } }, { en: { contains: q, mode: "insensitive" } }] }
        : undefined,
      include: { topic: { select: { number: true, titleKa: true } } },
      orderBy: { es: "asc" },
    });
    const seen = new Map<string, number>();
    for (const row of rows) seen.set(row.es.toLowerCase(), (seen.get(row.es.toLowerCase()) ?? 0) + 1);
    return {
      items: rows.map((row) => ({
        id: row.id,
        es: row.es,
        ka: row.ka,
        en: row.en,
        pronunciation: row.pronunciation,
        category: row.category,
        personalLabel: row.personalLabel,
        personal: Boolean(row.personalForId),
        topic: row.topic ? { number: row.topic.number, titleKa: row.topic.titleKa } : null,
        duplicate: (seen.get(row.es.toLowerCase()) ?? 0) > 1,
      })),
    };
  });

  app.post("/v1/admin/vocabulary", async (request, reply) => {
    const admin = await requireRole(request, reply, "ADMIN");
    if (!admin) return;
    const body = request.body as { es?: string; ka?: string; en?: string; category?: string; pronunciation?: string };
    if (!body.es?.trim() || !body.ka?.trim()) {
      return reply.code(400).send({ error: { code: "VALIDATION", messageKa: "ესპანური და ქართული საჭიროა." } });
    }
    const row = await prisma.vocabularyEntry.create({
      data: { es: body.es.trim(), ka: body.ka.trim(), en: body.en?.trim() || null, category: body.category?.trim() || null, pronunciation: body.pronunciation?.trim() || null },
    });
    return { id: row.id };
  });

  app.patch("/v1/admin/vocabulary/:id", async (request, reply) => {
    const admin = await requireRole(request, reply, "ADMIN");
    if (!admin) return;
    const { id } = request.params as { id: string };
    const body = request.body as { es?: string; ka?: string; en?: string | null; category?: string | null; pronunciation?: string | null };
    await prisma.vocabularyEntry.update({
      where: { id },
      data: {
        ...(typeof body.es === "string" ? { es: body.es } : {}),
        ...(typeof body.ka === "string" ? { ka: body.ka } : {}),
        ...(body.en === null || typeof body.en === "string" ? { en: body.en } : {}),
        ...(body.category === null || typeof body.category === "string" ? { category: body.category } : {}),
        ...(body.pronunciation === null || typeof body.pronunciation === "string" ? { pronunciation: body.pronunciation } : {}),
      },
    });
    return { ok: true };
  });

  app.delete("/v1/admin/vocabulary/:id", async (request, reply) => {
    const admin = await requireRole(request, reply, "ADMIN");
    if (!admin) return;
    const { id } = request.params as { id: string };
    await prisma.vocabularyEntry.delete({ where: { id } });
    return { ok: true };
  });

  app.post("/v1/admin/vocabulary/import", async (request, reply) => {
    const admin = await requireRole(request, reply, "ADMIN");
    if (!admin) return;
    const body = request.body as { rows?: { es?: string; ka?: string; en?: string; category?: string }[] };
    const rows = (body.rows ?? []).filter((row) => row.es?.trim() && row.ka?.trim());
    if (rows.length === 0) return reply.code(400).send({ error: { code: "VALIDATION", messageKa: "იმპორტის სია ცარიელია." } });
    const created = await prisma.vocabularyEntry.createMany({
      data: rows.map((row) => ({ es: row.es!.trim(), ka: row.ka!.trim(), en: row.en?.trim() || null, category: row.category?.trim() || null })),
    });
    return { created: created.count };
  });
}
