import type { FastifyInstance } from "fastify";
import { collectAssetIds, exerciseContentSchema, htmlEmbedSchema } from "@nina/contracts";
import { gradeExercise } from "@nina/exercise-engine";
import { prisma } from "../../db.js";
import { requireRole } from "../auth/guard.js";
import { signMediaUrl } from "../media/sign.js";
import {
  assertStudentSafe,
  continueLearning,
  coveredTopicNumbers,
  lessonCounter,
  lessonStatus,
  toStudentTopic,
  visibleItems,
  type LessonSnapshot,
  type ProgressItem,
  type ProgressStatus,
} from "../../domain/progress.js";

const autoComplete = new Set(["EXERCISE", "GAME", "CHECKPOINT"]);

export async function studentRoutes(app: FastifyInstance) {
  app.get("/v1/me", async (request, reply) => {
    const user = await requireRole(request, reply, "STUDENT");
    if (!user) return;
    const profile = await prisma.studentProfile.findUnique({ where: { userId: user.id } });
    const record = await prisma.user.findUnique({ where: { id: user.id }, select: { nameLatin: true } });
    return {
      id: user.id,
      name: user.name,
      nameLatin: record?.nameLatin ?? null,
      email: user.email,
      role: user.role,
      greetingForm: profile?.greetingForm ?? "feminine",
      nextLessonAt: profile?.nextLessonAt ?? null,
    };
  });

  app.get("/v1/me/home", async (request, reply) => {
    const loaded = await loadStudent(request, reply);
    if (!loaded) return;
    const { profile, lessons, progress } = loaded;
    const snapshots = lessons.map((lesson) => toSnapshot(lesson, progress));
    const learning = continueLearning(snapshots);
    const covered = coveredTopicNumbers(snapshots);
    const homework = lessons
      .flatMap((lesson) => lesson.items)
      .filter((item) => item.kind === "HOMEWORK")
      .map((item) => ({
        materialId: item.materialId,
        title: item.material.title,
        dueAt: item.dueAt?.toISOString() ?? null,
        status: progress.get(item.materialId) ?? "NOT_STARTED",
      }));
    const note = profile.notes[0];
    const personal = profile.assignments
      .filter((item) => item.kind === "PERSONAL")
      .sort((a, b) => b.assignedAt.getTime() - a.assignedAt.getTime())[0];
    const activeTopics = new Set(learning ? (snapshots.find((lesson) => lesson.id === learning.lesson.id)?.topicNumbers ?? []) : []);
    let reachedCurrent = false;
    const path = (profile.course?.blocks ?? []).map((block) => {
      const numbers = block.topics.map((topic) => topic.number);
      const done = numbers.filter((number) => covered.includes(number)).length;
      const holdsCurrent = numbers.some((number) => activeTopics.has(number));
      let state: "done" | "current" | "upcoming" = "upcoming";
      if (!reachedCurrent && holdsCurrent) {
        state = "current";
        reachedCurrent = true;
      } else if (!reachedCurrent && numbers.length > 0 && done === numbers.length) {
        state = "done";
      } else if (holdsCurrent) {
        reachedCurrent = true;
      }
      return { id: block.id, order: block.order, titleKa: block.titleKa, titleEs: block.titleEs, done, total: numbers.length, state };
    });
    const payload = {
      name: profile.user.name,
      nameLatin: profile.user.nameLatin,
      greetingForm: profile.greetingForm,
      nextLessonAt: profile.nextLessonAt?.toISOString() ?? null,
      empty: snapshots.length === 0,
      continueLearning: learning
        ? {
            lessonId: learning.lesson.id,
            number: learning.lesson.number,
            title: lessons.find((lesson) => lesson.id === learning.lesson.id)?.title ?? "",
            date: learning.lesson.date,
            counter: lessonCounter(learning.lesson.items),
            nextMaterial: learning.nextItem ? { id: learning.nextItem.id, title: learning.nextItem.title } : null,
          }
        : null,
      homework,
      note: note
        ? {
            body: note.body,
            createdAt: note.createdAt.toISOString(),
            material: personal ? { id: personal.materialId, title: personal.material.title } : null,
          }
        : null,
      path,
    };
    assertStudentSafe(payload);
    return payload;
  });

  app.get("/v1/me/lessons", async (request, reply) => {
    const loaded = await loadStudent(request, reply);
    if (!loaded) return;
    const items = loaded.lessons.map((lesson) => {
      const snapshot = toSnapshot(lesson, loaded.progress);
      return {
        id: lesson.id,
        number: lesson.number,
        title: lesson.title,
        date: lesson.date.toISOString(),
        status: lessonStatus(snapshot),
        counter: lessonCounter(snapshot.items),
        topics: lesson.topics.map((link) => toStudentTopic(link.topic)),
      };
    });
    assertStudentSafe(items);
    return { items };
  });

  app.get("/v1/me/lessons/:id", async (request, reply) => {
    const loaded = await loadStudent(request, reply);
    if (!loaded) return;
    const { id } = request.params as { id: string };
    const lesson = loaded.lessons.find((item) => item.id === id);
    if (!lesson) return reply.code(404).send({ error: { code: "NOT_FOUND", messageKa: "გაკვეთილი ვერ მოიძებნა." } });
    const snapshot = toSnapshot(lesson, loaded.progress);
    const payload = {
      id: lesson.id,
      number: lesson.number,
      title: lesson.title,
      date: lesson.date.toISOString(),
      note: lesson.noteFromNina,
      status: lessonStatus(snapshot),
      counter: lessonCounter(snapshot.items),
      topics: lesson.topics.map((link) => toStudentTopic(link.topic)),
      items: lesson.items.map((item) => ({
        materialId: item.materialId,
        title: item.material.title,
        type: item.material.type,
        kind: item.kind,
        groupLabel: item.groupLabel,
        order: item.order,
        dueAt: item.dueAt?.toISOString() ?? null,
        estMinutes: item.material.estMinutes,
        steps: stepCount(item.material.content),
        lastStep: loaded.lastSteps.get(item.materialId) ?? null,
        status: loaded.progress.get(item.materialId) ?? "NOT_STARTED",
        canMarkDone: !autoComplete.has(item.material.type),
      })),
    };
    assertStudentSafe(payload);
    return payload;
  });

  app.get("/v1/me/materials/:materialId", async (request, reply) => {
    const loaded = await loadStudent(request, reply);
    if (!loaded) return;
    const { materialId } = request.params as { materialId: string };
    const lessonId = (request.query as { lessonId?: string }).lessonId;
    const assignment = loaded.profile.assignments.find((item) => item.materialId === materialId);
    if (!assignment) return reply.code(404).send({ error: { code: "NOT_FOUND", messageKa: "მასალა ვერ მოიძებნა." } });
    const lesson = lessonId ? loaded.lessons.find((item) => item.id === lessonId) : assignment.lessonId ? loaded.lessons.find((item) => item.id === assignment.lessonId) : undefined;
    const siblings = lesson?.items.filter((item) => item.readyForStudent) ?? [];
    const index = siblings.findIndex((item) => item.materialId === materialId);
    const full = await prisma.material.findUnique({
      where: { id: materialId },
      select: { content: true },
    });
    const progressRow = await prisma.materialProgress.findUnique({
      where: { studentId_materialId: { studentId: loaded.profile.id, materialId } },
    });
    const assets: Record<string, string> = {};
    for (const assetId of collectAssetIds(full?.content)) {
      try {
        assets[assetId] = signMediaUrl(assetId, "original").path;
      } catch {
        continue;
      }
    }
    const payload = {
      id: assignment.materialId,
      title: assignment.material.title,
      subtitle: assignment.material.subtitle,
      description: assignment.material.description,
      type: assignment.material.type,
      kind: assignment.kind,
      content: full?.content ?? {},
      status: loaded.progress.get(materialId) ?? "NOT_STARTED",
      lastStep: progressRow?.lastStep ?? null,
      bestScore: progressRow?.bestScore ?? null,
      canMarkDone: !autoComplete.has(assignment.material.type),
      lessonId: lesson?.id ?? null,
      assets,
      prev: index > 0 ? { id: siblings[index - 1]!.materialId, title: siblings[index - 1]!.material.title } : null,
      next: index >= 0 && index < siblings.length - 1 ? { id: siblings[index + 1]!.materialId, title: siblings[index + 1]!.material.title } : null,
    };
    assertStudentSafe(payload);
    return payload;
  });

  app.post("/v1/me/progress/:materialId/open", async (request, reply) => {
    const saved = await touchProgress(request, reply, "OPENED");
    if (saved) return saved;
  });

  app.post("/v1/me/progress/:materialId/complete", async (request, reply) => {
    const saved = await touchProgress(request, reply, "COMPLETED");
    if (saved) return saved;
  });

  app.post("/v1/me/exercises/:materialId/attempts", async (request, reply) => {
    const owned = await ownedMaterial(request, reply);
    if (!owned) return;
    if (!autoComplete.has(owned.material.type)) {
      return reply.code(400).send({ error: { code: "VALIDATION", messageKa: "ეს მასალა სავარჯიშო არ არის." } });
    }
    const parsed = exerciseContentSchema.safeParse(owned.material.content);
    if (!parsed.success) {
      return reply.code(400).send({ error: { code: "VALIDATION", messageKa: "სავარჯიშოს ფორმა არასწორია." } });
    }
    const answers = (request.body as { answers?: unknown }).answers;
    if (!Array.isArray(answers)) {
      return reply.code(400).send({ error: { code: "VALIDATION", messageKa: "პასუხები არასწორია." } });
    }
    const graded = gradeExercise(parsed.data, answers);
    const revision = await prisma.materialRevision.findFirst({
      where: { materialId: owned.material.id },
      orderBy: { createdAt: "desc" },
    });
    await prisma.exerciseAttempt.create({
      data: {
        studentId: owned.profile.id,
        materialId: owned.material.id,
        contentRevisionId: revision?.id,
        answers: answers as object,
        score: graded.score,
        correct: graded.correct,
        total: graded.total,
        finishedAt: new Date(),
      },
    });
    const status = await saveScore(owned.profile.id, owned.material.id, graded.score, graded.passed, parsed.data.steps.length);
    return { ...graded, status };
  });

  app.patch("/v1/me/exercises/:materialId/position", async (request, reply) => {
    const owned = await ownedMaterial(request, reply);
    if (!owned) return;
    const parsed = exerciseContentSchema.safeParse(owned.material.content);
    if (!parsed.success) return reply.code(400).send({ error: { code: "VALIDATION", messageKa: "სავარჯიშოს ფორმა არასწორია." } });
    const lastStep = (request.body as { lastStep?: unknown }).lastStep;
    if (typeof lastStep !== "number" || !Number.isInteger(lastStep) || lastStep < 1) {
      return reply.code(400).send({ error: { code: "VALIDATION", messageKa: "ნაბიჯი არასწორია." } });
    }
    const clamped = Math.min(lastStep, parsed.data.steps.length);
    const current = await prisma.materialProgress.findUnique({
      where: { studentId_materialId: { studentId: owned.profile.id, materialId: owned.material.id } },
    });
    await prisma.materialProgress.upsert({
      where: { studentId_materialId: { studentId: owned.profile.id, materialId: owned.material.id } },
      create: { studentId: owned.profile.id, materialId: owned.material.id, status: "OPENED", openedAt: new Date(), lastStep: clamped },
      update: { lastStep: clamped, status: current?.status === "COMPLETED" ? "COMPLETED" : "OPENED", openedAt: current?.openedAt ?? new Date() },
    });
    return { lastStep: clamped };
  });

  app.post("/v1/me/embeds/:materialId/complete", async (request, reply) => {
    const owned = await ownedMaterial(request, reply);
    if (!owned) return;
    if (owned.material.type !== "HTML_EMBED") {
      return reply.code(400).send({ error: { code: "VALIDATION", messageKa: "ეს მასალა ჩასმა არ არის." } });
    }
    const content = htmlEmbedSchema.safeParse(owned.material.content);
    const score = (request.body as { score?: unknown }).score;
    const numeric = typeof score === "number" && score >= 0 && score <= 1 ? score : null;
    if (!content.success || (!content.data.reportsCompletion && numeric === null)) {
      return reply.code(400).send({ error: { code: "VALIDATION", messageKa: "შედეგი არასწორია." } });
    }
    const passed = numeric === null || numeric >= 0.7;
    await prisma.exerciseAttempt.create({
      data: {
        studentId: owned.profile.id,
        materialId: owned.material.id,
        answers: { score: numeric },
        score: numeric,
        finishedAt: new Date(),
      },
    });
    const status = await saveScore(owned.profile.id, owned.material.id, numeric ?? 1, passed, null);
    return { status, score: numeric, passed };
  });
}

