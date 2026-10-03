import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { collectAssetIds, exerciseContentSchema, htmlEmbedSchema, vocabSchema } from "@nina/contracts";
import { gradeExercise } from "@nina/exercise-engine";
import { prisma } from "../../db.js";
import { requireRole } from "../auth/guard.js";
import { signMediaUrl } from "../media/sign.js";
import {
  assertStudentSafe,
  lessonCounter,
  lessonStatus,
  numberLessons,
  syllabusProgress,
  type ProgressStatus,
} from "../../domain/progress.js";
import {
  audienceLessonWhere,
  groupIdsFor,
  lessonInclude,
  lessonTitle,
  resolveItems,
  stepCount,
  studentLessonWhere,
  visibleToStudent,
  type LoadedLesson,
  type ResolvedItem,
} from "../lessons/load.js";
import { courseSyllabus } from "../lessons/syllabus.js";

const autoComplete = new Set(["EXERCISE", "GAME", "CHECKPOINT"]);
const notFound = { error: { code: "NOT_FOUND", messageKa: "მასალა ვერ მოიძებნა." } };

type ProgressRow = { status: ProgressStatus; lastStep: number | null; bestScore: number | null };

type Loaded = NonNullable<Awaited<ReturnType<typeof loadStudent>>>;

async function loadStudent(request: FastifyRequest, reply: FastifyReply) {
  const user = await requireRole(request, reply, "STUDENT");
  if (!user) return null;
  const profile = await prisma.studentProfile.findUnique({
    where: { userId: user.id },
    include: {
      user: { select: { name: true, nameLatin: true } },
      notes: { where: { visibleToStudent: true }, orderBy: { createdAt: "desc" }, take: 1 },
      enrollments: { where: { status: "ACTIVE" }, orderBy: { startedAt: "asc" }, include: { course: { select: { id: true, title: true, level: true } } } },
    },
  });
  if (!profile) {
    reply.code(404).send({ error: { code: "NOT_FOUND", messageKa: "ანგარიში ვერ მოიძებნა." } });
    return null;
  }
  const groupIds = await groupIdsFor(profile.id);
  const lessons = await prisma.lesson.findMany({ where: studentLessonWhere(profile.id, groupIds), include: lessonInclude, orderBy: { date: "desc" } });
  const rows = await prisma.lessonProgress.findMany({ where: { studentId: profile.id } });
  const progress = new Map<string, ProgressRow>(rows.map((row) => [`${row.lessonId}:${row.materialId}`, row]));
  const numbers = numberLessons(lessons);
  const views = lessons.map((lesson) => {
    const items = visibleToStudent(resolveItems(lesson));
    const statusOf = (materialId: string) => progress.get(`${lesson.id}:${materialId}`)?.status ?? "NOT_STARTED";
    const rowsForStatus = items.map((item) => ({ section: item.section, status: statusOf(item.materialId) }));
    return {
      lesson,
      items,
      number: numbers.get(lesson.id) ?? 0,
      status: lessonStatus(rowsForStatus, lesson.heldAt !== null),
      counter: lessonCounter(rowsForStatus),
      statusOf,
    };
  });
  return { profile, groupIds, views, progress };
}

type LessonView = Loaded["views"][number];

function findContext(loaded: Loaded, materialId: string, lessonId?: string) {
  const holds = (view: LessonView) => view.items.some((item) => item.materialId === materialId);
  const preferred = lessonId ? loaded.views.find((view) => view.lesson.id === lessonId && holds(view)) : undefined;
  return preferred ?? loaded.views.find(holds) ?? null;
}

function lessonIdFrom(request: FastifyRequest) {
  const query = (request.query ?? {}) as { lessonId?: unknown };
  const body = (request.body ?? {}) as { lessonId?: unknown };
  const value = query.lessonId ?? body.lessonId;
  return typeof value === "string" && value ? value : undefined;
}

function signAll(content: unknown) {
  const assets: Record<string, string> = {};
  for (const assetId of collectAssetIds(content)) {
    try {
      assets[assetId] = signMediaUrl(assetId, "original").path;
    } catch {
      continue;
    }
  }
  return assets;
}

function itemCard(view: LessonView, item: ResolvedItem) {
  const progress = view.statusOf(item.materialId);
  return {
    materialId: item.materialId,
    title: item.material.title,
    subtitle: item.material.subtitle,
    type: item.material.type,
    section: item.section,
    noteKa: item.noteKa,
    estMinutes: item.material.estMinutes,
    steps: stepCount(item.material.content),
    status: progress,
    canMarkDone: !autoComplete.has(item.material.type),
  };
}

