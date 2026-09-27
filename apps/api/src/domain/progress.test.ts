import { describe, expect, it } from "vitest";
import { leadInputSchema } from "@nina/contracts";
import {
  assertStudentSafe,
  blockProgress,
  checkpointPassed,
  continueLearning,
  coveredTopicNumbers,
  lessonCounter,
  lessonStatus,
  toStudentTopic,
  vocabularyVisible,
  type LessonSnapshot,
  type ProgressItem,
} from "./progress.js";

function item(partial: Partial<ProgressItem> & Pick<ProgressItem, "id" | "status">): ProgressItem {
  return {
    kind: "LESSON_MATERIAL",
    readyForStudent: true,
    order: 0,
    title: partial.id,
    ...partial,
  };
}

function lesson(partial: Partial<LessonSnapshot> & Pick<LessonSnapshot, "id">): LessonSnapshot {
  return {
    number: 1,
    date: "2026-09-26T00:00:00.000Z",
    readyForStudent: true,
    statusOverride: "AUTO",
    topicNumbers: [],
    items: [],
    ...partial,
  };
}

describe("lesson status", () => {
  it("is new when nothing is opened", () => {
    expect(lessonStatus(lesson({ id: "l", items: [item({ id: "a", status: "NOT_STARTED" })] }))).toBe("NEW");
  });

  it("is in progress after an item is opened", () => {
    expect(
      lessonStatus(
        lesson({
          id: "l",
          items: [item({ id: "a", status: "OPENED" }), item({ id: "b", status: "NOT_STARTED", order: 1 })],
        }),
      ),
    ).toBe("IN_PROGRESS");
  });

  it("is done when every non-homework item is completed", () => {
    expect(
      lessonStatus(
        lesson({
          id: "l",
          items: [
            item({ id: "a", status: "COMPLETED" }),
            item({ id: "h", status: "OPENED", kind: "HOMEWORK", order: 1 }),
          ],
        }),
      ),
    ).toBe("DONE");
  });

  it("honors a manual done override", () => {
    expect(lessonStatus(lesson({ id: "l", statusOverride: "DONE", items: [item({ id: "a", status: "NOT_STARTED" })] }))).toBe(
      "DONE",
    );
  });

  it("ignores items that are not ready", () => {
    expect(
      lessonStatus(
        lesson({
          id: "l",
          items: [item({ id: "hidden", status: "OPENED", readyForStudent: false })],
        }),
      ),
    ).toBe("NEW");
  });
});

describe("counters and curriculum filters", () => {
  it("counts homework in the lesson counter", () => {
    expect(
      lessonCounter([
        item({ id: "a", status: "COMPLETED" }),
        item({ id: "h", status: "NOT_STARTED", kind: "HOMEWORK", order: 1 }),
      ]),
    ).toEqual({ completed: 1, total: 2 });
  });

  it("uses only ready lessons for covered topics", () => {
    const lessons = [
      lesson({ id: "a", topicNumbers: [1, 14] }),
      lesson({ id: "b", readyForStudent: false, topicNumbers: [30] }),
    ];
    expect(coveredTopicNumbers(lessons)).toEqual([1, 14]);
  });

  it("filters vocabulary up to a covered topic and keeps personal words", () => {
    const entries = [
      { es: "hola", topicNumber: 1, personal: false },
      { es: "metro", topicNumber: 20, personal: false },
      { es: "Valencia", topicNumber: null, personal: true },
    ];
    expect(vocabularyVisible(entries, 16, [1, 14, 16]).map((entry) => entry.es)).toEqual(["hola", "Valencia"]);
  });

  it("computes block progress and checkpoint pass", () => {
    expect(blockProgress([1, 2, 3, 4], [1, 2, 3])).toEqual({ done: 3, total: 4 });
    expect(checkpointPassed(0.95)).toBe(true);
    expect(checkpointPassed(0.5)).toBe(false);
  });

  it("continues the newest in-progress lesson at the first unfinished item", () => {
    const older = lesson({
      id: "old",
      date: "2026-09-01T00:00:00.000Z",
      items: [item({ id: "old-item", status: "OPENED" })],
    });
    const current = lesson({
      id: "now",
      date: "2026-09-26T00:00:00.000Z",
      items: [
        item({ id: "done", status: "COMPLETED" }),
        item({ id: "next", status: "OPENED", order: 1 }),
      ],
    });
    expect(continueLearning([older, current])?.nextItem?.id).toBe("next");
  });
});

describe("student safety", () => {
  it("drops the textbook mapping before a topic reaches a student", () => {
    const safe = toStudentTopic({
      id: "t",
      number: 14,
      titleKa: "საკვები და სასმელი",
      titleEs: "comida",
      internalRef: "Nuevo Sueña 4",
    });
    expect(safe).not.toHaveProperty("internalRef");
    expect(() => assertStudentSafe(safe)).not.toThrow();
    expect(() => assertStudentSafe({ internalRef: "unit 4" })).toThrow(/leaked/);
  });
});

describe("lead validation", () => {
  it("requires a Georgian phone and consent", () => {
    const parsed = leadInputSchema.safeParse({
      name: "მარიამი",
      phone: "+995555123456",
      channel: "WHATSAPP",
      consent: true,
      days: ["MON"],
      t: 4000,
    });
    expect(parsed.success).toBe(true);
    const missing = leadInputSchema.safeParse({
      name: "",
      phone: "555",
      channel: "WHATSAPP",
      consent: true,
    });
    expect(missing.success).toBe(false);
  });
});