async function touchProgress(request: Parameters<typeof requireRole>[0], reply: Parameters<typeof requireRole>[1], next: "OPENED" | "COMPLETED") {
  const user = await requireRole(request, reply, "STUDENT");
  if (!user) return null;
  const profile = await prisma.studentProfile.findUnique({ where: { userId: user.id } });
  if (!profile) {
    reply.code(404).send({ error: { code: "NOT_FOUND", messageKa: "ანგარიში ვერ მოიძებნა." } });
    return null;
  }
  const { materialId } = request.params as { materialId: string };
  const assignment = await prisma.assignment.findFirst({
    where: { studentId: profile.id, materialId, readyForStudent: true },
    include: { material: { select: { type: true } } },
  });
  if (!assignment) {
    reply.code(404).send({ error: { code: "NOT_FOUND", messageKa: "მასალა ვერ მოიძებნა." } });
    return null;
  }
  if (next === "COMPLETED" && autoComplete.has(assignment.material.type)) {
    reply.code(400).send({ error: { code: "VALIDATION", messageKa: "სავარჯიშო თავისით სრულდება." } });
    return null;
  }
  const current = await prisma.materialProgress.findUnique({
    where: { studentId_materialId: { studentId: profile.id, materialId } },
  });
  if (next === "OPENED" && current && current.status !== "NOT_STARTED") return { status: current.status };
  const now = new Date();
  const status: ProgressStatus = next === "COMPLETED" ? "COMPLETED" : current?.status === "COMPLETED" ? "COMPLETED" : "OPENED";
  const saved = await prisma.materialProgress.upsert({
    where: { studentId_materialId: { studentId: profile.id, materialId } },
    create: { studentId: profile.id, materialId, status, openedAt: now, completedAt: status === "COMPLETED" ? now : null },
    update: {
      status,
      openedAt: current?.openedAt ?? now,
      completedAt: status === "COMPLETED" ? (current?.completedAt ?? now) : current?.completedAt,
    },
  });
  return { status: saved.status };
}

