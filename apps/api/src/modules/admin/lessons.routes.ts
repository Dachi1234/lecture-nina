import type { FastifyInstance } from "fastify";
import { materialReadiness } from "@nina/contracts";
import { prisma } from "../../db.js";
import { requireRole } from "../auth/guard.js";

const kinds = new Set(["LESSON_MATERIAL", "HOMEWORK", "PERSONAL", "REVIEW"]);

export async function adminLessonRoutes(app: FastifyInstance) {
  app.post("/v1/admin/students/:id/lessons", async (request, reply) => {
    const admin = await requireRole(request, reply, "ADMIN");
    if (!admin) return;
    const { id } = request.params as { id: string };
    const body = request.body as { title?: string; date?: string; topicIds?: string[] };
    if (!body.title?.trim() || !body.date) {
      return reply.code(400).send({ error: { code: "VALIDATION", messageKa: "სათაური და თარიღი საჭიროა." } });
    }
    const last = await prisma.lesson.findFirst({ where: { studentId: id }, orderBy: { number: "desc" } });
    const lesson = await prisma.lesson.create({
      data: {
        studentId: id,
        number: (last?.number ?? 0) + 1,
        title: body.title.trim(),
        date: new Date(body.date),
        topics: body.topicIds?.length ? { create: body.topicIds.map((topicId) => ({ topicId })) } : undefined,
      },
    });
    return { id: lesson.id, number: lesson.number };
  });

  app.get("/v1/admin/lessons/:id", async (request, reply) => {
    const admin = await requireRole(request, reply, "ADMIN");
    if (!admin) return;
    const { id } = request.params as { id: string };
    const lesson = await prisma.lesson.findUnique({
      where: { id },
      include: {
        student: { include: { user: { select: { name: true } } } },
        topics: { include: { topic: true } },
        items: { orderBy: { order: "asc" }, include: { material: { select: { id: true, title: true, type: true, status: true, content: true, draft: true } } } },
      },
    });
    if (!lesson) return reply.code(404).send({ error: { code: "NOT_FOUND", messageKa: "გაკვეთილი ვერ მოიძებნა." } });
    return {
      id: lesson.id,
      studentId: lesson.studentId,
      studentName: lesson.student.user.name,
      number: lesson.number,
      title: lesson.title,
      date: lesson.date.toISOString(),
      noteFromNina: lesson.noteFromNina,
      readyForStudent: lesson.readyForStudent,
      isGift: lesson.isGift,
      topics: lesson.topics.map((link) => ({ id: link.topic.id, number: link.topic.number, titleKa: link.topic.titleKa })),
      items: lesson.items.map((item) => ({
        id: item.id,
        materialId: item.materialId,
        title: item.material.title,
        type: item.material.type,
        status: item.material.status,
        hasDraft: item.material.draft !== null,
        filled: materialReadiness(item.material.type, item.material.content).ready,
        kind: item.kind,
        groupLabel: item.groupLabel,
        order: item.order,
        dueAt: item.dueAt?.toISOString() ?? null,
        readyForStudent: item.readyForStudent,
      })),
    };
  });

  app.patch("/v1/admin/lessons/:id", async (request, reply) => {
    const admin = await requireRole(request, reply, "ADMIN");
    if (!admin) return;
    const { id } = request.params as { id: string };
    const body = request.body as { title?: string; date?: string; noteFromNina?: string | null; topicIds?: string[]; isGift?: boolean };
    const lesson = await prisma.lesson.findUnique({ where: { id } });
    if (!lesson) return reply.code(404).send({ error: { code: "NOT_FOUND", messageKa: "გაკვეთილი ვერ მოიძებნა." } });
    await prisma.lesson.update({
      where: { id },
      data: {
        ...(body.title ? { title: body.title.trim() } : {}),
        ...(body.date ? { date: new Date(body.date) } : {}),
        ...(body.noteFromNina === null || typeof body.noteFromNina === "string" ? { noteFromNina: body.noteFromNina } : {}),
        ...(typeof body.isGift === "boolean" ? { isGift: body.isGift } : {}),
      },
    });
    if (body.topicIds) {
      await prisma.lessonTopic.deleteMany({ where: { lessonId: id } });
      if (body.topicIds.length) {
        await prisma.lessonTopic.createMany({ data: body.topicIds.map((topicId) => ({ lessonId: id, topicId })) });
      }
    }
    return { ok: true };
  });

  app.put("/v1/admin/lessons/:id/items", async (request, reply) => {
    const admin = await requireRole(request, reply, "ADMIN");
    if (!admin) return;
    const { id } = request.params as { id: string };
    const body = request.body as {
      items?: { materialId: string; kind?: string; groupLabel?: string | null; dueAt?: string | null; readyForStudent?: boolean }[];
    };
    const lesson = await prisma.lesson.findUnique({ where: { id } });
    if (!lesson) return reply.code(404).send({ error: { code: "NOT_FOUND", messageKa: "გაკვეთილი ვერ მოიძებნა." } });
    if (!Array.isArray(body.items)) return reply.code(400).send({ error: { code: "VALIDATION", messageKa: "სია არასწორია." } });
    await prisma.assignment.deleteMany({ where: { lessonId: id } });
    if (body.items.length) {
      await prisma.assignment.createMany({
        data: body.items.map((item, order) => ({
          studentId: lesson.studentId,
          materialId: item.materialId,
          lessonId: id,
          kind: (item.kind && kinds.has(item.kind) ? item.kind : "LESSON_MATERIAL") as "LESSON_MATERIAL",
          groupLabel: item.groupLabel || null,
          dueAt: item.dueAt ? new Date(item.dueAt) : null,
          readyForStudent: item.readyForStudent !== false,
          order,
        })),
      });
    }
    return { ok: true };
  });

  app.post("/v1/admin/lessons/:id/ready", async (request, reply) => {
    const admin = await requireRole(request, reply, "ADMIN");
    if (!admin) return;
    const { id } = request.params as { id: string };
    const body = request.body as { ready?: boolean };
    const ready = body.ready !== false;
    await prisma.lesson.update({ where: { id }, data: { readyForStudent: ready } });
    if (ready) await prisma.assignment.updateMany({ where: { lessonId: id }, data: { readyForStudent: true } });
    return { readyForStudent: ready };
  });

  app.post("/v1/admin/lessons/:id/template", async (request, reply) => {
    const admin = await requireRole(request, reply, "ADMIN");
    if (!admin) return;
    const { id } = request.params as { id: string };
    const body = request.body as { title?: string };
    const lesson = await prisma.lesson.findUnique({ where: { id }, include: { topics: true, items: { orderBy: { order: "asc" } } } });
    if (!lesson) return reply.code(404).send({ error: { code: "NOT_FOUND", messageKa: "გაკვეთილი ვერ მოიძებნა." } });
    const template = await prisma.lessonTemplate.create({
      data: {
        title: body.title?.trim() || lesson.title,
        topicIds: lesson.topics.map((link) => link.topicId),
        note: lesson.noteFromNina,
        items: lesson.items.map((item) => ({
          materialId: item.materialId,
          kind: item.kind,
          groupLabel: item.groupLabel,
          readyForStudent: item.readyForStudent,
        })),
      },
    });
    return { id: template.id };
  });

  app.get("/v1/admin/lesson-templates", async (request, reply) => {
    const admin = await requireRole(request, reply, "ADMIN");
    if (!admin) return;
    const rows = await prisma.lessonTemplate.findMany({ orderBy: { title: "asc" } });
    return { items: rows.map((row) => ({ id: row.id, title: row.title, note: row.note })) };
  });

  app.post("/v1/admin/lessons/from-template", async (request, reply) => {
    const admin = await requireRole(request, reply, "ADMIN");
    if (!admin) return;
    const body = request.body as { studentId?: string; templateId?: string; date?: string };
    if (!body.studentId || !body.templateId || !body.date) {
      return reply.code(400).send({ error: { code: "VALIDATION", messageKa: "მოსწავლე, შაბლონი და თარიღი საჭიროა." } });
    }
    const template = await prisma.lessonTemplate.findUnique({ where: { id: body.templateId } });
    if (!template) return reply.code(404).send({ error: { code: "NOT_FOUND", messageKa: "შაბლონი ვერ მოიძებნა." } });
    const last = await prisma.lesson.findFirst({ where: { studentId: body.studentId }, orderBy: { number: "desc" } });
    const lesson = await prisma.lesson.create({
      data: {
        studentId: body.studentId,
        number: (last?.number ?? 0) + 1,
        title: template.title,
        date: new Date(body.date),
        noteFromNina: template.note,
        topics: { create: template.topicIds.map((topicId) => ({ topicId })) },
      },
    });
    const items = Array.isArray(template.items) ? template.items : [];
    const rows = items.flatMap((item, order) => {
      const row = item as { materialId?: string; kind?: string; groupLabel?: string | null; readyForStudent?: boolean };
      if (!row.materialId) return [];
      return [{
        studentId: body.studentId!,
        materialId: row.materialId,
        lessonId: lesson.id,
        kind: (row.kind && kinds.has(row.kind) ? row.kind : "LESSON_MATERIAL") as "LESSON_MATERIAL",
        groupLabel: row.groupLabel ?? null,
        readyForStudent: row.readyForStudent !== false,
        order,
      }];
    });
    if (rows.length) await prisma.assignment.createMany({ data: rows });
    return { id: lesson.id };
  });
}
