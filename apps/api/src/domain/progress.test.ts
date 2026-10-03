import { describe, expect, it } from "vitest";
import { leadInputSchema } from "@nina/contracts";
import {
  assertStudentSafe,
  checkpointPassed,
  effectiveItems,
  lessonCounter,
  lessonStatus,
  numberLessons,
  studentItems,
  syllabusProgress,
  type OverrideRow,
  type PlanItemRow,
} from "./progress.js";

const plan: PlanItemRow[] = [
  { id: "p1", materialId: "vocab", section: "CLASS", order: 1, noteKa: null },
  { id: "p0", materialId: "warm", section: "WARMUP", order: 0, noteKa: null },
  { id: "p2", materialId: "hw", section: "HOMEWORK", order: 0, noteKa: "plan note" },
];

function override(partial: Partial<OverrideRow> & Pick<OverrideRow, "id">): OverrideRow {
  return { planItemId: null, materialId: null, section: "CLASS", order: 0, noteKa: null, hidden: false, held: false, ...partial };
}

describe("effective lesson items", () => {
  it("follows the plan live and orders by section", () => {
    expect(effectiveItems(plan, []).map((item) => item.materialId)).toEqual(["warm", "vocab", "hw"]);
  });

  it("applies hides, holds and extras without touching the plan", () => {
    const items = effectiveItems(plan, [
      override({ id: "o1", planItemId: "p0", hidden: true }),
      override({ id: "o2", planItemId: "p2", held: true, noteKa: "after class" }),
      override({ id: "o3", materialId: "extra", section: "CLASS", order: 5 }),
    ]);
    expect(items.map((item) => item.materialId)).toEqual(["warm", "vocab", "extra", "hw"]);
    expect(items.find((item) => item.materialId === "hw")?.noteKa).toBe("after class");
    expect(studentItems(items).map((item) => item.materialId)).toEqual(["vocab", "extra"]);
  });

  it("ignores an extra that duplicates a plan item", () => {
    expect(effectiveItems(plan, [override({ id: "o", materialId: "vocab" })])).toHaveLength(3);
  });
});

describe("lesson status", () => {
  it("is new until something is opened", () => {
    expect(lessonStatus([{ section: "CLASS", status: "NOT_STARTED" }])).toBe("NEW");
  });

  it("is done when class work is complete even if homework is open", () => {
    expect(
      lessonStatus([
        { section: "CLASS", status: "COMPLETED" },
        { section: "HOMEWORK", status: "NOT_STARTED" },
      ]),
    ).toBe("DONE");
  });

  it("counts homework-only lessons by their homework", () => {
    expect(lessonStatus([{ section: "HOMEWORK", status: "OPENED" }])).toBe("IN_PROGRESS");
  });

  it("is done for an empty lesson that took place", () => {
    expect(lessonStatus([], true)).toBe("DONE");
    expect(lessonCounter([{ section: "CLASS", status: "COMPLETED" }, { section: "REVIEW", status: "OPENED" }])).toEqual({ completed: 1, total: 2 });
  });
});

describe("syllabus progress", () => {
  const units = [
    { id: "u2", order: 2, titleKa: "კაფეში", titleEs: null, plans: [{ id: "c", order: 1, titleKa: "c", titleEs: null }] },
    {
      id: "u1",
      order: 1,
      titleKa: "მისალმება",
      titleEs: null,
      plans: [
        { id: "a", order: 1, titleKa: "a", titleEs: null },
        { id: "b", order: 2, titleKa: "b", titleEs: null },
      ],
    },
  ];
  const now = new Date("2026-10-03T12:00:00Z");

  it("marks past published lessons done and finds the next plan", () => {
    const result = syllabusProgress(
      units,
      [
        { id: "l1", planId: "a", date: new Date("2026-10-01"), publishedAt: new Date("2026-10-01"), heldAt: null },
        { id: "l2", planId: "b", date: new Date("2026-10-08"), publishedAt: null, heldAt: null },
      ],
      now,
    );
    expect(result.units.map((unit) => unit.state)).toEqual(["current", "upcoming"]);
    expect(result.units[0]?.plans.map((p) => p.state)).toEqual(["done", "scheduled"]);
    expect(result.nextPlan?.id).toBe("c");
    expect(result.done).toBe(1);
  });

  it("completes a unit when every plan was held", () => {
    const result = syllabusProgress(
      units,
      ["a", "b"].map((planId) => ({ id: planId, planId, date: new Date("2026-11-01"), publishedAt: null, heldAt: new Date("2026-10-02") })),
      now,
    );
    expect(result.units.map((unit) => unit.state)).toEqual(["done", "current"]);
  });
});

describe("helpers", () => {
  it("numbers lessons by date", () => {
    const numbers = numberLessons([
      { id: "late", date: new Date("2026-10-10") },
      { id: "early", date: new Date("2026-10-01") },
    ]);
    expect(numbers.get("early")).toBe(1);
    expect(numbers.get("late")).toBe(2);
  });

  it("passes a checkpoint at the threshold", () => {
    expect(checkpointPassed(0.7)).toBe(true);
    expect(checkpointPassed(null)).toBe(false);
  });

  it("blocks internal fields from student payloads", () => {
    expect(() => assertStudentSafe({ titleKa: "მისალმება" })).not.toThrow();
    expect(() => assertStudentSafe({ teacherNotes: "x" })).toThrow(/leaked/);
    expect(() => assertStudentSafe({ privateNote: "x" })).toThrow(/leaked/);
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
