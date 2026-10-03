export type ProgressStatus = "NOT_STARTED" | "OPENED" | "COMPLETED";
export type LessonStatusName = "NEW" | "IN_PROGRESS" | "DONE";
export type Section = "WARMUP" | "CLASS" | "HOMEWORK" | "REVIEW";

export const SECTIONS: Section[] = ["WARMUP", "CLASS", "HOMEWORK", "REVIEW"];

export type PlanItemRow = {
  id: string;
  materialId: string;
  section: Section;
  order: number;
  noteKa: string | null;
};

export type OverrideRow = {
  id: string;
  planItemId: string | null;
  materialId: string | null;
  section: Section;
  order: number;
  noteKa: string | null;
  hidden: boolean;
  held: boolean;
};

export type EffectiveItem = {
  key: string;
  source: "plan" | "extra";
  planItemId: string | null;
  overrideId: string | null;
  materialId: string;
  section: Section;
  order: number;
  noteKa: string | null;
  hidden: boolean;
  held: boolean;
};

/** Plan items (live) merged with the lesson's own overrides and extras, in teaching order. */
export function effectiveItems(planItems: PlanItemRow[], overrides: OverrideRow[]): EffectiveItem[] {
  const tweaks = new Map(overrides.filter((row) => row.planItemId).map((row) => [row.planItemId!, row]));
  const fromPlan: EffectiveItem[] = planItems.map((item) => {
    const tweak = tweaks.get(item.id);
    return {
      key: item.id,
      source: "plan",
      planItemId: item.id,
      overrideId: tweak?.id ?? null,
      materialId: item.materialId,
      section: item.section,
      order: item.order,
      noteKa: tweak?.noteKa ?? item.noteKa,
      hidden: tweak?.hidden ?? false,
      held: tweak?.held ?? false,
    };
  });
  const planMaterials = new Set(planItems.map((item) => item.materialId));
  const extras: EffectiveItem[] = overrides
    .filter((row) => !row.planItemId && row.materialId && !planMaterials.has(row.materialId))
    .map((row) => ({
      key: row.id,
      source: "extra",
      planItemId: null,
      overrideId: row.id,
      materialId: row.materialId!,
      section: row.section,
      order: row.order,
      noteKa: row.noteKa,
      hidden: row.hidden,
      held: row.held,
    }));
  const rank = (item: EffectiveItem) => SECTIONS.indexOf(item.section);
  return [...fromPlan, ...extras].sort(
    (a, b) => rank(a) - rank(b) || (a.source === b.source ? a.order - b.order : a.source === "plan" ? -1 : 1),
  );
}

export function studentItems(items: EffectiveItem[]) {
  return items.filter((item) => !item.hidden && !item.held);
}

export type StatusItem = { section: Section; status: ProgressStatus };

export function lessonStatus(items: StatusItem[], held = false): LessonStatusName {
  if (items.length === 0) return held ? "DONE" : "NEW";
  if (!items.some((item) => item.status !== "NOT_STARTED")) return "NEW";
  const core = items.filter((item) => item.section !== "HOMEWORK");
  const counted = core.length > 0 ? core : items;
  return counted.every((item) => item.status === "COMPLETED") ? "DONE" : "IN_PROGRESS";
}

export function lessonCounter(items: StatusItem[]) {
  return { completed: items.filter((item) => item.status === "COMPLETED").length, total: items.length };
}

export type SyllabusUnit = {
  id: string;
  order: number;
  titleKa: string;
  titleEs: string | null;
  plans: { id: string; order: number; titleKa: string; titleEs: string | null }[];
};

export type SyllabusLesson = { id: string; planId: string | null; date: Date; publishedAt: Date | null; heldAt: Date | null };

export type PlanState = "done" | "scheduled" | "upcoming";
export type UnitState = "done" | "current" | "upcoming";

/** Where an audience is in a course, derived from its lessons. */
export function syllabusProgress(units: SyllabusUnit[], lessons: SyllabusLesson[], now = new Date()) {
  const byPlan = new Map<string, SyllabusLesson[]>();
  for (const lesson of lessons) {
    if (!lesson.planId) continue;
    byPlan.set(lesson.planId, [...(byPlan.get(lesson.planId) ?? []), lesson]);
  }
  const planState = (planId: string): PlanState => {
    const rows = byPlan.get(planId) ?? [];
    if (rows.some((row) => row.heldAt || (row.publishedAt && row.date <= now))) return "done";
    return rows.length > 0 ? "scheduled" : "upcoming";
  };
  let currentFound = false;
  const sorted = [...units].sort((a, b) => a.order - b.order);
  const mapped = sorted.map((unit) => {
    const plans = [...unit.plans]
      .sort((a, b) => a.order - b.order)
      .map((plan) => ({ ...plan, state: planState(plan.id), lessonIds: (byPlan.get(plan.id) ?? []).map((row) => row.id) }));
    const done = plans.filter((plan) => plan.state === "done").length;
    let state: UnitState = "upcoming";
    if (plans.length > 0 && done === plans.length) state = "done";
    else if (!currentFound) {
      state = "current";
      currentFound = true;
    }
    return { ...unit, plans, done, total: plans.length, state };
  });
  const allPlans = mapped.flatMap((unit) => unit.plans);
  const nextPlan = allPlans.find((plan) => plan.state === "upcoming") ?? null;
  return {
    units: mapped,
    done: allPlans.filter((plan) => plan.state === "done").length,
    total: allPlans.length,
    nextPlan: nextPlan ? { id: nextPlan.id, titleKa: nextPlan.titleKa } : null,
  };
}

/** Lessons numbered 1..n by date for one viewer. */
export function numberLessons<T extends { id: string; date: Date }>(lessons: T[]) {
  const sorted = [...lessons].sort((a, b) => a.date.getTime() - b.date.getTime());
  return new Map(sorted.map((lesson, index) => [lesson.id, index + 1]));
}

export function checkpointPassed(bestScore: number | null, threshold = 0.7) {
  return bestScore !== null && bestScore >= threshold;
}

const textbookName = "Nuevo Sueña";

export function assertStudentSafe(value: unknown) {
  const text = JSON.stringify(value);
  if (text.includes("internalRef") || text.includes("teacherNotes") || text.includes("privateNote") || text.toLowerCase().includes(textbookName.toLowerCase())) {
    throw new Error("student payload leaked internal data");
  }
}
