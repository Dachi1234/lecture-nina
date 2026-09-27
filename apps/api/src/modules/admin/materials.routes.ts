import type { FastifyInstance, FastifyReply } from "fastify";
import {
  EXERCISE_MATERIAL_TYPES,
  MATERIAL_TYPES,
  collectAssetIds,
  exerciseContentSchema,
  exerciseTemplateMeta,
  materialReadiness,
  starterContent,
} from "@nina/contracts";
import { Prisma } from "@nina/db";
import { prisma } from "../../db.js";
import { requireRole } from "../auth/guard.js";
import { signMediaUrl } from "../media/sign.js";

const materialTypes = new Set<string>(MATERIAL_TYPES);
const exerciseTypes = new Set<string>(EXERCISE_MATERIAL_TYPES);
const assignmentKinds = new Set(["LESSON_MATERIAL", "HOMEWORK", "PERSONAL", "REVIEW"]);

const materialListSelect = {
  id: true,
  type: true,
  title: true,
  subtitle: true,
  status: true,
  origin: true,
  tags: true,
  estMinutes: true,
  content: true,
  draft: true,
  updatedAt: true,
  personalFor: { select: { user: { select: { name: true } } } },
  topics: { select: { topic: { select: { number: true, titleKa: true } } } },
  assignments: {
    select: {
      id: true,
      kind: true,
      readyForStudent: true,
      student: { select: { user: { select: { name: true } } } },
      lesson: { select: { number: true, title: true } },
    },
  },
} as const;

type Rec = Record<string, unknown>;

