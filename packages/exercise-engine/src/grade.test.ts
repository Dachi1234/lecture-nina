import { describe, expect, it } from "vitest";
import { foldAnswer, gradeExercise, gradeStep } from "./grade.js";

describe("exercise graders", () => {
  it("grades a chosen option", () => {
    expect(gradeStep("multiple_choice", { correctId: "a" }, { optionId: "a" }).correct).toBe(true);
    expect(gradeStep("listening", { correctId: "cafe" }, { optionId: "te" }).score).toBe(0);
  });

  it("grades true or false", () => {
    expect(gradeStep("swipe_true_false", { isTrue: false }, { value: false }).correct).toBe(true);
  });

  it("gives partial credit for sorting", () => {
    const step = { items: [{ id: "1", bucketId: "el" }, { id: "2", bucketId: "la" }] };
    const graded = gradeStep("drag_sort", step, { placements: { "1": "el", "2": "el" } });
    expect(graded.score).toBe(0.5);
    expect(graded.correct).toBe(false);
  });

  it("accepts an alternate sentence", () => {
    const step = { answer: ["Soy", "Ana"], acceptAlso: [["Me", "llamo", "Ana"]] };
    expect(gradeStep("sentence_builder", step, { order: ["Me", "llamo", "Ana"] }).correct).toBe(true);
    expect(gradeStep("sentence_builder", step, { order: ["Ana", "Soy"] }).correct).toBe(false);
  });

  it("ignores punctuation that is not on the tile", () => {
    expect(gradeStep("sentence_builder", { answer: ["La", "cuenta,", "por", "favor"] }, { order: ["La", "cuenta", "por", "favor"] }).correct).toBe(true);
    expect(gradeStep("sentence_builder", { answer: ["¿Qué", "vas", "a", "tomar?"] }, { order: ["¿Qué", "vas", "a", "tomar"] }).correct).toBe(true);
    expect(gradeStep("sentence_builder", { answer: ["No,", "gracias"] }, { order: ["No", "gracias"] }).correct).toBe(true);
  });

  it("ignores accents in a fill-in answer", () => {
    expect(foldAnswer("Café")).toBe("cafe");
    const graded = gradeStep("fill_blank", { rows: [{ answer: "café" }] }, { values: ["cafe"] });
    expect(graded.correct).toBe(true);
    const strict = gradeStep("fill_blank", { strictAccents: true, rows: [{ answer: "café" }] }, { values: ["cafe"] });
    expect(strict.correct).toBe(false);
  });

  it("grades every pair", () => {
    const step = { pairs: [{ left: "el café", right: "ყავა" }, { left: "el cuaderno", right: "რვეული" }] };
    expect(gradeStep("matching_pairs", step, { links: { "el café": "ყავა", "el cuaderno": "რვეული" } }).correct).toBe(true);
  });

  it("scores a dialogue choice", () => {
    const step = { nodes: [{ id: "h", choices: [{ isGood: true }, { isGood: false }] }] };
    expect(gradeStep("branching_dialogue", step, { path: [{ nodeId: "h", choiceIndex: 0 }] }).score).toBe(1);
    expect(gradeStep("branching_dialogue", step, { path: [{ nodeId: "h", choiceIndex: 1 }] }).correct).toBe(false);
  });

  it("does not pass an empty checkpoint", () => {
    const graded = gradeExercise(
      { templateId: "checkpoint", passThreshold: 0.7, steps: [{ sections: [{ labelKa: "მისალმება", stepRefs: [] }] }] },
      [{ sections: [[]] }],
    );
    expect(graded.passed).toBe(false);
  });

  it("passes when the average reaches the threshold", () => {
    const graded = gradeExercise(
      {
        templateId: "multiple_choice",
        passThreshold: 0.7,
        steps: [{ correctId: "a" }, { correctId: "b" }, { correctId: "c" }, { correctId: "d" }],
      },
      [{ optionId: "a" }, { optionId: "b" }, { optionId: "c" }, { optionId: "no" }],
    );
    expect(graded.correct).toBe(3);
    expect(graded.score).toBe(0.75);
    expect(graded.passed).toBe(true);
  });
});