async function loadStudent(request: Parameters<typeof requireRole>[0], reply: Parameters<typeof requireRole>[1]) {
  const user = await requireRole(request, reply, "STUDENT");
  if (!user) return null;
  const profile = await prisma.studentProfile.findUnique({
    where: { userId: user.id },
    include: {
      user: { select: { name: true, nameLatin: true } },
      notes: { where: { visibleToStudent: true }, orderBy: { createdAt: "desc" }, take: 1 },
      assignments: {
        where: { readyForStudent: true },
        include: { material: { select: { id: true, title: true, subtitle: true, description: true, type: true, estMinutes: true } } },
      },
      course: { include: { blocks: { orderBy: { order: "asc" }, include: { topics: { select: { number: true } } } } } },
    },
  });
  if (!profile) {
    reply.code(404).send({ error: { code: "NOT_FOUND", messageKa: "ანგარიში ვერ მოიძებნა." } });
    return null;
  }
  const lessons = await prisma.lesson.findMany({
    where: { studentId: profile.id, readyForStudent: true },
    include: {
      topics: { include: { topic: true } },
      items: {
        where: { readyForStudent: true },
        orderBy: { order: "asc" },
        include: { material: { select: { id: true, title: true, type: true, estMinutes: true, content: true } } },
      },
    },
    orderBy: { date: "desc" },
  });
  const rows = await prisma.materialProgress.findMany({ where: { studentId: profile.id } });
  const progress = new Map(rows.map((row) => [row.materialId, row.status]));
  const lastSteps = new Map(rows.map((row) => [row.materialId, row.lastStep]));
  return { profile, lessons, progress, lastSteps };
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
  progress: Map<string, ProgressStatus>,
): LessonSnapshot {
  return {
    id: lesson.id,
    number: lesson.number,
    date: lesson.date.toISOString(),
    readyForStudent: lesson.readyForStudent,
    statusOverride: lesson.statusOverride,
    topicNumbers: lesson.topics.map((link) => link.topic.number),
    items: visibleItems(
      lesson.items.map((item) => ({
        id: item.materialId,
        kind: item.kind,
        readyForStudent: item.readyForStudent,
        order: item.order,
        status: progress.get(item.materialId) ?? "NOT_STARTED",
        title: item.material.title,
      })),
    ),
  };
}