function lessonCard(view: LessonView) {
  const { lesson } = view;
  return {
    id: lesson.id,
    number: view.number,
    title: lessonTitle(lesson),
    titleEs: lesson.plan?.titleEs ?? null,
    date: lesson.date.toISOString(),
    status: view.status,
    counter: view.counter,
    unit: lesson.plan?.unit ? { titleKa: lesson.plan.unit.titleKa } : null,
    group: lesson.group ? { name: lesson.group.name } : null,
    homeworkDueAt: lesson.homeworkDueAt?.toISOString() ?? null,
  };
}

async function nextLessonDate(profileId: string, groupIds: string[]) {
  const next = await prisma.lesson.findFirst({
    where: { ...audienceLessonWhere(profileId, groupIds), date: { gte: new Date() } },
    orderBy: { date: "asc" },
    select: { date: true },
  });
  return next?.date.toISOString() ?? null;
}

async function syllabusFor(loaded: Loaded) {
  const audienceLessons = await prisma.lesson.findMany({
    where: audienceLessonWhere(loaded.profile.id, loaded.groupIds),
    select: { id: true, planId: true, date: true, publishedAt: true, heldAt: true },
  });
  return Promise.all(
    loaded.profile.enrollments.map(async (enrollment) => {
      const result = syllabusProgress(await courseSyllabus(enrollment.courseId), audienceLessons);
      return {
        course: enrollment.course,
        done: result.done,
        total: result.total,
        units: result.units.map((unit) => ({
          id: unit.id,
          order: unit.order,
          titleKa: unit.titleKa,
          titleEs: unit.titleEs,
          state: unit.state,
          done: unit.done,
          total: unit.total,
          plans: unit.plans.map((plan) => ({ id: plan.id, titleKa: plan.titleKa, titleEs: plan.titleEs, state: plan.state })),
        })),
      };
    }),
  );
}

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
      nextLessonAt: profile ? await nextLessonDate(profile.id, await groupIdsFor(profile.id)) : null,
    };
  });

  app.get("/v1/me/home", async (request, reply) => {
    const loaded = await loadStudent(request, reply);
    if (!loaded) return;
    const { profile, views } = loaded;
    const current = views.find((view) => view.status === "IN_PROGRESS") ?? views.find((view) => view.status === "NEW") ?? null;
    const nextItem = current?.items.find((item) => current.statusOf(item.materialId) !== "COMPLETED") ?? null;
    const homework = views.flatMap((view) =>
      view.items
        .filter((item) => item.section === "HOMEWORK" && view.statusOf(item.materialId) !== "COMPLETED")
        .map((item) => ({
          lessonId: view.lesson.id,
          lessonNumber: view.number,
          materialId: item.materialId,
          title: item.material.title,
          type: item.material.type,
          dueAt: view.lesson.homeworkDueAt?.toISOString() ?? null,
          status: view.statusOf(item.materialId),
        })),
    );
    homework.sort((a, b) => (a.dueAt ?? "9999").localeCompare(b.dueAt ?? "9999"));
    const note = profile.notes[0];
    const syllabus = (await syllabusFor(loaded))[0] ?? null;
    const payload = {
      name: profile.user.name,
      nameLatin: profile.user.nameLatin,
      greetingForm: profile.greetingForm,
      nextLessonAt: await nextLessonDate(profile.id, loaded.groupIds),
      empty: views.length === 0,
      continueLearning: current
        ? { ...lessonCard(current), nextMaterial: nextItem ? { id: nextItem.materialId, title: nextItem.material.title, type: nextItem.material.type } : null }
        : null,
      recent: views.slice(0, 3).map(lessonCard),
      homework,
      note: note ? { body: note.body, createdAt: note.createdAt.toISOString() } : null,
      syllabus,
    };
    assertStudentSafe(payload);
    return payload;
  });

  app.get("/v1/me/lessons", async (request, reply) => {
    const loaded = await loadStudent(request, reply);
    if (!loaded) return;
    const items = loaded.views.map(lessonCard);
    assertStudentSafe(items);
    return { items, nextLessonAt: await nextLessonDate(loaded.profile.id, loaded.groupIds) };
  });

  app.get("/v1/me/lessons/:id", async (request, reply) => {
    const loaded = await loadStudent(request, reply);
    if (!loaded) return;
    const { id } = request.params as { id: string };
    const view = loaded.views.find((row) => row.lesson.id === id);
    if (!view) return reply.code(404).send({ error: { code: "NOT_FOUND", messageKa: "გაკვეთილი ვერ მოიძებნა." } });
    const payload = {
      ...lessonCard(view),
      note: view.lesson.noteKa,
      goalsKa: view.lesson.plan?.goalsKa ?? [],
      items: view.items.map((item) => ({ ...itemCard(view, item), lastStep: loaded.progress.get(`${id}:${item.materialId}`)?.lastStep ?? null })),
    };
    assertStudentSafe(payload);
    return payload;
  });

  app.get("/v1/me/materials", async (request, reply) => {
    const loaded = await loadStudent(request, reply);
    if (!loaded) return;
    const seen = new Map<string, ReturnType<typeof itemCard> & { lessonId: string; lessonNumber: number; lessonTitle: string; unitTitle: string | null; date: string }>();
    for (const view of loaded.views) {
      for (const item of view.items) {
        const card = itemCard(view, item);
        const existing = seen.get(item.materialId);
        if (existing) {
          if (card.status === "COMPLETED" || (card.status === "OPENED" && existing.status === "NOT_STARTED")) existing.status = card.status;
          continue;
        }
        seen.set(item.materialId, {
          ...card,
          lessonId: view.lesson.id,
          lessonNumber: view.number,
          lessonTitle: lessonTitle(view.lesson),
          unitTitle: view.lesson.plan?.unit?.titleKa ?? null,
          date: view.lesson.date.toISOString(),
        });
      }
    }
    const items = [...seen.values()];
    assertStudentSafe(items);
    return { items };
  });

  app.get("/v1/me/materials/:materialId", async (request, reply) => {
    const loaded = await loadStudent(request, reply);
    if (!loaded) return;
    const { materialId } = request.params as { materialId: string };
    const view = findContext(loaded, materialId, lessonIdFrom(request));
    if (!view) return reply.code(404).send(notFound);
    const index = view.items.findIndex((item) => item.materialId === materialId);
    const item = view.items[index]!;
    const row = loaded.progress.get(`${view.lesson.id}:${materialId}`);
    const content = item.material.content;
    const neighbour = (offset: number) => {
      const other = view.items[index + offset];
      return other ? { id: other.materialId, title: other.material.title } : null;
    };
    const payload = {
      id: materialId,
      title: item.material.title,
      subtitle: item.material.subtitle,
      description: item.material.description,
      type: item.material.type,
      section: item.section,
      noteKa: item.noteKa,
      content,
      status: row?.status ?? "NOT_STARTED",
      lastStep: row?.lastStep ?? null,
      bestScore: row?.bestScore ?? null,
      canMarkDone: !autoComplete.has(item.material.type),
      lessonId: view.lesson.id,
      lessonNumber: view.number,
      lessonTitle: lessonTitle(view.lesson),
      assets: signAll(content),
      prev: neighbour(-1),
      next: neighbour(1),
    };
    assertStudentSafe(payload);
    return payload;
  });

  app.get("/v1/me/vocabulary", async (request, reply) => {
    const loaded = await loadStudent(request, reply);
    if (!loaded) return;
    const seenMaterials = new Set<string>();
    const sets: { materialId: string; title: string; lessonId: string; lessonNumber: number; unitTitle: string | null; entries: unknown[] }[] = [];
    const assetIds = new Set<string>();
    for (const view of [...loaded.views].reverse()) {
      for (const item of view.items) {
        if (item.material.type !== "VOCAB" || seenMaterials.has(item.materialId)) continue;
        seenMaterials.add(item.materialId);
        const parsed = vocabSchema.safeParse(item.material.content ?? {});
        const entries = parsed.success ? (parsed.data.entries ?? []) : [];
        if (!entries.length) continue;
        collectAssetIds(entries, assetIds);
        sets.push({ materialId: item.materialId, title: item.material.title, lessonId: view.lesson.id, lessonNumber: view.number, unitTitle: view.lesson.plan?.unit?.titleKa ?? null, entries });
      }
    }
    const assets: Record<string, string> = {};
    for (const assetId of assetIds) {
      try {
        assets[assetId] = signMediaUrl(assetId, "original").path;
      } catch {
        continue;
      }
    }
    const personal = await prisma.personalWord.findMany({ where: { studentId: loaded.profile.id }, orderBy: { createdAt: "desc" } });
    const payload = {
      sets,
      personal: personal.map((word) => ({ id: word.id, es: word.es, ka: word.ka, en: word.en, noteKa: word.noteKa })),
      assets,
    };
    assertStudentSafe(payload);
    return payload;
  });

  app.get("/v1/me/progress", async (request, reply) => {
    const loaded = await loadStudent(request, reply);
    if (!loaded) return;
    const attempts = await prisma.exerciseAttempt.findMany({
      where: { studentId: loaded.profile.id, finishedAt: { not: null } },
      orderBy: { finishedAt: "desc" },
      take: 50,
    });
    const titles = new Map(
      (await prisma.material.findMany({ where: { id: { in: attempts.map((row) => row.materialId) } }, select: { id: true, title: true } })).map((row) => [row.id, row.title]),
    );
    const allItems = loaded.views.flatMap((view) => view.items.map((item) => view.statusOf(item.materialId)));
    const scored = attempts.filter((row) => row.score !== null);
    const payload = {
      syllabus: await syllabusFor(loaded),
      stats: {
        lessons: loaded.views.length,
        lessonsDone: loaded.views.filter((view) => view.status === "DONE").length,
        items: allItems.length,
        itemsDone: allItems.filter((status) => status === "COMPLETED").length,
        exercises: scored.length,
        averageScore: scored.length ? scored.reduce((sum, row) => sum + (row.score ?? 0), 0) / scored.length : null,
      },
      attempts: attempts.slice(0, 12).map((row) => ({
        id: row.id,
        materialId: row.materialId,
        lessonId: row.lessonId,
        title: titles.get(row.materialId) ?? "",
        score: row.score,
        correct: row.correct,
        total: row.total,
        finishedAt: row.finishedAt!.toISOString(),
      })),
    };
    assertStudentSafe(payload);
    return payload;
  });

  app.post("/v1/me/progress/:materialId/open", async (request, reply) => {
    const owned = await ownedItem(request, reply);
    if (!owned) return;
    return touchProgress(owned, "OPENED");
  });

  app.post("/v1/me/progress/:materialId/complete", async (request, reply) => {
    const owned = await ownedItem(request, reply);
    if (!owned) return;
    if (autoComplete.has(owned.item.material.type)) {
      return reply.code(400).send({ error: { code: "VALIDATION", messageKa: "სავარჯიშო თავისით სრულდება." } });
    }
    return touchProgress(owned, "COMPLETED");
  });

  app.post("/v1/me/exercises/:materialId/attempts", async (request, reply) => {
    const owned = await ownedItem(request, reply);
    if (!owned) return;
    if (!autoComplete.has(owned.item.material.type)) {
      return reply.code(400).send({ error: { code: "VALIDATION", messageKa: "ეს მასალა სავარჯიშო არ არის." } });
    }
    const parsed = exerciseContentSchema.safeParse(owned.item.material.content);
    if (!parsed.success) return reply.code(400).send({ error: { code: "VALIDATION", messageKa: "სავარჯიშოს ფორმა არასწორია." } });
    const answers = (request.body as { answers?: unknown }).answers;
    if (!Array.isArray(answers)) return reply.code(400).send({ error: { code: "VALIDATION", messageKa: "პასუხები არასწორია." } });
    const graded = gradeExercise(parsed.data, answers);
    const revision = await prisma.materialRevision.findFirst({ where: { materialId: owned.item.materialId }, orderBy: { createdAt: "desc" } });
    await prisma.exerciseAttempt.create({
      data: {
        studentId: owned.studentId,
        materialId: owned.item.materialId,
        lessonId: owned.lesson.id,
        contentRevisionId: revision?.id,
        answers: answers as object,
        score: graded.score,
        correct: graded.correct,
        total: graded.total,
        finishedAt: new Date(),
      },
    });
    const status = await saveScore(owned, graded.score, graded.passed, parsed.data.steps.length);
    return { ...graded, status };
  });

  app.patch("/v1/me/exercises/:materialId/position", async (request, reply) => {
    const owned = await ownedItem(request, reply);
    if (!owned) return;
    const parsed = exerciseContentSchema.safeParse(owned.item.material.content);
    if (!parsed.success) return reply.code(400).send({ error: { code: "VALIDATION", messageKa: "სავარჯიშოს ფორმა არასწორია." } });
    const lastStep = (request.body as { lastStep?: unknown }).lastStep;
    if (typeof lastStep !== "number" || !Number.isInteger(lastStep) || lastStep < 1) {
      return reply.code(400).send({ error: { code: "VALIDATION", messageKa: "ნაბიჯი არასწორია." } });
    }
    const clamped = Math.min(lastStep, parsed.data.steps.length);
    const where = progressKey(owned);
    const current = await prisma.lessonProgress.findUnique({ where });
    await prisma.lessonProgress.upsert({
      where,
      create: { ...where.studentId_lessonId_materialId, status: "OPENED", openedAt: new Date(), lastStep: clamped },
      update: { lastStep: clamped, status: current?.status === "COMPLETED" ? "COMPLETED" : "OPENED", openedAt: current?.openedAt ?? new Date() },
    });
    return { lastStep: clamped };
  });

  app.post("/v1/me/embeds/:materialId/complete", async (request, reply) => {
    const owned = await ownedItem(request, reply);
    if (!owned) return;
    if (owned.item.material.type !== "HTML_EMBED") {
      return reply.code(400).send({ error: { code: "VALIDATION", messageKa: "ეს მასალა ჩასმა არ არის." } });
    }
    const content = htmlEmbedSchema.safeParse(owned.item.material.content);
    const score = (request.body as { score?: unknown }).score;
    const numeric = typeof score === "number" && score >= 0 && score <= 1 ? score : null;
    if (!content.success || (!content.data.reportsCompletion && numeric === null)) {
      return reply.code(400).send({ error: { code: "VALIDATION", messageKa: "შედეგი არასწორია." } });
    }
    const passed = numeric === null || numeric >= 0.7;
    await prisma.exerciseAttempt.create({
      data: { studentId: owned.studentId, materialId: owned.item.materialId, lessonId: owned.lesson.id, answers: { score: numeric }, score: numeric, finishedAt: new Date() },
    });
    const status = await saveScore(owned, numeric ?? 1, passed, null);
    return { status, score: numeric, passed };
  });
}

