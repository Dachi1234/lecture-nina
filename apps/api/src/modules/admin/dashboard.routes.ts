import type { FastifyInstance } from "fastify";
import { prisma } from "../../db.js";
import { requireRole } from "../auth/guard.js";
import { audienceOf, lessonInclude, lessonTitle, resolveItems, visibleToStudent } from "../lessons/load.js";

const day = 1000 * 60 * 60 * 24;

export async function adminDashboardRoutes(app: FastifyInstance) {
  app.get("/v1/admin/dashboard", async (request, reply) => {
    if (!(await requireRole(request, reply, "ADMIN"))) return;
    const now = new Date();
    const [newLeads, upcoming, dueLessons, recent, counts] = await Promise.all([
      prisma.lead.count({ where: { status: "NEW" } }),
      prisma.lesson.findMany({
        where: { date: { gte: new Date(now.getTime() - 1000 * 60 * 90), lte: new Date(now.getTime() + 14 * day) } },
        orderBy: { date: "asc" },
        take: 12,
        include: lessonInclude,
      }),
      prisma.lesson.findMany({
        where: { publishedAt: { not: null }, homeworkDueAt: { lt: now, gt: new Date(now.getTime() - 21 * day) } },
        include: lessonInclude,
      }),
      prisma.lessonProgress.findMany({
        where: { status: "COMPLETED", completedAt: { not: null } },
        orderBy: { completedAt: "desc" },
        take: 8,
        include: { material: { select: { title: true } }, student: { select: { id: true, user: { select: { name: true } } } } },
      }),
      Promise.all([prisma.studentProfile.count(), prisma.group.count({ where: { isArchived: false } }), prisma.lessonPlan.count(), prisma.material.count({ where: { status: { not: "ARCHIVED" } } })]),
    ]);

    const homeworkProgress = await prisma.lessonProgress.findMany({
      where: { lessonId: { in: dueLessons.map((lesson) => lesson.id) }, status: "COMPLETED" },
      select: { lessonId: true, studentId: true, materialId: true },
    });
    const done = new Set(homeworkProgress.map((row) => `${row.lessonId}:${row.studentId}:${row.materialId}`));
    const overdue = dueLessons.flatMap((lesson) => {
      const homework = visibleToStudent(resolveItems(lesson)).filter((item) => item.section === "HOMEWORK");
      const learners = lesson.group
        ? lesson.group.members.map((row) => ({ id: row.studentId, name: row.student.user.name }))
        : lesson.student
          ? [{ id: lesson.student.id, name: lesson.student.user.name }]
          : [];
      return learners.flatMap((learner) => {
        const open = homework.filter((item) => !done.has(`${lesson.id}:${learner.id}:${item.materialId}`));
        return open.length
          ? [{ lessonId: lesson.id, lessonTitle: lessonTitle(lesson), studentId: learner.id, studentName: learner.name, open: open.length, dueAt: lesson.homeworkDueAt!.toISOString() }]
          : [];
      });
    });

    return {
      newLeads,
      counts: { students: counts[0], groups: counts[1], plans: counts[2], materials: counts[3] },
      upcoming: upcoming.map((lesson) => {
        const items = resolveItems(lesson);
        return {
          id: lesson.id,
          title: lessonTitle(lesson),
          date: lesson.date.toISOString(),
          audience: audienceOf(lesson),
          published: lesson.publishedAt !== null,
          items: visibleToStudent(items).length,
          problems: items.filter((item) => !item.hidden && item.material.status !== "PUBLISHED").length,
        };
      }),
      overdue,
      recent: recent.map((row) => ({
        studentId: row.student.id,
        studentName: row.student.user.name,
        lessonId: row.lessonId,
        title: row.material.title,
        completedAt: row.completedAt?.toISOString() ?? null,
      })),
    };
  });
}
