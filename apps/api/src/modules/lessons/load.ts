import { materialReadiness } from "@nina/contracts";
import type { Prisma } from "@nina/db";
import { prisma } from "../../db.js";
import { effectiveItems, studentItems, type EffectiveItem, type Section } from "../../domain/progress.js";

export const materialMeta = {
  id: true,
  title: true,
  subtitle: true,
  description: true,
  type: true,
  status: true,
  estMinutes: true,
  content: true,
  draft: true,
} as const;

export const lessonInclude = {
  plan: {
    select: {
      id: true,
      titleKa: true,
      titleEs: true,
      goalsKa: true,
      teacherNotes: true,
      unit: { select: { id: true, titleKa: true, order: true, course: { select: { id: true, title: true } } } },
      items: { orderBy: { order: "asc" }, include: { material: { select: materialMeta } } },
    },
  },
  items: { include: { material: { select: materialMeta } } },
  student: { select: { id: true, user: { select: { name: true } } } },
  group: { select: { id: true, name: true, members: { select: { studentId: true, student: { select: { user: { select: { name: true } } } } } } } },
} satisfies Prisma.LessonInclude;

export type LoadedLesson = Prisma.LessonGetPayload<{ include: typeof lessonInclude }>;
type Meta = LoadedLesson["items"][number]["material"] & {};

export type ResolvedItem = EffectiveItem & { material: Meta };

export function resolveItems(lesson: LoadedLesson): ResolvedItem[] {
  const materials = new Map<string, Meta>();
  for (const item of lesson.plan?.items ?? []) materials.set(item.materialId, item.material);
  for (const item of lesson.items) if (item.material) materials.set(item.material.id, item.material);
  const planRows = (lesson.plan?.items ?? []).map((item) => ({
    id: item.id,
    materialId: item.materialId,
    section: item.section as Section,
    order: item.order,
    noteKa: item.noteKa,
  }));
  const overrides = lesson.items.map((item) => ({
    id: item.id,
    planItemId: item.planItemId,
    materialId: item.materialId,
    section: item.section as Section,
    order: item.order,
    noteKa: item.noteKa,
    hidden: item.hidden,
    held: item.held,
  }));
  return effectiveItems(planRows, overrides).flatMap((item) => {
    const material = materials.get(item.materialId);
    return material ? [{ ...item, material }] : [];
  });
}

/** What a student actually gets: not hidden, not held back, and published in the library. */
export function visibleToStudent(items: ResolvedItem[]): ResolvedItem[] {
  const visible = new Set(studentItems(items).map((item) => item.key));
  return items.filter((item) => visible.has(item.key) && item.material.status === "PUBLISHED");
}

export function itemHealth(material: Meta) {
  const readiness = materialReadiness(material.type, material.draft ?? material.content);
  return {
    status: material.status,
    hasDraft: material.draft !== null,
    ready: readiness.ready,
    summaryKa: readiness.summaryKa,
  };
}

export function lessonTitle(lesson: { title: string | null; plan: { titleKa: string } | null }) {
  return lesson.title?.trim() || lesson.plan?.titleKa || "გაკვეთილი";
}

export function audienceOf(lesson: Pick<LoadedLesson, "student" | "group">) {
  if (lesson.group) return { kind: "group" as const, id: lesson.group.id, name: lesson.group.name };
  if (lesson.student) return { kind: "student" as const, id: lesson.student.id, name: lesson.student.user.name };
  return null;
}

export async function groupIdsFor(studentId: string) {
  const rows = await prisma.groupMember.findMany({ where: { studentId }, select: { groupId: true } });
  return rows.map((row) => row.groupId);
}

export function studentLessonWhere(studentId: string, groupIds: string[]): Prisma.LessonWhereInput {
  return {
    publishedAt: { not: null },
    OR: [{ studentId }, ...(groupIds.length ? [{ groupId: { in: groupIds } }] : [])],
  };
}

export function audienceLessonWhere(studentId: string, groupIds: string[]): Prisma.LessonWhereInput {
  return { OR: [{ studentId }, ...(groupIds.length ? [{ groupId: { in: groupIds } }] : [])] };
}

export function courseUnits(courseId: string) {
  return prisma.unit.findMany({
    where: { courseId },
    orderBy: { order: "asc" },
    select: {
      id: true,
      order: true,
      titleKa: true,
      titleEs: true,
      plans: { orderBy: { order: "asc" }, select: { id: true, order: true, titleKa: true, titleEs: true } },
    },
  });
}

export function stepCount(content: unknown) {
  if (!content || typeof content !== "object" || !("steps" in content)) return null;
  const steps = (content as { steps?: unknown }).steps;
  return Array.isArray(steps) ? steps.length : null;
}

export function bad(messageKa: string, code = "VALIDATION") {
  return { error: { code, messageKa } };
}