type Owned = { studentId: string; lesson: LoadedLesson; item: ResolvedItem };

/** The material must be visible to this student in a published lesson; picks the lesson context. */
async function ownedItem(request: FastifyRequest, reply: FastifyReply): Promise<Owned | null> {
  const user = await requireRole(request, reply, "STUDENT");
  if (!user) return null;
  const profile = await prisma.studentProfile.findUnique({ where: { userId: user.id }, select: { id: true } });
  if (!profile) {
    reply.code(404).send(notFound);
    return null;
  }
  const { materialId } = request.params as { materialId: string };
  const lessonId = lessonIdFrom(request);
  const groupIds = await groupIdsFor(profile.id);
  const candidates = await prisma.lesson.findMany({
    where: {
      AND: [
        studentLessonWhere(profile.id, groupIds),
        { OR: [{ plan: { items: { some: { materialId } } } }, { items: { some: { materialId } } }] },
      ],
    },
    include: lessonInclude,
    orderBy: { date: "desc" },
  });
  candidates.sort((a, b) => Number(b.id === lessonId) - Number(a.id === lessonId));
  for (const lesson of candidates) {
    const item = visibleToStudent(resolveItems(lesson)).find((row) => row.materialId === materialId);
    if (item) return { studentId: profile.id, lesson, item };
  }
  reply.code(404).send(notFound);
  return null;
}

