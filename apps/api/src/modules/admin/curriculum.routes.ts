import type { FastifyInstance } from "fastify";
import { prisma } from "../../db.js";
import { requireRole } from "../auth/guard.js";
import { SECTIONS, type Section } from "../../domain/progress.js";
import { audienceOf, bad, itemHealth, lessonTitle, materialMeta } from "../lessons/load.js";

const sections = new Set<string>(SECTIONS);

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : undefined;
}

function nullableText(value: unknown) {
  if (value === null) return null;
  return typeof value === "string" ? value.trim() || null : undefined;
}

function slugify(value: string) {
  const base = value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return base || `course-${Date.now().toString(36)}`;
}

export async function adminCurriculumRoutes(app: FastifyInstance) {
  // ---------- courses ----------

  app.get("/v1/admin/courses", async (request, reply) => {
    if (!(await requireRole(request, reply, "ADMIN"))) return;
    const rows = await prisma.course.findMany({
      orderBy: [{ isArchived: "asc" }, { order: "asc" }],
      include: {
        units: { select: { _count: { select: { plans: true } } } },
        _count: { select: { enrollments: true, groups: true } },
      },
    });
    return {
      items: rows.map((course) => ({
        id: course.id,
        title: course.title,
        level: course.level,
        descriptionKa: course.descriptionKa,
        isArchived: course.isArchived,
        units: course.units.length,
        plans: course.units.reduce((sum, unit) => sum + unit._count.plans, 0),
        students: course._count.enrollments,
        groups: course._count.groups,
      })),
    };
  });

  app.post("/v1/admin/courses", async (request, reply) => {
    if (!(await requireRole(request, reply, "ADMIN"))) return;
    const body = (request.body ?? {}) as { title?: unknown; level?: unknown; descriptionKa?: unknown };
    const title = text(body.title);
    if (!title) return reply.code(400).send(bad("კურსის სახელი საჭიროა."));
    let slug = slugify(title);
    if (await prisma.course.findUnique({ where: { slug } })) slug = `${slug}-${Date.now().toString(36)}`;
    const last = await prisma.course.findFirst({ orderBy: { order: "desc" }, select: { order: true } });
    const course = await prisma.course.create({
      data: { title, slug, level: nullableText(body.level) ?? null, descriptionKa: nullableText(body.descriptionKa) ?? null, order: (last?.order ?? 0) + 1 },
    });
    return { id: course.id };
  });

  app.get("/v1/admin/courses/:id", async (request, reply) => {
    if (!(await requireRole(request, reply, "ADMIN"))) return;
    const { id } = request.params as { id: string };
    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        units: {
          orderBy: { order: "asc" },
          include: {
            plans: {
              orderBy: { order: "asc" },
              include: {
                items: { select: { section: true, material: { select: { status: true } } } },
                _count: { select: { lessons: true } },
              },
            },
          },
        },
        enrollments: { where: { status: "ACTIVE" }, select: { student: { select: { id: true, user: { select: { name: true } } } } } },
        groups: { where: { isArchived: false }, select: { id: true, name: true } },
      },
    });
    if (!course) return reply.code(404).send(bad("კურსი ვერ მოიძებნა.", "NOT_FOUND"));
    return {
      id: course.id,
      title: course.title,
      level: course.level,
      descriptionKa: course.descriptionKa,
      isArchived: course.isArchived,
      students: course.enrollments.map((row) => ({ id: row.student.id, name: row.student.user.name })),
      groups: course.groups,
      units: course.units.map((unit) => ({
        id: unit.id,
        order: unit.order,
        titleKa: unit.titleKa,
        titleEs: unit.titleEs,
        summaryKa: unit.summaryKa,
        plans: unit.plans.map((plan) => ({
          id: plan.id,
          order: plan.order,
          titleKa: plan.titleKa,
          titleEs: plan.titleEs,
          items: plan.items.length,
          homework: plan.items.filter((item) => item.section === "HOMEWORK").length,
          unpublished: plan.items.filter((item) => item.material.status !== "PUBLISHED").length,
          lessons: plan._count.lessons,
        })),
      })),
    };
  });

  app.patch("/v1/admin/courses/:id", async (request, reply) => {
    if (!(await requireRole(request, reply, "ADMIN"))) return;
    const { id } = request.params as { id: string };
    const body = (request.body ?? {}) as Record<string, unknown>;
    const title = text(body.title);
    if (body.title !== undefined && !title) return reply.code(400).send(bad("კურსის სახელი საჭიროა."));
    await prisma.course.update({
      where: { id },
      data: {
        ...(title ? { title } : {}),
        ...(nullableText(body.level) !== undefined ? { level: nullableText(body.level) } : {}),
        ...(nullableText(body.descriptionKa) !== undefined ? { descriptionKa: nullableText(body.descriptionKa) } : {}),
        ...(typeof body.isArchived === "boolean" ? { isArchived: body.isArchived } : {}),
      },
    });
    return { ok: true };
  });

  // ---------- units ----------

  app.post("/v1/admin/courses/:id/units", async (request, reply) => {
    if (!(await requireRole(request, reply, "ADMIN"))) return;
    const { id } = request.params as { id: string };
    const body = (request.body ?? {}) as { titleKa?: unknown; titleEs?: unknown };
    const titleKa = text(body.titleKa);
    if (!titleKa) return reply.code(400).send(bad("თავის სახელი საჭიროა."));
    const last = await prisma.unit.findFirst({ where: { courseId: id }, orderBy: { order: "desc" }, select: { order: true } });
    const unit = await prisma.unit.create({ data: { courseId: id, titleKa, titleEs: nullableText(body.titleEs) ?? null, order: (last?.order ?? 0) + 1 } });
    return { id: unit.id };
  });

  app.patch("/v1/admin/units/:id", async (request, reply) => {
    if (!(await requireRole(request, reply, "ADMIN"))) return;
    const { id } = request.params as { id: string };
    const body = (request.body ?? {}) as Record<string, unknown>;
    const titleKa = text(body.titleKa);
    if (body.titleKa !== undefined && !titleKa) return reply.code(400).send(bad("თავის სახელი საჭიროა."));
    await prisma.unit.update({
      where: { id },
      data: {
        ...(titleKa ? { titleKa } : {}),
        ...(nullableText(body.titleEs) !== undefined ? { titleEs: nullableText(body.titleEs) } : {}),
        ...(nullableText(body.summaryKa) !== undefined ? { summaryKa: nullableText(body.summaryKa) } : {}),
      },
    });
    return { ok: true };
  });

  app.delete("/v1/admin/units/:id", async (request, reply) => {
    if (!(await requireRole(request, reply, "ADMIN"))) return;
    const { id } = request.params as { id: string };
    const plans = await prisma.lessonPlan.count({ where: { unitId: id } });
    if (plans > 0) return reply.code(409).send(bad("ჯერ გადაიტანე ან წაშალე ამ თავის გეგმები.", "IN_USE"));
    await prisma.unit.delete({ where: { id } });
    return { ok: true };
  });

  app.post("/v1/admin/units/:id/move", async (request, reply) => {
    if (!(await requireRole(request, reply, "ADMIN"))) return;
    const { id } = request.params as { id: string };
    const up = (request.body as { direction?: string } | undefined)?.direction === "up";
    const unit = await prisma.unit.findUnique({ where: { id } });
    if (!unit) return reply.code(404).send(bad("თავი ვერ მოიძებნა.", "NOT_FOUND"));
    const siblings = await prisma.unit.findMany({ where: { courseId: unit.courseId }, orderBy: { order: "asc" }, select: { id: true } });
    await swapOrder(siblings.map((row) => row.id), id, up, (rowId, order) => prisma.unit.update({ where: { id: rowId }, data: { order } }));
    return { ok: true };
  });

  // ---------- lesson plans ----------

  app.get("/v1/admin/plans", async (request, reply) => {
    if (!(await requireRole(request, reply, "ADMIN"))) return;
    const rows = await prisma.lessonPlan.findMany({
      include: { unit: { select: { titleKa: true, order: true, course: { select: { id: true, title: true, order: true } } } }, _count: { select: { items: true } } },
    });
    const items = rows
      .map((plan) => ({
        id: plan.id,
        titleKa: plan.titleKa,
        titleEs: plan.titleEs,
        items: plan._count.items,
        courseId: plan.unit?.course.id ?? null,
        courseTitle: plan.unit?.course.title ?? null,
        unitTitle: plan.unit?.titleKa ?? null,
        sort: plan.unit ? [plan.unit.course.order, plan.unit.order, plan.order] : [9999, 0, plan.order],
      }))
      .sort((a, b) => a.sort[0]! - b.sort[0]! || a.sort[1]! - b.sort[1]! || a.sort[2]! - b.sort[2]!)
      .map((row) => {
        const { sort, ...rest } = row;
        void sort;
        return rest;
      });
    return { items };
  });

  app.post("/v1/admin/plans", async (request, reply) => {
    if (!(await requireRole(request, reply, "ADMIN"))) return;
    const body = (request.body ?? {}) as { titleKa?: unknown; titleEs?: unknown; unitId?: unknown };
    const titleKa = text(body.titleKa);
    if (!titleKa) return reply.code(400).send(bad("გეგმის სახელი საჭიროა."));
    const unitId = typeof body.unitId === "string" && body.unitId ? body.unitId : null;
    const last = await prisma.lessonPlan.findFirst({ where: { unitId }, orderBy: { order: "desc" }, select: { order: true } });
    const plan = await prisma.lessonPlan.create({
      data: { titleKa, titleEs: nullableText(body.titleEs) ?? null, unitId, order: (last?.order ?? 0) + 1, goalsKa: [] },
    });
    return { id: plan.id };
  });

  app.get("/v1/admin/plans/:id", async (request, reply) => {
    if (!(await requireRole(request, reply, "ADMIN"))) return;
    const { id } = request.params as { id: string };
    const plan = await prisma.lessonPlan.findUnique({
      where: { id },
      include: {
        unit: { select: { id: true, titleKa: true, course: { select: { id: true, title: true } } } },
        items: { orderBy: [{ section: "asc" }, { order: "asc" }], include: { material: { select: materialMeta } } },
        lessons: {
          orderBy: { date: "desc" },
          take: 30,
          select: {
            id: true,
            title: true,
            date: true,
            publishedAt: true,
            student: { select: { id: true, user: { select: { name: true } } } },
            group: { select: { id: true, name: true } },
          },
        },
      },
    });
    if (!plan) return reply.code(404).send(bad("გეგმა ვერ მოიძებნა.", "NOT_FOUND"));
    return {
      id: plan.id,
      titleKa: plan.titleKa,
      titleEs: plan.titleEs,
      goalsKa: plan.goalsKa,
      teacherNotes: plan.teacherNotes,
      estMinutes: plan.estMinutes,
      unit: plan.unit ? { id: plan.unit.id, titleKa: plan.unit.titleKa } : null,
      course: plan.unit ? plan.unit.course : null,
      items: plan.items.map((item) => ({
        id: item.id,
        materialId: item.materialId,
        section: item.section,
        order: item.order,
        noteKa: item.noteKa,
        title: item.material.title,
        type: item.material.type,
        estMinutes: item.material.estMinutes,
        health: itemHealth(item.material),
      })),
      lessons: plan.lessons.map((lesson) => ({
        id: lesson.id,
        title: lessonTitle({ title: lesson.title, plan }),
        date: lesson.date.toISOString(),
        published: lesson.publishedAt !== null,
        audience: audienceOf({ student: lesson.student, group: lesson.group ? { ...lesson.group, members: [] } : null }),
      })),
    };
  });

  app.patch("/v1/admin/plans/:id", async (request, reply) => {
    if (!(await requireRole(request, reply, "ADMIN"))) return;
    const { id } = request.params as { id: string };
    const body = (request.body ?? {}) as Record<string, unknown>;
    const titleKa = text(body.titleKa);
    if (body.titleKa !== undefined && !titleKa) return reply.code(400).send(bad("გეგმის სახელი საჭიროა."));
    const goals = Array.isArray(body.goalsKa)
      ? body.goalsKa.filter((goal): goal is string => typeof goal === "string").map((goal) => goal.trim()).filter(Boolean).slice(0, 12)
      : undefined;
    const unitId = body.unitId === null ? null : typeof body.unitId === "string" ? body.unitId : undefined;
    await prisma.lessonPlan.update({
      where: { id },
      data: {
        ...(titleKa ? { titleKa } : {}),
        ...(nullableText(body.titleEs) !== undefined ? { titleEs: nullableText(body.titleEs) } : {}),
        ...(nullableText(body.teacherNotes) !== undefined ? { teacherNotes: nullableText(body.teacherNotes) } : {}),
        ...(goals ? { goalsKa: goals } : {}),
        ...(body.estMinutes === null ? { estMinutes: null } : typeof body.estMinutes === "number" && body.estMinutes > 0 ? { estMinutes: Math.round(body.estMinutes) } : {}),
        ...(unitId !== undefined ? { unitId } : {}),
      },
    });
    return { ok: true };
  });

  app.delete("/v1/admin/plans/:id", async (request, reply) => {
    if (!(await requireRole(request, reply, "ADMIN"))) return;
    const { id } = request.params as { id: string };
    const lessons = await prisma.lesson.count({ where: { planId: id } });
    if (lessons > 0) return reply.code(409).send(bad("ეს გეგმა გაკვეთილებში გამოიყენება. წაშლის ნაცვლად გადაიტანე სხვა თავში.", "IN_USE"));
    await prisma.lessonPlan.delete({ where: { id } });
    return { ok: true };
  });

  app.post("/v1/admin/plans/:id/move", async (request, reply) => {
    if (!(await requireRole(request, reply, "ADMIN"))) return;
    const { id } = request.params as { id: string };
    const up = (request.body as { direction?: string } | undefined)?.direction === "up";
    const plan = await prisma.lessonPlan.findUnique({ where: { id } });
    if (!plan) return reply.code(404).send(bad("გეგმა ვერ მოიძებნა.", "NOT_FOUND"));
    const siblings = await prisma.lessonPlan.findMany({ where: { unitId: plan.unitId }, orderBy: { order: "asc" }, select: { id: true } });
    await swapOrder(siblings.map((row) => row.id), id, up, (rowId, order) => prisma.lessonPlan.update({ where: { id: rowId }, data: { order } }));
    return { ok: true };
  });

  app.post("/v1/admin/plans/:id/duplicate", async (request, reply) => {
    if (!(await requireRole(request, reply, "ADMIN"))) return;
    const { id } = request.params as { id: string };
    const source = await prisma.lessonPlan.findUnique({ where: { id }, include: { items: true } });
    if (!source) return reply.code(404).send(bad("გეგმა ვერ მოიძებნა.", "NOT_FOUND"));
    const copy = await prisma.lessonPlan.create({
      data: {
        unitId: source.unitId,
        order: source.order + 1,
        titleKa: `${source.titleKa} (ასლი)`,
        titleEs: source.titleEs,
        goalsKa: source.goalsKa,
        teacherNotes: source.teacherNotes,
        estMinutes: source.estMinutes,
        items: { create: source.items.map((item) => ({ materialId: item.materialId, section: item.section, order: item.order, noteKa: item.noteKa })) },
      },
    });
    return { id: copy.id };
  });

  /** Replaces the plan's item list. Rows are matched by material so lesson overrides keep pointing at them. */
  app.put("/v1/admin/plans/:id/items", async (request, reply) => {
    if (!(await requireRole(request, reply, "ADMIN"))) return;
    const { id } = request.params as { id: string };
    const body = (request.body ?? {}) as { items?: unknown };
    if (!Array.isArray(body.items)) return reply.code(400).send(bad("სია არასწორია."));
    const incoming = body.items.flatMap((raw) => {
      const row = raw as { materialId?: unknown; section?: unknown; noteKa?: unknown };
      if (typeof row.materialId !== "string") return [];
      const section = (typeof row.section === "string" && sections.has(row.section) ? row.section : "CLASS") as Section;
      return [{ materialId: row.materialId, section, noteKa: nullableText(row.noteKa) ?? null }];
    });
    const unique = [...new Map(incoming.map((row) => [row.materialId, row])).values()];
    const plan = await prisma.lessonPlan.findUnique({ where: { id }, include: { items: true } });
    if (!plan) return reply.code(404).send(bad("გეგმა ვერ მოიძებნა.", "NOT_FOUND"));
    const existing = new Map(plan.items.map((item) => [item.materialId, item]));
    const keep = new Set(unique.map((row) => row.materialId));
    const perSection = new Map<string, number>();
    await prisma.$transaction([
      prisma.planItem.deleteMany({ where: { planId: id, materialId: { notIn: [...keep] } } }),
      ...unique.map((row) => {
        const order = perSection.get(row.section) ?? 0;
        perSection.set(row.section, order + 1);
        const current = existing.get(row.materialId);
        return current
          ? prisma.planItem.update({ where: { id: current.id }, data: { section: row.section, order, noteKa: row.noteKa } })
          : prisma.planItem.create({ data: { planId: id, materialId: row.materialId, section: row.section, order, noteKa: row.noteKa } });
      }),
      prisma.lessonPlan.update({ where: { id }, data: { updatedAt: new Date() } }),
    ]);
    return { ok: true };
  });
}

async function swapOrder(ids: string[], id: string, up: boolean, write: (id: string, order: number) => Promise<unknown>) {
  const index = ids.indexOf(id);
  const target = up ? index - 1 : index + 1;
  if (index < 0 || target < 0 || target >= ids.length) return;
  const next = [...ids];
  [next[index], next[target]] = [next[target]!, next[index]!];
  await prisma.$transaction(next.map((rowId, order) => write(rowId, order + 1) as never));
}
