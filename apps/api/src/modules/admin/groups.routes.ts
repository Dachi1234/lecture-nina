import type { FastifyInstance } from "fastify";
import { prisma } from "../../db.js";
import { requireRole } from "../auth/guard.js";
import { syllabusProgress } from "../../domain/progress.js";
import { bad, lessonTitle } from "../lessons/load.js";
import { courseSyllabus } from "../lessons/syllabus.js";

export async function adminGroupRoutes(app: FastifyInstance) {
  app.get("/v1/admin/groups", async (request, reply) => {
    if (!(await requireRole(request, reply, "ADMIN"))) return;
    const now = new Date();
    const rows = await prisma.group.findMany({
      orderBy: [{ isArchived: "asc" }, { name: "asc" }],
      include: {
        course: { select: { id: true, title: true } },
        members: { select: { student: { select: { id: true, user: { select: { name: true } } } } } },
        lessons: { where: { date: { gte: now } }, orderBy: { date: "asc" }, take: 1, select: { id: true, date: true } },
      },
    });
    return {
      items: rows.map((group) => ({
        id: group.id,
        name: group.name,
        isArchived: group.isArchived,
        course: group.course,
        members: group.members.map((row) => ({ id: row.student.id, name: row.student.user.name })),
        nextLessonAt: group.lessons[0]?.date.toISOString() ?? null,
      })),
    };
  });

  app.post("/v1/admin/groups", async (request, reply) => {
    if (!(await requireRole(request, reply, "ADMIN"))) return;
    const body = (request.body ?? {}) as { name?: unknown; courseId?: unknown; studentIds?: unknown };
    const name = typeof body.name === "string" ? body.name.trim() : "";
    if (!name) return reply.code(400).send(bad("ჯგუფის სახელი საჭიროა."));
    const studentIds = Array.isArray(body.studentIds) ? body.studentIds.filter((id): id is string => typeof id === "string") : [];
    const group = await prisma.group.create({
      data: {
        name,
        courseId: typeof body.courseId === "string" && body.courseId ? body.courseId : null,
        members: { create: studentIds.map((studentId) => ({ studentId })) },
      },
    });
    return { id: group.id };
  });

  app.get("/v1/admin/groups/:id", async (request, reply) => {
    if (!(await requireRole(request, reply, "ADMIN"))) return;
    const { id } = request.params as { id: string };
    const group = await prisma.group.findUnique({
      where: { id },
      include: {
        course: { select: { id: true, title: true } },
        members: { orderBy: { joinedAt: "asc" }, select: { joinedAt: true, student: { select: { id: true, user: { select: { name: true, email: true } } } } } },
        lessons: { orderBy: { date: "desc" }, include: { plan: { select: { titleKa: true } } } },
      },
    });
    if (!group) return reply.code(404).send(bad("ჯგუფი ვერ მოიძებნა.", "NOT_FOUND"));
    const units = group.courseId ? await courseSyllabus(group.courseId) : [];
    const syllabus = group.courseId ? syllabusProgress(units, group.lessons) : null;
    return {
      id: group.id,
      name: group.name,
      noteKa: group.noteKa,
      isArchived: group.isArchived,
      course: group.course,
      members: group.members.map((row) => ({ id: row.student.id, name: row.student.user.name, email: row.student.user.email, joinedAt: row.joinedAt.toISOString() })),
      lessons: group.lessons.map((lesson) => ({
        id: lesson.id,
        title: lessonTitle(lesson),
        date: lesson.date.toISOString(),
        published: lesson.publishedAt !== null,
        held: lesson.heldAt !== null,
      })),
      syllabus,
    };
  });

  app.patch("/v1/admin/groups/:id", async (request, reply) => {
    if (!(await requireRole(request, reply, "ADMIN"))) return;
    const { id } = request.params as { id: string };
    const body = (request.body ?? {}) as Record<string, unknown>;
    const name = typeof body.name === "string" ? body.name.trim() : undefined;
    if (body.name !== undefined && !name) return reply.code(400).send(bad("ჯგუფის სახელი საჭიროა."));
    await prisma.group.update({
      where: { id },
      data: {
        ...(name ? { name } : {}),
        ...(body.courseId === null || typeof body.courseId === "string" ? { courseId: (body.courseId as string | null) || null } : {}),
        ...(body.noteKa === null || typeof body.noteKa === "string" ? { noteKa: (body.noteKa as string | null)?.trim() || null } : {}),
        ...(typeof body.isArchived === "boolean" ? { isArchived: body.isArchived } : {}),
      },
    });
    return { ok: true };
  });

  app.put("/v1/admin/groups/:id/members", async (request, reply) => {
    if (!(await requireRole(request, reply, "ADMIN"))) return;
    const { id } = request.params as { id: string };
    const body = (request.body ?? {}) as { studentIds?: unknown };
    if (!Array.isArray(body.studentIds)) return reply.code(400).send(bad("სია არასწორია."));
    const ids = [...new Set(body.studentIds.filter((value): value is string => typeof value === "string"))];
    await prisma.$transaction([
      prisma.groupMember.deleteMany({ where: { groupId: id, studentId: { notIn: ids } } }),
      ...ids.map((studentId) =>
        prisma.groupMember.upsert({ where: { groupId_studentId: { groupId: id, studentId } }, create: { groupId: id, studentId }, update: {} }),
      ),
    ]);
    return { ok: true };
  });
}