function progressKey(owned: Owned) {
  return { studentId_lessonId_materialId: { studentId: owned.studentId, lessonId: owned.lesson.id, materialId: owned.item.materialId } };
}

async function touchProgress(owned: Owned, next: "OPENED" | "COMPLETED") {
  const where = progressKey(owned);
  const current = await prisma.lessonProgress.findUnique({ where });
  if (next === "OPENED" && current && current.status !== "NOT_STARTED") return { status: current.status };
  const now = new Date();
  const status: ProgressStatus = next === "COMPLETED" || current?.status === "COMPLETED" ? "COMPLETED" : "OPENED";
  const saved = await prisma.lessonProgress.upsert({
    where,
    create: { ...where.studentId_lessonId_materialId, status, openedAt: now, completedAt: status === "COMPLETED" ? now : null },
    update: { status, openedAt: current?.openedAt ?? now, completedAt: status === "COMPLETED" ? (current?.completedAt ?? now) : current?.completedAt },
  });
  return { status: saved.status };
}

async function saveScore(owned: Owned, score: number, passed: boolean, lastStep: number | null) {
  const where = progressKey(owned);
  const current = await prisma.lessonProgress.findUnique({ where });
  const best = Math.max(current?.bestScore ?? 0, score);
  const completed = current?.status === "COMPLETED" || passed;
  const now = new Date();
  const saved = await prisma.lessonProgress.upsert({
    where,
    create: { ...where.studentId_lessonId_materialId, status: completed ? "COMPLETED" : "OPENED", openedAt: now, completedAt: completed ? now : null, bestScore: best, lastStep },
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
