import { randomBytes, randomUUID } from "node:crypto";
import type { FastifyInstance } from "fastify";
import { hashPassword } from "better-auth/crypto";
import { prisma } from "../../db.js";
import { lessonCounter, lessonStatus, numberLessons, syllabusProgress } from "../../domain/progress.js";
import { requireRole } from "../auth/guard.js";
import { audienceLessonWhere, bad, groupIdsFor, lessonInclude, lessonTitle, resolveItems, visibleToStudent } from "../lessons/load.js";
import { courseSyllabus } from "../lessons/syllabus.js";

export async function adminStudentRoutes(app: FastifyInstance) {
  app.get("/v1/admin/students", async (request, reply) => {
    if (!(await requireRole(request, reply, "ADMIN"))) return;
    const now = new Date();
    const rows = await prisma.studentProfile.findMany({
      include: {
        user: { include: { invites: { orderBy: { createdAt: "desc" }, take: 1 } } },
        enrollments: { where: { status: "ACTIVE" }, select: { course: { select: { id: true, title: true } } } },
        memberships: { select: { group: { select: { id: true, name: true } } } },
      },
      orderBy: { user: { name: "asc" } },
    });
    const lessons = await prisma.lesson.findMany({
      where: { date: { gte: now } },
      orderBy: { date: "asc" },
      select: { date: true, studentId: true, groupId: true },
    });
    return {
      items: rows.map((profile) => {
        const groupIds = new Set(profile.memberships.map((row) => row.group.id));
        const next = lessons.find((lesson) => lesson.studentId === profile.id || (lesson.groupId && groupIds.has(lesson.groupId)));
        const invite = profile.user.invites[0];
        return {
          id: profile.id,
          name: profile.user.name,
          email: profile.user.email,
          isActive: profile.user.isActive,
          courses: profile.enrollments.map((row) => row.course),
          groups: profile.memberships.map((row) => row.group),
          nextLessonAt: next?.date.toISOString() ?? null,
          invite: invite ? (invite.acceptedAt ? "accepted" : "sent") : "none",
        };
      }),
    };
  });

  app.post("/v1/admin/students", async (request, reply) => {
    if (!(await requireRole(request, reply, "ADMIN"))) return;
    const body = request.body as { name?: string; email?: string; nameLatin?: string; phone?: string; courseId?: string; groupId?: string };
    const name = body.name?.trim() ?? "";
    const email = body.email?.trim().toLowerCase() ?? "";
    if (!name || !email.includes("@")) return reply.code(400).send(bad("სახელი და ელ-ფოსტა საჭიროა."));
    const taken = await prisma.user.findUnique({ where: { email } });
    if (taken) return reply.code(409).send(bad("ეს ელ-ფოსტა უკვე გამოყენებულია.", "CONFLICT"));
    const course = body.courseId
      ? await prisma.course.findUnique({ where: { id: body.courseId } })
      : await prisma.course.findFirst({ where: { isArchived: false }, orderBy: { order: "asc" } });
    const user = await prisma.user.create({
      data: { email, name, nameLatin: body.nameLatin?.trim() || null, role: "STUDENT", emailVerified: true },
    });
    await prisma.account.create({
      data: {
        id: randomUUID(),
        accountId: user.id,
        providerId: "credential",
        userId: user.id,
        password: await hashPassword(randomBytes(24).toString("hex")),
      },
    });
    const profile = await prisma.studentProfile.create({
      data: {
        userId: user.id,
        phone: body.phone?.trim() || null,
        ...(course ? { enrollments: { create: { courseId: course.id } } } : {}),
        ...(body.groupId ? { memberships: { create: { groupId: body.groupId } } } : {}),
      },
    });
    const token = randomBytes(24).toString("hex");
    await prisma.invite.create({
      data: { token, email, userId: user.id, expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7) },
    });
    return { id: profile.id, url: `${process.env.WEB_ORIGIN ?? "http://localhost:3000"}/invite/${token}` };
  });

  app.get("/v1/admin/students/:id", async (request, reply) => {
    if (!(await requireRole(request, reply, "ADMIN"))) return;
    const { id } = request.params as { id: string };
    const profile = await prisma.studentProfile.findUnique({
      where: { id },
      include: {
        user: { include: { invites: { orderBy: { createdAt: "desc" }, take: 1 } } },
        enrollments: { include: { course: { select: { id: true, title: true, level: true } } }, orderBy: { startedAt: "asc" } },
        memberships: { select: { group: { select: { id: true, name: true } } } },
        attempts: { orderBy: { createdAt: "desc" }, take: 20 },
        notes: { orderBy: { createdAt: "desc" } },
        checklist: { orderBy: { order: "asc" } },
        words: { orderBy: { createdAt: "desc" } },
      },
    });
    if (!profile) return reply.code(404).send(bad("მოსწავლე ვერ მოიძებნა.", "NOT_FOUND"));
    const groupIds = await groupIdsFor(profile.id);
    const lessons = await prisma.lesson.findMany({ where: audienceLessonWhere(profile.id, groupIds), include: lessonInclude, orderBy: { date: "desc" } });
    const progressRows = await prisma.lessonProgress.findMany({ where: { studentId: profile.id } });
    const key = (lessonId: string, materialId: string) => `${lessonId}:${materialId}`;
    const progress = new Map(progressRows.map((row) => [key(row.lessonId, row.materialId), row]));
    const numbers = numberLessons(lessons);
    const syllabus = await Promise.all(
      profile.enrollments.map(async (enrollment) => ({
        enrollmentId: enrollment.id,
        course: enrollment.course,
        status: enrollment.status,
        progress: syllabusProgress(await courseSyllabus(enrollment.courseId), lessons),
      })),
    );
    const titles = new Map(
      (await prisma.material.findMany({ where: { id: { in: profile.attempts.map((attempt) => attempt.materialId) } }, select: { id: true, title: true } })).map((row) => [row.id, row.title]),
    );
    const invite = profile.user.invites[0];
    return {
      id: profile.id,
      name: profile.user.name,
      nameLatin: profile.user.nameLatin,
      email: profile.user.email,
      isActive: profile.user.isActive,
      phone: profile.phone,
      channel: profile.preferredChannel,
      goal: profile.goal,
      goalNote: profile.goalNote,
      greetingForm: profile.greetingForm,
      giftLessonsLeft: profile.giftLessonsLeft,
      invite: invite ? (invite.acceptedAt ? "accepted" : "sent") : "none",
      groups: profile.memberships.map((row) => row.group),
      syllabus,
      lessons: lessons.map((lesson) => {
        const visible = visibleToStudent(resolveItems(lesson));
        const rows = visible.map((item) => ({ section: item.section, status: progress.get(key(lesson.id, item.materialId))?.status ?? "NOT_STARTED" }));
        return {
          id: lesson.id,
          number: numbers.get(lesson.id) ?? 0,
          title: lessonTitle(lesson),
          date: lesson.date.toISOString(),
          published: lesson.publishedAt !== null,
          held: lesson.heldAt !== null,
          group: lesson.group ? { id: lesson.group.id, name: lesson.group.name } : null,
          status: lessonStatus(rows, lesson.heldAt !== null),
          counter: lessonCounter(rows),
        };
      }),
      attempts: profile.attempts.map((attempt) => ({
        id: attempt.id,
        materialId: attempt.materialId,
        lessonId: attempt.lessonId,
        title: titles.get(attempt.materialId) ?? "",
        score: attempt.score,
        correct: attempt.correct,
        total: attempt.total,
        finishedAt: attempt.finishedAt?.toISOString() ?? null,
      })),
      notes: profile.notes.map((note) => ({ id: note.id, body: note.body, visibleToStudent: note.visibleToStudent, createdAt: note.createdAt.toISOString() })),
      checklist: profile.checklist.map((item) => ({ id: item.id, text: item.text, done: item.done })),
      words: profile.words.map((word) => ({ id: word.id, es: word.es, ka: word.ka, en: word.en, noteKa: word.noteKa })),
    };
  });

  app.patch("/v1/admin/students/:id", async (request, reply) => {
    if (!(await requireRole(request, reply, "ADMIN"))) return;
    const { id } = request.params as { id: string };
    const body = request.body as {
      name?: string;
      phone?: string | null;
      goal?: string | null;
      channel?: string | null;
      goalNote?: string | null;
      greetingForm?: string;
      giftLessonsLeft?: number;
      nameLatin?: string | null;
      isActive?: boolean;
    };
    const profile = await prisma.studentProfile.findUnique({ where: { id } });
    if (!profile) return reply.code(404).send(bad("მოსწავლე ვერ მოიძებნა.", "NOT_FOUND"));
    await prisma.studentProfile.update({
      where: { id },
      data: {
        ...(body.phone === null || typeof body.phone === "string" ? { phone: body.phone } : {}),
        ...(body.goal === null || typeof body.goal === "string" ? { goal: (body.goal || null) as "TRAVEL" | null } : {}),
        ...(body.channel === null || typeof body.channel === "string" ? { preferredChannel: (body.channel || null) as "PHONE" | null } : {}),
        ...(body.goalNote === null || typeof body.goalNote === "string" ? { goalNote: body.goalNote } : {}),
        ...(typeof body.greetingForm === "string" ? { greetingForm: body.greetingForm } : {}),
        ...(typeof body.giftLessonsLeft === "number" ? { giftLessonsLeft: body.giftLessonsLeft } : {}),
      },
    });
    await prisma.user.update({
      where: { id: profile.userId },
      data: {
        ...(body.nameLatin === null || typeof body.nameLatin === "string" ? { nameLatin: body.nameLatin } : {}),
        ...(typeof body.name === "string" && body.name.trim() ? { name: body.name.trim() } : {}),
        ...(typeof body.isActive === "boolean" ? { isActive: body.isActive } : {}),
      },
    });
    return { ok: true };
  });

  app.put("/v1/admin/students/:id/enrollments", async (request, reply) => {
    if (!(await requireRole(request, reply, "ADMIN"))) return;
    const { id } = request.params as { id: string };
    const body = (request.body ?? {}) as { enrollments?: unknown };
    if (!Array.isArray(body.enrollments)) return reply.code(400).send(bad("სია არასწორია."));
    const rows = body.enrollments.flatMap((raw) => {
      const row = raw as { courseId?: unknown; status?: unknown };
      if (typeof row.courseId !== "string") return [];
      const status: "ACTIVE" | "PAUSED" | "COMPLETED" = row.status === "PAUSED" || row.status === "COMPLETED" ? row.status : "ACTIVE";
      return [{ courseId: row.courseId, status }];
    });
    await prisma.$transaction([
      prisma.enrollment.deleteMany({ where: { studentId: id, courseId: { notIn: rows.map((row) => row.courseId) } } }),
      ...rows.map((row) =>
        prisma.enrollment.upsert({
          where: { studentId_courseId: { studentId: id, courseId: row.courseId } },
          create: { studentId: id, courseId: row.courseId, status: row.status },
          update: { status: row.status },
        }),
      ),
    ]);
    return { ok: true };
  });

  app.post("/v1/admin/students/:id/notes", async (request, reply) => {
    if (!(await requireRole(request, reply, "ADMIN"))) return;
    const { id } = request.params as { id: string };
    const body = request.body as { body?: string; visibleToStudent?: boolean };
    if (!body.body?.trim()) return reply.code(400).send(bad("შენიშვნა ცარიელია."));
    const note = await prisma.teacherNote.create({
      data: { studentId: id, body: body.body.trim(), visibleToStudent: body.visibleToStudent !== false },
    });
    return { id: note.id };
  });

  app.delete("/v1/admin/students/:id/notes/:noteId", async (request, reply) => {
    if (!(await requireRole(request, reply, "ADMIN"))) return;
    const { id, noteId } = request.params as { id: string; noteId: string };
    await prisma.teacherNote.deleteMany({ where: { id: noteId, studentId: id } });
    return { ok: true };
  });

  app.post("/v1/admin/students/:id/checklist", async (request, reply) => {
    if (!(await requireRole(request, reply, "ADMIN"))) return;
    const { id } = request.params as { id: string };
    const body = request.body as { text?: string };
    if (!body.text?.trim()) return reply.code(400).send(bad("პუნქტი ცარიელია."));
    const last = await prisma.checklistItem.findFirst({ where: { studentId: id }, orderBy: { order: "desc" }, select: { order: true } });
    const item = await prisma.checklistItem.create({ data: { studentId: id, text: body.text.trim(), order: (last?.order ?? 0) + 1 } });
    return { id: item.id };
  });

  app.patch("/v1/admin/students/:id/checklist/:itemId", async (request, reply) => {
    if (!(await requireRole(request, reply, "ADMIN"))) return;
    const { id, itemId } = request.params as { id: string; itemId: string };
    const body = request.body as { done?: boolean };
    await prisma.checklistItem.updateMany({ where: { id: itemId, studentId: id }, data: { done: Boolean(body.done) } });
    return { ok: true };
  });

  app.delete("/v1/admin/students/:id/checklist/:itemId", async (request, reply) => {
    if (!(await requireRole(request, reply, "ADMIN"))) return;
    const { id, itemId } = request.params as { id: string; itemId: string };
    await prisma.checklistItem.deleteMany({ where: { id: itemId, studentId: id } });
    return { ok: true };
  });

  app.post("/v1/admin/students/:id/words", async (request, reply) => {
    if (!(await requireRole(request, reply, "ADMIN"))) return;
    const { id } = request.params as { id: string };
    const body = request.body as { es?: string; ka?: string; en?: string; noteKa?: string };
    if (!body.es?.trim() || !body.ka?.trim()) return reply.code(400).send(bad("ესპანური და ქართული საჭიროა."));
    const word = await prisma.personalWord.create({
      data: { studentId: id, es: body.es.trim(), ka: body.ka.trim(), en: body.en?.trim() || null, noteKa: body.noteKa?.trim() || null },
    });
    return { id: word.id };
  });

  app.delete("/v1/admin/students/:id/words/:wordId", async (request, reply) => {
    if (!(await requireRole(request, reply, "ADMIN"))) return;
    const { id, wordId } = request.params as { id: string; wordId: string };
    await prisma.personalWord.deleteMany({ where: { id: wordId, studentId: id } });
    return { ok: true };
  });
}
