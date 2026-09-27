import { randomBytes, randomUUID } from "node:crypto";
import type { FastifyInstance } from "fastify";
import { hashPassword } from "better-auth/crypto";
import { prisma } from "../../db.js";
import { lessonCounter, lessonStatus, type LessonSnapshot, type ProgressItem } from "../../domain/progress.js";
import { requireRole } from "../auth/guard.js";

export async function adminStudentRoutes(app: FastifyInstance) {
  app.get("/v1/admin/students", async (request, reply) => {
    const admin = await requireRole(request, reply, "ADMIN");
    if (!admin) return;
    const rows = await prisma.studentProfile.findMany({
      include: {
        user: { include: { invites: { orderBy: { createdAt: "desc" }, take: 1 } } },
        lessons: {
          include: {
            topics: { include: { topic: { select: { number: true } } } },
            items: { include: { material: { select: { title: true } } } },
          },
        },
        progress: true,
      },
      orderBy: { user: { name: "asc" } },
    });
    return {
      items: rows.map((profile) => {
        const snapshots = profile.lessons.map((lesson) => toSnapshot(lesson, profile.progress));
        const counters = snapshots.map((lesson) => lessonCounter(lesson.items));
        const completed = counters.reduce((sum, item) => sum + item.completed, 0);
        const total = counters.reduce((sum, item) => sum + item.total, 0);
        const current = [...snapshots].sort((a, b) => b.date.localeCompare(a.date)).find((lesson) => lessonStatus(lesson) !== "DONE");
        const invite = profile.user.invites[0];
        return {
          id: profile.id,
          name: profile.user.name,
          email: profile.user.email,
          nextLessonAt: profile.nextLessonAt?.toISOString() ?? null,
          progress: total === 0 ? 0 : Math.round((completed / total) * 100),
          currentLesson: current ? { number: current.number, title: profile.lessons.find((lesson) => lesson.id === current.id)?.title ?? "" } : null,
          invite: invite ? (invite.acceptedAt ? "accepted" : "sent") : "none",
        };
      }),
    };
  });

  app.post("/v1/admin/students", async (request, reply) => {
    const admin = await requireRole(request, reply, "ADMIN");
    if (!admin) return;
    const body = request.body as { name?: string; email?: string; nameLatin?: string; phone?: string };
    const name = body.name?.trim() ?? "";
    const email = body.email?.trim().toLowerCase() ?? "";
    if (!name || !email.includes("@")) {
      return reply.code(400).send({ error: { code: "VALIDATION", messageKa: "სახელი და ელ-ფოსტა საჭიროა." } });
    }
    const taken = await prisma.user.findUnique({ where: { email } });
    if (taken) return reply.code(409).send({ error: { code: "CONFLICT", messageKa: "ეს ელ-ფოსტა უკვე გამოყენებულია." } });
    const course = await prisma.course.findFirst({ orderBy: { order: "asc" } });
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
      data: { userId: user.id, phone: body.phone?.trim() || null, courseId: course?.id },
    });
    const token = randomBytes(24).toString("hex");
    await prisma.invite.create({
      data: { token, email, userId: user.id, expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7) },
    });
    return { id: profile.id, url: `${process.env.WEB_ORIGIN ?? "http://localhost:3000"}/invite/${token}` };
  });

  app.get("/v1/admin/students/:id", async (request, reply) => {
    const admin = await requireRole(request, reply, "ADMIN");
    if (!admin) return;
    const { id } = request.params as { id: string };
    const profile = await prisma.studentProfile.findUnique({
      where: { id },
      include: {
        user: true,
        lessons: { orderBy: { number: "asc" }, include: { items: true, topics: { include: { topic: true } } } },
        progress: { include: { material: { select: { title: true, type: true } } } },
        attempts: { orderBy: { createdAt: "desc" }, take: 20, include: { } },
        notes: { orderBy: { createdAt: "desc" } },
        checklist: { orderBy: { order: "asc" } },
        personalVocab: true,
        personalMaterials: { select: { id: true, title: true, type: true } },
        assignments: { where: { kind: "PERSONAL" }, include: { material: { select: { id: true, title: true, type: true } } } },
      },
    });
    if (!profile) return reply.code(404).send({ error: { code: "NOT_FOUND", messageKa: "მოსწავლე ვერ მოიძებნა." } });
    const materialTitles = await prisma.material.findMany({
      where: { id: { in: profile.attempts.map((attempt) => attempt.materialId) } },
      select: { id: true, title: true },
    });
    const titles = new Map(materialTitles.map((item) => [item.id, item.title]));
    return {
      id: profile.id,
      name: profile.user.name,
      nameLatin: profile.user.nameLatin,
      email: profile.user.email,
      phone: profile.phone,
      channel: profile.preferredChannel,
      goal: profile.goal,
      goalNote: profile.goalNote,
      greetingForm: profile.greetingForm,
      giftLessonsLeft: profile.giftLessonsLeft,
      nextLessonAt: profile.nextLessonAt?.toISOString() ?? null,
      lessons: profile.lessons.map((lesson) => ({
        id: lesson.id,
        number: lesson.number,
        title: lesson.title,
        date: lesson.date.toISOString(),
        readyForStudent: lesson.readyForStudent,
        topics: lesson.topics.map((link) => link.topic.number),
      })),
      progress: profile.progress.map((row) => ({
        materialId: row.materialId,
        title: row.material.title,
        type: row.material.type,
        status: row.status,
        bestScore: row.bestScore,
        completedAt: row.completedAt?.toISOString() ?? null,
      })),
      attempts: profile.attempts.map((attempt) => ({
        id: attempt.id,
        materialId: attempt.materialId,
        title: titles.get(attempt.materialId) ?? "",
        score: attempt.score,
        correct: attempt.correct,
        total: attempt.total,
        finishedAt: attempt.finishedAt?.toISOString() ?? null,
      })),
      notes: profile.notes.map((note) => ({
        id: note.id,
        body: note.body,
        visibleToStudent: note.visibleToStudent,
        createdAt: note.createdAt.toISOString(),
      })),
      checklist: profile.checklist,
      personalVocab: profile.personalVocab.map((entry) => ({ id: entry.id, es: entry.es, ka: entry.ka, en: entry.en, personalLabel: entry.personalLabel })),
      personalMaterials: profile.assignments.map((item) => ({ id: item.material.id, title: item.material.title, type: item.material.type })),
    };
  });

  app.patch("/v1/admin/students/:id", async (request, reply) => {
    const admin = await requireRole(request, reply, "ADMIN");
    if (!admin) return;
    const { id } = request.params as { id: string };
    const body = request.body as {
      phone?: string | null;
      goal?: string | null;
      channel?: string | null;
      goalNote?: string | null;
      greetingForm?: string;
      giftLessonsLeft?: number;
      nextLessonAt?: string | null;
      nameLatin?: string | null;
    };
    const profile = await prisma.studentProfile.findUnique({ where: { id } });
    if (!profile) return reply.code(404).send({ error: { code: "NOT_FOUND", messageKa: "მოსწავლე ვერ მოიძებნა." } });
    await prisma.studentProfile.update({
      where: { id },
      data: {
        ...(body.phone === null || typeof body.phone === "string" ? { phone: body.phone } : {}),
        ...(body.goal === null || typeof body.goal === "string" ? { goal: body.goal as "TRAVEL" } : {}),
        ...(body.channel === null || typeof body.channel === "string" ? { preferredChannel: body.channel as "PHONE" } : {}),
        ...(body.goalNote === null || typeof body.goalNote === "string" ? { goalNote: body.goalNote } : {}),
        ...(typeof body.greetingForm === "string" ? { greetingForm: body.greetingForm } : {}),
        ...(typeof body.giftLessonsLeft === "number" ? { giftLessonsLeft: body.giftLessonsLeft } : {}),
        ...(body.nextLessonAt === null || typeof body.nextLessonAt === "string" ? { nextLessonAt: body.nextLessonAt ? new Date(body.nextLessonAt) : null } : {}),
      },
    });
    if (body.nameLatin === null || typeof body.nameLatin === "string") {
      await prisma.user.update({ where: { id: profile.userId }, data: { nameLatin: body.nameLatin } });
    }
    return { ok: true };
  });

  app.post("/v1/admin/students/:id/notes", async (request, reply) => {
    const admin = await requireRole(request, reply, "ADMIN");
    if (!admin) return;
    const { id } = request.params as { id: string };
    const body = request.body as { body?: string; visibleToStudent?: boolean };
    if (!body.body?.trim()) return reply.code(400).send({ error: { code: "VALIDATION", messageKa: "შენიშვნა ცარიელია." } });
    const note = await prisma.teacherNote.create({
      data: { studentId: id, body: body.body.trim(), visibleToStudent: body.visibleToStudent !== false },
    });
    return { id: note.id };
  });

  app.delete("/v1/admin/students/:id/notes/:noteId", async (request, reply) => {
    const admin = await requireRole(request, reply, "ADMIN");
    if (!admin) return;
    const { noteId } = request.params as { noteId: string };
    await prisma.teacherNote.delete({ where: { id: noteId } });
    return { ok: true };
  });

  app.post("/v1/admin/students/:id/checklist", async (request, reply) => {
    const admin = await requireRole(request, reply, "ADMIN");
    if (!admin) return;
    const { id } = request.params as { id: string };
    const body = request.body as { text?: string; lessonId?: string | null };
    if (!body.text?.trim()) return reply.code(400).send({ error: { code: "VALIDATION", messageKa: "პუნქტი ცარიელია." } });
    const item = await prisma.checklistItem.create({ data: { studentId: id, text: body.text.trim(), lessonId: body.lessonId || null } });
    return { id: item.id };
  });

  app.patch("/v1/admin/students/:id/checklist/:itemId", async (request, reply) => {
    const admin = await requireRole(request, reply, "ADMIN");
    if (!admin) return;
    const { itemId } = request.params as { itemId: string };
    const body = request.body as { done?: boolean };
    await prisma.checklistItem.update({ where: { id: itemId }, data: { done: Boolean(body.done) } });
    return { ok: true };
  });
}

function toSnapshot(
  lesson: {
    id: string;
    number: number;
    date: Date;
    readyForStudent: boolean;
    statusOverride: "AUTO" | "DONE";
    topics: { topic: { number: number } }[];
    items: { materialId: string; kind: ProgressItem["kind"]; order: number; readyForStudent: boolean; material: { title: string } }[];
  },
  progress: { materialId: string; status: ProgressItem["status"] }[],
): LessonSnapshot {
  const map = new Map(progress.map((row) => [row.materialId, row.status]));
  return {
    id: lesson.id,
    number: lesson.number,
    date: lesson.date.toISOString(),
    readyForStudent: lesson.readyForStudent,
    statusOverride: lesson.statusOverride,
    topicNumbers: lesson.topics.map((link) => link.topic.number),
    items: lesson.items.map((item) => ({
      id: item.materialId,
      kind: item.kind,
      readyForStudent: item.readyForStudent,
      order: item.order,
      status: map.get(item.materialId) ?? "NOT_STARTED",
      title: item.material.title,
    })),
  };
}
