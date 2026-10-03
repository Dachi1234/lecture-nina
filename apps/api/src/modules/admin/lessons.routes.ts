import type { FastifyInstance } from "fastify";
import type { Prisma } from "@nina/db";
import { prisma } from "../../db.js";
import { requireRole } from "../auth/guard.js";
import { SECTIONS, lessonCounter, lessonStatus, type Section } from "../../domain/progress.js";
import { audienceOf, bad, itemHealth, lessonInclude, lessonTitle, resolveItems, visibleToStudent } from "../lessons/load.js";

const sections = new Set<string>(SECTIONS);

function optionalDate(value: unknown) {
  if (value === null) return null;
  if (typeof value !== "string" || !value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function nullableText(value: unknown) {
  if (value === null) return null;
  return typeof value === "string" ? value.trim() || null : undefined;
}

export async function adminLessonRoutes(app: FastifyInstance) {
  app.get("/v1/admin/lessons", async (request, reply) => {
    if (!(await requireRole(request, reply, "ADMIN"))) return;
    const query = request.query as { from?: string; to?: string; studentId?: string; groupId?: string; scope?: string };
    const now = new Date();
    const where: Prisma.LessonWhereInput = {
      ...(query.studentId ? { studentId: query.studentId } : {}),
      ...(query.groupId ? { groupId: query.groupId } : {}),
      ...(query.scope === "past" ? { date: { lt: now } } : query.scope === "all" ? {} : { date: { gte: new Date(now.getTime() - 1000 * 60 * 60 * 3) } }),
      ...(query.from || query.to ? { date: { ...(query.from ? { gte: new Date(query.from) } : {}), ...(query.to ? { lte: new Date(query.to) } : {}) } } : {}),
    };
    const rows = await prisma.lesson.findMany({
      where,
      orderBy: { date: query.scope === "past" ? "desc" : "asc" },
      take: 200,
      include: lessonInclude,
    });
    return {
      items: rows.map((lesson) => {
        const items = resolveItems(lesson);
        const visible = visibleToStudent(items);
        return {
          id: lesson.id,
          title: lessonTitle(lesson),
          date: lesson.date.toISOString(),
          durationMin: lesson.durationMin,
          published: lesson.publishedAt !== null,
          held: lesson.heldAt !== null,
          audience: audienceOf(lesson),
          plan: lesson.plan ? { id: lesson.plan.id, titleKa: lesson.plan.titleKa, unitTitle: lesson.plan.unit?.titleKa ?? null } : null,
          items: visible.length,
          problems: items.filter((item) => !item.hidden && item.material.status !== "PUBLISHED").length,
        };
      }),
    };
  });

  app.post("/v1/admin/lessons", async (request, reply) => {
    if (!(await requireRole(request, reply, "ADMIN"))) return;
    const body = (request.body ?? {}) as { studentId?: unknown; groupId?: unknown; planId?: unknown; title?: unknown; date?: unknown; durationMin?: unknown };
    const studentId = typeof body.studentId === "string" && body.studentId ? body.studentId : null;
    const groupId = typeof body.groupId === "string" && body.groupId ? body.groupId : null;
    const date = optionalDate(body.date);
    if ((studentId ? 1 : 0) + (groupId ? 1 : 0) !== 1) return reply.code(400).send(bad("აირჩიე ერთი მოსწავლე ან ერთი ჯგუფი."));
    if (!date) return reply.code(400).send(bad("თარიღი საჭიროა."));
    const planId = typeof body.planId === "string" && body.planId ? body.planId : null;
    const title = nullableText(body.title) ?? null;
    if (!planId && !title) return reply.code(400).send(bad("აირჩიე გეგმა ან დაწერე სათაური."));
    const lesson = await prisma.lesson.create({
      data: {
        studentId,
        groupId,
        planId,
        title,
        date,
        durationMin: typeof body.durationMin === "number" && body.durationMin > 0 ? Math.round(body.durationMin) : 75,
      },
    });
    return { id: lesson.id };
  });

  app.get("/v1/admin/lessons/:id", async (request, reply) => {
    if (!(await requireRole(request, reply, "ADMIN"))) return;
    const { id } = request.params as { id: string };
    const lesson = await prisma.lesson.findUnique({ where: { id }, include: lessonInclude });
    if (!lesson) return reply.code(404).send(bad("გაკვეთილი ვერ მოიძებნა.", "NOT_FOUND"));
    const items = resolveItems(lesson);
    const visible = visibleToStudent(items);
    const learners = lesson.group
      ? lesson.group.members.map((row) => ({ id: row.studentId, name: row.student.user.name }))
      : lesson.student
        ? [{ id: lesson.student.id, name: lesson.student.user.name }]
        : [];
    const progressRows = await prisma.lessonProgress.findMany({ where: { lessonId: id } });
    const progress = learners.map((learner) => {
      const mine = new Map(progressRows.filter((row) => row.studentId === learner.id).map((row) => [row.materialId, row]));
      const rows = visible.map((item) => ({ section: item.section, status: mine.get(item.materialId)?.status ?? "NOT_STARTED" }));
      return {
        studentId: learner.id,
        name: learner.name,
        status: lessonStatus(rows, lesson.heldAt !== null),
        counter: lessonCounter(rows),
        items: Object.fromEntries(visible.map((item) => [item.materialId, { status: mine.get(item.materialId)?.status ?? "NOT_STARTED", bestScore: mine.get(item.materialId)?.bestScore ?? null }])),
      };
    });
    return {
      id: lesson.id,
      title: lesson.title,
      displayTitle: lessonTitle(lesson),
      date: lesson.date.toISOString(),
      durationMin: lesson.durationMin,
      noteKa: lesson.noteKa,
      privateNote: lesson.privateNote,
      homeworkDueAt: lesson.homeworkDueAt?.toISOString() ?? null,
      publishedAt: lesson.publishedAt?.toISOString() ?? null,
      heldAt: lesson.heldAt?.toISOString() ?? null,
      isGift: lesson.isGift,
      audience: audienceOf(lesson),
      plan: lesson.plan
        ? {
            id: lesson.plan.id,
            titleKa: lesson.plan.titleKa,
            goalsKa: lesson.plan.goalsKa,
            teacherNotes: lesson.plan.teacherNotes,
            unit: lesson.plan.unit ? { id: lesson.plan.unit.id, titleKa: lesson.plan.unit.titleKa, course: lesson.plan.unit.course } : null,
          }
        : null,
      items: items.map((item) => ({
        key: item.key,
        source: item.source,
        planItemId: item.planItemId,
        materialId: item.materialId,
        section: item.section,
        noteKa: item.noteKa,
        planNoteKa: item.planItemId ? (lesson.plan?.items.find((row) => row.id === item.planItemId)?.noteKa ?? null) : null,
        hidden: item.hidden,
        held: item.held,
        title: item.material.title,
        type: item.material.type,
        estMinutes: item.material.estMinutes,
        health: itemHealth(item.material),
      })),
      progress,
    };
  });

  app.patch("/v1/admin/lessons/:id", async (request, reply) => {
    if (!(await requireRole(request, reply, "ADMIN"))) return;
    const { id } = request.params as { id: string };
    const body = (request.body ?? {}) as Record<string, unknown>;
    const date = optionalDate(body.date);
    const due = optionalDate(body.homeworkDueAt);
    const lesson = await prisma.lesson.findUnique({ where: { id }, select: { id: true, planId: true, title: true } });
    if (!lesson) return reply.code(404).send(bad("გაკვეთილი ვერ მოიძებნა.", "NOT_FOUND"));
    const planId = body.planId === null ? null : typeof body.planId === "string" ? body.planId : undefined;
    const title = nullableText(body.title);
    if ((planId === null || (planId === undefined && !lesson.planId)) && (title === null || (title === undefined && !lesson.title))) {
      return reply.code(400).send(bad("გეგმის გარეშე გაკვეთილს სათაური სჭირდება."));
    }
    await prisma.lesson.update({
      where: { id },
      data: {
        ...(title !== undefined ? { title } : {}),
        ...(date ? { date } : {}),
        ...(due !== undefined ? { homeworkDueAt: due } : {}),
        ...(nullableText(body.noteKa) !== undefined ? { noteKa: nullableText(body.noteKa) } : {}),
        ...(nullableText(body.privateNote) !== undefined ? { privateNote: nullableText(body.privateNote) } : {}),
        ...(body.durationMin === null ? { durationMin: null } : typeof body.durationMin === "number" && body.durationMin > 0 ? { durationMin: Math.round(body.durationMin) } : {}),
        ...(typeof body.isGift === "boolean" ? { isGift: body.isGift } : {}),
        ...(typeof body.held === "boolean" ? { heldAt: body.held ? new Date() : null } : {}),
        ...(planId !== undefined ? { planId } : {}),
      },
    });
    if (planId !== undefined && planId !== lesson.planId) {
      await prisma.lessonItem.deleteMany({ where: { lessonId: id, planItemId: { not: null } } });
    }
    return { ok: true };
  });

  /** Replaces this lesson's own layer on top of the plan: tweaks to plan items and extra items. */
  app.put("/v1/admin/lessons/:id/items", async (request, reply) => {
    if (!(await requireRole(request, reply, "ADMIN"))) return;
    const { id } = request.params as { id: string };
    const body = (request.body ?? {}) as { tweaks?: unknown; extras?: unknown };
    const lesson = await prisma.lesson.findUnique({ where: { id }, include: { plan: { select: { items: { select: { id: true, materialId: true } } } } } });
    if (!lesson) return reply.code(404).send(bad("გაკვეთილი ვერ მოიძებნა.", "NOT_FOUND"));
    const planItemIds = new Set(lesson.plan?.items.map((item) => item.id) ?? []);
    const planMaterials = new Set(lesson.plan?.items.map((item) => item.materialId) ?? []);
    const tweaks = (Array.isArray(body.tweaks) ? body.tweaks : []).flatMap((raw) => {
      const row = raw as { planItemId?: unknown; hidden?: unknown; held?: unknown; noteKa?: unknown };
      if (typeof row.planItemId !== "string" || !planItemIds.has(row.planItemId)) return [];
      const hidden = row.hidden === true;
      const held = row.held === true;
      const noteKa = nullableText(row.noteKa) ?? null;
      if (!hidden && !held && !noteKa) return [];
      return [{ lessonId: id, planItemId: row.planItemId, hidden, held, noteKa }];
    });
    const seen = new Set<string>();
    const perSection = new Map<string, number>();
    const extras = (Array.isArray(body.extras) ? body.extras : []).flatMap((raw) => {
      const row = raw as { materialId?: unknown; section?: unknown; held?: unknown; noteKa?: unknown };
      if (typeof row.materialId !== "string" || planMaterials.has(row.materialId) || seen.has(row.materialId)) return [];
      seen.add(row.materialId);
      const section = (typeof row.section === "string" && sections.has(row.section) ? row.section : "CLASS") as Section;
      const order = perSection.get(section) ?? 0;
      perSection.set(section, order + 1);
      return [{ lessonId: id, materialId: row.materialId, section, order, held: row.held === true, noteKa: nullableText(row.noteKa) ?? null }];
    });
    await prisma.$transaction([
      prisma.lessonItem.deleteMany({ where: { lessonId: id } }),
      ...(tweaks.length ? [prisma.lessonItem.createMany({ data: tweaks })] : []),
      ...(extras.length ? [prisma.lessonItem.createMany({ data: extras })] : []),
    ]);
    return { ok: true };
  });

  app.post("/v1/admin/lessons/:id/publish", async (request, reply) => {
    if (!(await requireRole(request, reply, "ADMIN"))) return;
    const { id } = request.params as { id: string };
    const published = (request.body as { published?: unknown } | undefined)?.published !== false;
    const lesson = await prisma.lesson.update({
      where: { id },
      data: { publishedAt: published ? new Date() : null },
      select: { publishedAt: true },
    });
    return { publishedAt: lesson.publishedAt?.toISOString() ?? null };
  });

  app.delete("/v1/admin/lessons/:id", async (request, reply) => {
    if (!(await requireRole(request, reply, "ADMIN"))) return;
    const { id } = request.params as { id: string };
    const progress = await prisma.lessonProgress.count({ where: { lessonId: id, status: { not: "NOT_STARTED" } } });
    if (progress > 0) return reply.code(409).send(bad("მოსწავლემ ამ გაკვეთილზე უკვე იმუშავა. წაშლის ნაცვლად დამალე (გამოქვეყნების მოხსნა).", "IN_USE"));
    await prisma.lesson.delete({ where: { id } });
    return { ok: true };
  });

  /** Turns what this lesson shows into a reusable plan (for lessons built without one). */
  app.post("/v1/admin/lessons/:id/save-as-plan", async (request, reply) => {
    if (!(await requireRole(request, reply, "ADMIN"))) return;
    const { id } = request.params as { id: string };
    const body = (request.body ?? {}) as { titleKa?: unknown; unitId?: unknown };
    const lesson = await prisma.lesson.findUnique({ where: { id }, include: lessonInclude });
    if (!lesson) return reply.code(404).send(bad("გაკვეთილი ვერ მოიძებნა.", "NOT_FOUND"));
    const items = resolveItems(lesson).filter((item) => !item.hidden);
    const titleKa = (typeof body.titleKa === "string" && body.titleKa.trim()) || lessonTitle(lesson);
    const unitId = typeof body.unitId === "string" && body.unitId ? body.unitId : null;
    const last = await prisma.lessonPlan.findFirst({ where: { unitId }, orderBy: { order: "desc" }, select: { order: true } });
    const perSection = new Map<string, number>();
    const plan = await prisma.lessonPlan.create({
      data: {
        titleKa,
        unitId,
        order: (last?.order ?? 0) + 1,
        goalsKa: lesson.plan?.goalsKa ?? [],
        items: {
          create: items.map((item) => {
            const order = perSection.get(item.section) ?? 0;
            perSection.set(item.section, order + 1);
            return { materialId: item.materialId, section: item.section, order, noteKa: item.noteKa };
          }),
        },
      },
    });
    return { id: plan.id };
  });
}
