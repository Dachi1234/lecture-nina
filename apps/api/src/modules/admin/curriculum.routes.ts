import type { FastifyInstance } from "fastify";
import { prisma } from "../../db.js";
import { requireRole } from "../auth/guard.js";

export async function adminCurriculumRoutes(app: FastifyInstance) {
  app.get("/v1/admin/curriculum", async (request, reply) => {
    const admin = await requireRole(request, reply, "ADMIN");
    if (!admin) return;
    const courses = await prisma.course.findMany({
      orderBy: { order: "asc" },
      include: {
        blocks: {
          orderBy: { order: "asc" },
          include: {
            topics: {
              orderBy: { number: "asc" },
              include: { _count: { select: { materials: true } } },
            },
          },
        },
      },
    });
    return {
      courses: courses.map((course) => ({
        id: course.id,
        title: course.title,
        level: course.level,
        blocks: course.blocks.map((block) => ({
          id: block.id,
          order: block.order,
          titleEs: block.titleEs,
          titleKa: block.titleKa,
          topics: block.topics.map((topic) => ({
            id: topic.id,
            number: topic.number,
            titleKa: topic.titleKa,
            titleEs: topic.titleEs,
            internalRef: topic.internalRef,
            materials: topic._count.materials,
          })),
        })),
      })),
    };
  });

  app.patch("/v1/admin/blocks/:id", async (request, reply) => {
    const admin = await requireRole(request, reply, "ADMIN");
    if (!admin) return;
    const { id } = request.params as { id: string };
    const body = request.body as { titleEs?: string; titleKa?: string };
    await prisma.block.update({
      where: { id },
      data: {
        ...(typeof body.titleEs === "string" ? { titleEs: body.titleEs } : {}),
        ...(typeof body.titleKa === "string" ? { titleKa: body.titleKa } : {}),
      },
    });
    return { ok: true };
  });

  app.post("/v1/admin/blocks/:id/move", async (request, reply) => {
    const admin = await requireRole(request, reply, "ADMIN");
    if (!admin) return;
    const { id } = request.params as { id: string };
    const body = request.body as { direction?: "up" | "down" };
    const block = await prisma.block.findUnique({ where: { id } });
    if (!block) return reply.code(404).send({ error: { code: "NOT_FOUND", messageKa: "ბლოკი ვერ მოიძებნა." } });
    const neighbor = await prisma.block.findFirst({
      where: { courseId: block.courseId, order: body.direction === "up" ? { lt: block.order } : { gt: block.order } },
      orderBy: { order: body.direction === "up" ? "desc" : "asc" },
    });
    if (!neighbor) return { ok: true };
    await prisma.$transaction([
      prisma.block.update({ where: { id: block.id }, data: { order: neighbor.order } }),
      prisma.block.update({ where: { id: neighbor.id }, data: { order: block.order } }),
    ]);
    return { ok: true };
  });

  app.patch("/v1/admin/topics/:id", async (request, reply) => {
    const admin = await requireRole(request, reply, "ADMIN");
    if (!admin) return;
    const { id } = request.params as { id: string };
    const body = request.body as { titleKa?: string; titleEs?: string | null; internalRef?: string | null };
    await prisma.topic.update({
      where: { id },
      data: {
        ...(typeof body.titleKa === "string" ? { titleKa: body.titleKa } : {}),
        ...(body.titleEs === null || typeof body.titleEs === "string" ? { titleEs: body.titleEs } : {}),
        ...(body.internalRef === null || typeof body.internalRef === "string" ? { internalRef: body.internalRef } : {}),
      },
    });
    return { ok: true };
  });

  app.post("/v1/admin/topics/:id/move", async (request, reply) => {
    const admin = await requireRole(request, reply, "ADMIN");
    if (!admin) return;
    const { id } = request.params as { id: string };
    const body = request.body as { direction?: "up" | "down" };
    const topic = await prisma.topic.findUnique({ where: { id } });
    if (!topic) return reply.code(404).send({ error: { code: "NOT_FOUND", messageKa: "თემა ვერ მოიძებნა." } });
    const neighbor = await prisma.topic.findFirst({
      where: { blockId: topic.blockId, number: body.direction === "up" ? { lt: topic.number } : { gt: topic.number } },
      orderBy: { number: body.direction === "up" ? "desc" : "asc" },
    });
    if (!neighbor) return { ok: true };
    await prisma.$transaction([
      prisma.topic.update({ where: { id: topic.id }, data: { number: -1 } }),
      prisma.topic.update({ where: { id: neighbor.id }, data: { number: topic.number } }),
      prisma.topic.update({ where: { id: topic.id }, data: { number: neighbor.number } }),
    ]);
    return { ok: true };
  });
}
