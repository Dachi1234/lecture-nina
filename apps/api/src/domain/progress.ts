export type ProgressStatus = "NOT_STARTED" | "OPENED" | "COMPLETED";
export type LessonStatusName = "NEW" | "IN_PROGRESS" | "DONE";
export type AssignmentKindName = "LESSON_MATERIAL" | "HOMEWORK" | "PERSONAL" | "REVIEW";

export type ProgressItem = {
  id: string;
  kind: AssignmentKindName;
  readyForStudent: boolean;
  order: number;
  status: ProgressStatus;
  title: string;
};

export type LessonSnapshot = {
  id: string;
  number: number;
  date: string;
  readyForStudent: boolean;
  statusOverride: "AUTO" | "DONE";
  topicNumbers: number[];
  items: ProgressItem[];
};

export function visibleItems(items: ProgressItem[]) {
  return items.filter((item) => item.readyForStudent).sort((a, b) => a.order - b.order);
}

export function lessonStatus(lesson: Pick<LessonSnapshot, "statusOverride" | "items">): LessonStatusName {
  if (lesson.statusOverride === "DONE") return "DONE";
  const visible = visibleItems(lesson.items);
  const anyOpened = visible.some((item) => item.status !== "NOT_STARTED");
  if (!anyOpened) return "NEW";
  const nonHomework = visible.filter((item) => item.kind !== "HOMEWORK");
  const done = nonHomework.length > 0 && nonHomework.every((item) => item.status === "COMPLETED");
  return done ? "DONE" : "IN_PROGRESS";
}

export function lessonCounter(items: ProgressItem[]) {
  const visible = visibleItems(items);
  const completed = visible.filter((item) => item.status === "COMPLETED").length;
  return { completed, total: visible.length };
}

export function coveredTopicNumbers(lessons: LessonSnapshot[]) {
  const numbers = new Set<number>();
  for (const lesson of lessons) {
    if (!lesson.readyForStudent) continue;
    for (const number of lesson.topicNumbers) numbers.add(number);
  }
  return [...numbers].sort((a, b) => a - b);
}

export function maxCoveredTopic(lessons: LessonSnapshot[]) {
  const numbers = coveredTopicNumbers(lessons);
  return numbers.at(-1) ?? 0;
}

export function vocabularyVisible<T extends { topicNumber: number | null; personal: boolean }>(
  entries: T[],
  topicMax: number,
  covered: number[],
) {
  const coveredSet = new Set(covered.filter((number) => number <= topicMax));
  return entries.filter((entry) => entry.personal || (entry.topicNumber !== null && coveredSet.has(entry.topicNumber)));
}

export function blockProgress(topicNumbers: number[], covered: number[]) {
  const coveredSet = new Set(covered);
  const done = topicNumbers.filter((number) => coveredSet.has(number)).length;
  return { done, total: topicNumbers.length };
}

export function checkpointPassed(bestScore: number | null, threshold = 0.7) {
  return bestScore !== null && bestScore >= threshold;
}

export function continueLearning(lessons: LessonSnapshot[]) {
  const ready = lessons.filter((lesson) => lesson.readyForStudent);
  const ranked = [...ready].sort((a, b) => b.date.localeCompare(a.date));
  const current =
    ranked.find((lesson) => lessonStatus(lesson) === "IN_PROGRESS") ??
    ranked.find((lesson) => lessonStatus(lesson) === "NEW");
  if (!current) return null;
  const nextItem = visibleItems(current.items).find((item) => item.status !== "COMPLETED") ?? null;
  return { lesson: current, nextItem };
}

const textbookName = "Nuevo Sueña";

export function toStudentTopic(topic: {
  id: string;
  number: number;
  titleKa: string;
  titleEs?: string | null;
  internalRef?: string | null;
}) {
  return {
    id: topic.id,
    number: topic.number,
    titleKa: topic.titleKa,
    titleEs: topic.titleEs ?? null,
  };
}

export function assertStudentSafe(value: unknown) {
  const text = JSON.stringify(value);
  if (text.includes("internalRef") || text.toLowerCase().includes(textbookName.toLowerCase())) {
    throw new Error("student payload leaked internal curriculum data");
  }
}
