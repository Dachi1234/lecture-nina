import type { FastifyInstance } from "fastify";
import { prisma } from "../../db.js";
import { requireRole } from "../auth/guard.js";

export async function adminDashboardRoutes(app: FastifyInstance) {
  app.get("/v1/admin/dashboard", async (request, reply) => {
    const admin = await requireRole(request, reply, "ADMIN");
    if (!admin) return;
    const now = new Date();
    const [newLeads, students, overdue, recent] = await Promise.all([
      prisma.lead.count({ where: { status: "NEW" } }),
      prisma.studentProfile.findMany({
        where: { nextLessonAt: { not: null } },
        include: { user: { select: { name: true } } },
        orderBy: { nextLessonAt: "asc" },
      }),
      prisma.assignment.findMany({
        where: { kind: "HOMEWORK", dueAt: { lt: now }, readyForStudent: true },
        include: {
          material: { select: { title: true } },
          student: { select: { user: { select: { name: true } } } },
          lesson: { select: { number: true } },
        },
      }),
      prisma.materialProgress.findMany({
        where: { status: "COMPLETED", completedAt: { not: null } },
        orderBy: { completedAt: "desc" },
        take: 8,
        include: { material: { select: { title: true } }, student: { select: { user: { select: { name: true } } } } },
      }),
    ]);
    const progress = await prisma.materialProgress.findMany({
      where: { materialId: { in: overdue.map((item) => item.materialId) }, studentId: { in: overdue.map((item) => item.studentId) } },
    });
    const done = new Set(progress.filter((row) => row.status === "COMPLETED").map((row) => `${row.studentId}:${row.materialId}`));
    return {
      newLeads,
      upcoming: students
        .filter((student) => student.nextLessonAt && student.nextLessonAt >= now)
        .slice(0, 8)
        .map((student) => ({ name: student.user.name, at: student.nextLessonAt!.toISOString() })),
      overdue: overdue
        .filter((item) => !done.has(`${item.studentId}:${item.materialId}`))
        .map((item) => ({
          studentName: item.student.user.name,
          title: item.material.title,
          dueAt: item.dueAt?.toISOString() ?? null,
          lessonNumber: item.lesson?.number ?? null,
        })),
      recent: recent.map((row) => ({
        studentName: row.student.user.name,
        title: row.material.title,
        completedAt: row.completedAt?.toISOString() ?? null,
      })),
    };
  });
}