function isRecord(value: unknown): value is Rec {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function notFound(reply: FastifyReply) {
  return reply.code(404).send({ error: { code: "NOT_FOUND", messageKa: "მასალა ვერ მოიძებნა." } });
}

function signAssets(...contents: unknown[]) {
  const ids = new Set<string>();
  for (const content of contents) collectAssetIds(content, ids);
  const assets: Record<string, string> = {};
  for (const assetId of ids) {
    try {
      assets[assetId] = signMediaUrl(assetId, "original").path;
    } catch {
      continue;
    }
  }
  return assets;
}

async function syncAssetLinks(materialId: string, ...contents: unknown[]) {
  const ids = new Set<string>();
  for (const content of contents) collectAssetIds(content, ids);
  const existing = ids.size
    ? await prisma.mediaAsset.findMany({ where: { id: { in: [...ids] } }, select: { id: true } })
    : [];
  await prisma.$transaction([
    prisma.materialAsset.deleteMany({ where: { materialId } }),
    ...(existing.length
      ? [prisma.materialAsset.createMany({ data: existing.map((asset, order) => ({ materialId, assetId: asset.id, role: "content", order })) })]
      : []),
  ]);
}

function stringList(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

export async function adminMaterialRoutes(app: FastifyInstance) {
  app.post("/v1/admin/materials", async (request, reply) => {
    const user = await requireRole(request, reply, "ADMIN");
    if (!user) return;
    const body = (request.body ?? {}) as {
      type?: string;
      title?: string;
      subtitle?: string;
      templateId?: string;
      topicIds?: unknown;
      estMinutes?: unknown;
      attach?: { lessonId?: string; kind?: string; groupLabel?: string | null };
    };
    const template = body.templateId ? exerciseTemplateMeta(body.templateId) : null;
    const type = template ? template.materialType : body.type;
    if (!type || !materialTypes.has(type) || !body.title?.trim()) {
      return reply.code(400).send({ error: { code: "VALIDATION", messageKa: "ტიპი და სათაური საჭიროა." } });
    }
    if (body.templateId && !template) {
      return reply.code(400).send({ error: { code: "VALIDATION", messageKa: "ასეთი შაბლონი არ არსებობს." } });
    }
    const title = body.title.trim();
    const content = starterContent(type, template?.id);
    if (exerciseTypes.has(type)) content.title = title;
    const topicIds = stringList(body.topicIds);
    const lesson = body.attach?.lessonId
      ? await prisma.lesson.findUnique({ where: { id: body.attach.lessonId }, select: { id: true, studentId: true } })
      : null;
    if (body.attach?.lessonId && !lesson) {
      return reply.code(404).send({ error: { code: "NOT_FOUND", messageKa: "გაკვეთილი ვერ მოიძებნა." } });
    }
    const row = await prisma.material.create({
      data: {
        type: type as "INFO_CARD",
        title,
        subtitle: body.subtitle?.trim() || null,
        estMinutes: typeof body.estMinutes === "number" && body.estMinutes > 0 ? Math.round(body.estMinutes) : null,
        content: content as object,
        status: "DRAFT",
        origin: "MANUAL",
        createdById: user.id,
        ...(topicIds.length ? { topics: { create: topicIds.map((topicId) => ({ topicId })) } } : {}),
      },
    });
    if (lesson) {
      const last = await prisma.assignment.findFirst({ where: { lessonId: lesson.id }, orderBy: { order: "desc" }, select: { order: true } });
      const kind = body.attach?.kind && assignmentKinds.has(body.attach.kind) ? body.attach.kind : "LESSON_MATERIAL";
      await prisma.assignment.create({
        data: {
          studentId: lesson.studentId,
          materialId: row.id,
          lessonId: lesson.id,
          kind: kind as "LESSON_MATERIAL",
          groupLabel: body.attach?.groupLabel?.trim() || null,
          order: (last?.order ?? -1) + 1,
          readyForStudent: false,
        },
      });
    }
    return { id: row.id };
  });

  app.get("/v1/admin/materials", async (request, reply) => {
    const user = await requireRole(request, reply, "ADMIN");
    if (!user) return;
    const query = request.query as { type?: string; status?: string; q?: string; state?: string };
    const types = (query.type ?? "").split(",").filter((item) => materialTypes.has(item));
    const status = query.status === "DRAFT" || query.status === "PUBLISHED" || query.status === "ARCHIVED" ? query.status : undefined;
    const q = query.q?.trim();
    const rows = await prisma.material.findMany({
      where: {
        ...(types.length ? { type: { in: types as never[] } } : {}),
        ...(status ? { status } : { status: { not: "ARCHIVED" } }),
        ...(q ? { OR: [{ title: { contains: q, mode: "insensitive" } }, { tags: { has: q } }] } : {}),
      },
      select: materialListSelect,
      orderBy: { updatedAt: "desc" },
    });
    const items = rows.map(summarize);
    const state = query.state;
    const filtered = state === "empty"
      ? items.filter((item) => item.readiness.empty)
      : state === "partial"
        ? items.filter((item) => !item.readiness.empty && !item.readiness.ready)
        : state === "ready"
          ? items.filter((item) => item.readiness.ready)
          : state === "changes"
            ? items.filter((item) => item.hasDraft)
            : items;
    return {
      items: filtered,
      counts: {
        all: items.length,
        empty: items.filter((item) => item.readiness.empty).length,
        partial: items.filter((item) => !item.readiness.empty && !item.readiness.ready).length,
        ready: items.filter((item) => item.readiness.ready).length,
        changes: items.filter((item) => item.hasDraft).length,
      },
    };
  });

  app.get("/v1/admin/materials/:id", async (request, reply) => {
    const user = await requireRole(request, reply, "ADMIN");
    if (!user) return;
    const { id } = request.params as { id: string };
    const row = await prisma.material.findUnique({
      where: { id },
      include: {
        personalFor: { select: { id: true, user: { select: { name: true } } } },
        topics: { include: { topic: { select: { id: true, number: true, titleKa: true, titleEs: true, internalRef: true } } } },
        assignments: {
          include: {
            student: { select: { id: true, user: { select: { name: true } } } },
            lesson: { select: { id: true, number: true, title: true } },
          },
          orderBy: { order: "asc" },
        },
        progress: { select: { status: true } },
        revisions: { select: { id: true, title: true, createdAt: true, note: true }, orderBy: { createdAt: "desc" }, take: 8 },
      },
    });
    if (!row) return notFound(reply);
    const working = row.draft ?? row.content;
    return {
      id: row.id,
      type: row.type,
      title: row.title,
      subtitle: row.subtitle,
      description: row.description,
      content: working,
      hasDraft: row.draft !== null,
      status: row.status,
      origin: row.origin,
      tags: row.tags,
      estMinutes: row.estMinutes,
      updatedAt: row.updatedAt.toISOString(),
      personalFor: row.personalFor ? { id: row.personalFor.id, name: row.personalFor.user.name } : null,
      assets: signAssets(row.content, row.draft),
      readiness: materialReadiness(row.type, working),
      topics: row.topics.map((link) => link.topic).sort((a, b) => a.number - b.number),
      usage: row.assignments.map((item) => ({
        id: item.id,
        kind: item.kind,
        groupLabel: item.groupLabel,
        readyForStudent: item.readyForStudent,
        studentId: item.student.id,
        studentName: item.student.user.name,
        lesson: item.lesson ? { id: item.lesson.id, number: item.lesson.number, title: item.lesson.title } : null,
      })),
      stats: {
        opened: row.progress.filter((item) => item.status !== "NOT_STARTED").length,
        completed: row.progress.filter((item) => item.status === "COMPLETED").length,
      },
      revisions: row.revisions.map((revision) => ({
        id: revision.id,
        title: revision.title,
        note: revision.note,
        createdAt: revision.createdAt.toISOString(),
      })),
    };
  });

  app.patch("/v1/admin/materials/:id", async (request, reply) => {
    const user = await requireRole(request, reply, "ADMIN");
    if (!user) return;
    const { id } = request.params as { id: string };
    const body = (request.body ?? {}) as {
      title?: unknown;
      subtitle?: unknown;
      description?: unknown;
      content?: unknown;
      estMinutes?: unknown;
      tags?: unknown;
      topicIds?: unknown;
    };
    const existing = await prisma.material.findUnique({ where: { id }, select: { id: true, type: true, status: true, content: true, draft: true } });
    if (!existing) return notFound(reply);
    if (body.title !== undefined && (typeof body.title !== "string" || body.title.trim().length === 0)) {
      return reply.code(400).send({ error: { code: "VALIDATION", messageKa: "სათაური ცარიელია." } });
    }
    if (body.content !== undefined && !isRecord(body.content)) {
      return reply.code(400).send({ error: { code: "VALIDATION", messageKa: "შიგთავსის ფორმა არასწორია." } });
    }
    const content = isRecord(body.content) ? body.content : undefined;
    const live = existing.status === "PUBLISHED";
    const sameAsPublished = content !== undefined && JSON.stringify(content) === JSON.stringify(existing.content);
    const contentData = content === undefined
      ? {}
      : live
        ? { draft: sameAsPublished ? prismaNull() : (content as object) }
        : { content: content as object, draft: prismaNull() };
    const topicIds = body.topicIds === undefined ? undefined : stringList(body.topicIds);
    const saved = await prisma.material.update({
      where: { id },
      data: {
        ...(typeof body.title === "string" ? { title: body.title.trim() } : {}),
        ...(body.subtitle === null || typeof body.subtitle === "string" ? { subtitle: typeof body.subtitle === "string" ? body.subtitle.trim() || null : null } : {}),
        ...(body.description === null || typeof body.description === "string" ? { description: typeof body.description === "string" ? body.description.trim() || null : null } : {}),
        ...(body.estMinutes === null ? { estMinutes: null } : typeof body.estMinutes === "number" && body.estMinutes > 0 ? { estMinutes: Math.round(body.estMinutes) } : {}),
        ...(body.tags !== undefined ? { tags: stringList(body.tags).map((tag) => tag.trim()).filter(Boolean).slice(0, 20) } : {}),
        ...(topicIds ? { topics: { deleteMany: {}, create: topicIds.map((topicId) => ({ topicId })) } } : {}),
        ...contentData,
      },
      select: { id: true, type: true, title: true, updatedAt: true, content: true, draft: true },
    });
    if (content !== undefined) await syncAssetLinks(id, saved.content, saved.draft);
    const working = saved.draft ?? saved.content;
    return {
      id: saved.id,
      title: saved.title,
      updatedAt: saved.updatedAt.toISOString(),
      hasDraft: saved.draft !== null,
      readiness: materialReadiness(saved.type, working),
      assets: signAssets(working),
    };
  });

  app.post("/v1/admin/materials/:id/publish", async (request, reply) => {
    const user = await requireRole(request, reply, "ADMIN");
    if (!user) return;
    const { id } = request.params as { id: string };
    const material = await prisma.material.findUnique({ where: { id } });
    if (!material) return notFound(reply);
    const working = material.draft ?? material.content;
    const readiness = materialReadiness(material.type, working);
    if (!readiness.ready) {
      const missing = readiness.checks.filter((check) => check.required && !check.done).map((check) => check.labelKa);
      return reply.code(400).send({ error: { code: "NOT_READY", messageKa: `ჯერ შეავსე: ${missing.join(", ")}.`, details: { missing } } });
    }
    if (exerciseTypes.has(material.type) && !exerciseContentSchema.safeParse(working).success) {
      return reply.code(400).send({ error: { code: "VALIDATION", messageKa: "სავარჯიშოს ფორმა არასწორია. ჯერ შეასწორე და მერე გამოაქვეყნე." } });
    }
    await prisma.materialRevision.create({
      data: {
        materialId: material.id,
        title: material.title,
        content: working as object,
        note: material.status === "PUBLISHED" ? "update" : "publish",
        createdById: user.id,
      },
    });
    const saved = await prisma.material.update({
      where: { id },
      data: { status: "PUBLISHED", content: working as object, draft: prismaNull() },
      select: { id: true, status: true },
    });
    return saved;
  });

  app.post("/v1/admin/materials/:id/discard-draft", async (request, reply) => {
    const user = await requireRole(request, reply, "ADMIN");
    if (!user) return;
    const { id } = request.params as { id: string };
    const material = await prisma.material.findUnique({ where: { id }, select: { id: true, content: true } });
    if (!material) return notFound(reply);
    await prisma.material.update({ where: { id }, data: { draft: prismaNull() } });
    await syncAssetLinks(id, material.content);
    return { ok: true };
  });

  app.post("/v1/admin/materials/:id/duplicate", async (request, reply) => {
    const user = await requireRole(request, reply, "ADMIN");
    if (!user) return;
    const { id } = request.params as { id: string };
    const source = await prisma.material.findUnique({ where: { id }, include: { topics: true } });
    if (!source) return notFound(reply);
    const working = (source.draft ?? source.content) as object;
    const copy = await prisma.material.create({
      data: {
        type: source.type,
        title: `${source.title} (ასლი)`,
        subtitle: source.subtitle,
        description: source.description,
        content: working,
        status: "DRAFT",
        origin: "MANUAL",
        tags: source.tags,
        estMinutes: source.estMinutes,
        createdById: user.id,
        topics: { create: source.topics.map((link) => ({ topicId: link.topicId })) },
      },
    });
    await syncAssetLinks(copy.id, working);
    return { id: copy.id };
  });

  app.post("/v1/admin/materials/:id/archive", async (request, reply) => {
    const user = await requireRole(request, reply, "ADMIN");
    if (!user) return;
    const { id } = request.params as { id: string };
    const { archived } = (request.body ?? {}) as { archived?: boolean };
    const material = await prisma.material.findUnique({ where: { id }, select: { id: true, _count: { select: { revisions: true } } } });
    if (!material) return notFound(reply);
    const status = archived === false ? (material._count.revisions > 0 ? "PUBLISHED" : "DRAFT") : "ARCHIVED";
    await prisma.material.update({ where: { id }, data: { status } });
    return { id, status };
  });

  app.delete("/v1/admin/materials/:id", async (request, reply) => {
    const user = await requireRole(request, reply, "ADMIN");
    if (!user) return;
    const { id } = request.params as { id: string };
    const material = await prisma.material.findUnique({
      where: { id },
      select: { id: true, _count: { select: { assignments: true, progress: true } } },
    });
    if (!material) return notFound(reply);
    const attempts = await prisma.exerciseAttempt.count({ where: { materialId: id } });
    if (material._count.assignments > 0 || material._count.progress > 0 || attempts > 0) {
      return reply.code(409).send({ error: { code: "IN_USE", messageKa: "მასალა გაკვეთილში გამოიყენება. ჯერ ამოიღე გაკვეთილიდან ან გადაიტანე არქივში." } });
    }
    await prisma.material.delete({ where: { id } });
    return { ok: true };
  });
}

function prismaNull() {
  return Prisma.DbNull;
}

function summarize(row: {
  id: string;
  type: string;
  title: string;
  subtitle: string | null;
  status: string;
  origin: string;
  tags: string[];
  estMinutes: number | null;
  content: unknown;
  draft: unknown;
  updatedAt: Date;
  personalFor: { user: { name: string } } | null;
  topics: { topic: { number: number; titleKa: string } }[];
  assignments: {
    id: string;
    kind: string;
    readyForStudent: boolean;
    student: { user: { name: string } };
    lesson: { number: number; title: string } | null;
  }[];
}) {
  const readiness = materialReadiness(row.type, row.draft ?? row.content);
  const content = isRecord(row.draft ?? row.content) ? ((row.draft ?? row.content) as Rec) : {};
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    subtitle: row.subtitle,
    status: row.status,
    origin: row.origin,
    tags: row.tags,
    estMinutes: row.estMinutes,
    templateId: typeof content.templateId === "string" ? content.templateId : null,
    hasDraft: row.draft !== null,
    personalFor: row.personalFor?.user.name ?? null,
    readiness: {
      ready: readiness.ready,
      empty: readiness.empty,
      requiredDone: readiness.requiredDone,
      requiredTotal: readiness.requiredTotal,
      summaryKa: readiness.summaryKa,
    },
    updatedAt: row.updatedAt.toISOString(),
    topics: row.topics.map((link) => link.topic).sort((a, b) => a.number - b.number),
    usage: row.assignments.map((item) => ({
      studentName: item.student.user.name,
      lessonNumber: item.lesson?.number ?? null,
      lessonTitle: item.lesson?.title ?? null,
      readyForStudent: item.readyForStudent,
      kind: item.kind,
    })),
  };
}