function stepCount(content: unknown) {
  if (!content || typeof content !== "object" || !("steps" in content)) return null;
  const steps = (content as { steps?: unknown }).steps;
  return Array.isArray(steps) ? steps.length : null;
}

async function ownedMaterial(request: Parameters<typeof requireRole>[0], reply: Parameters<typeof requireRole>[1]) {
  const user = await requireRole(request, reply, "STUDENT");
  if (!user) return null;
  const profile = await prisma.studentProfile.findUnique({ where: { userId: user.id } });
  if (!profile) {
    reply.code(404).send({ error: { code: "NOT_FOUND", messageKa: "ანგარიში ვერ მოიძებნა." } });
    return null;
  }
  const { materialId } = request.params as { materialId: string };
  const assignment = await prisma.assignment.findFirst({
    where: { studentId: profile.id, materialId, readyForStudent: true },
    include: { material: true },
  });
  if (!assignment) {
    reply.code(404).send({ error: { code: "NOT_FOUND", messageKa: "მასალა ვერ მოიძებნა." } });
    return null;
  }
  return { profile, material: assignment.material };
}

async function saveScore(studentId: string, materialId: string, score: number, passed: boolean, lastStep: number | null) {
  const current = await prisma.materialProgress.findUnique({
    where: { studentId_materialId: { studentId, materialId } },
  });
  const best = Math.max(current?.bestScore ?? 0, score);
  const completed = current?.status === "COMPLETED" || passed;
  const now = new Date();
  const saved = await prisma.materialProgress.upsert({
    where: { studentId_materialId: { studentId, materialId } },
    create: {
      studentId,
      materialId,
      status: completed ? "COMPLETED" : "OPENED",
      openedAt: now,
      completedAt: completed ? now : null,
      bestScore: best,
      lastStep,
    },
    update: {
      status: completed ? "COMPLETED" : "OPENED",
      bestScore: best,
      lastStep: lastStep ?? current?.lastStep,
      openedAt: current?.openedAt ?? now,
      completedAt: completed ? (current?.completedAt ?? now) : current?.completedAt,
    },
  });
  return saved.status;
}
