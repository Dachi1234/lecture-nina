import { describe, expect, it } from "vitest";
import { exerciseContentSchema, materialReadiness, parseViewerContent, starterContent } from "@nina/contracts";

describe("materialReadiness", () => {
  it("treats a fresh starter as empty for every wizard type", () => {
    for (const type of ["VOCAB", "INFO_CARD", "DIALOGUE", "VIDEO", "AUDIO", "STORY", "GRAMMAR", "PRONUNCIATION", "DOCUMENT", "GRADED_READER"]) {
      const readiness = materialReadiness(type, starterContent(type));
      expect(readiness.ready, type).toBe(false);
      expect(parseViewerContent(type, starterContent(type)), type).not.toBeNull();
    }
  });

  it("requires three translated words for a vocabulary list", () => {
    const content = {
      layout: "list",
      title: { es: "En el café" },
      entries: [
        { es: "café", ka: "ყავა" },
        { es: "té", ka: "ჩაი" },
        { es: "cuenta", ka: "" },
      ],
    };
    expect(materialReadiness("VOCAB", content).ready).toBe(false);
    content.entries[2]!.ka = "ანგარიში";
    const readiness = materialReadiness("VOCAB", content);
    expect(readiness.ready).toBe(true);
    expect(readiness.checks.find((check) => check.id === "audio")?.done).toBe(false);
  });

  it("accepts designed vocabulary cards without a word list", () => {
    expect(materialReadiness("VOCAB", { layout: "image", title: { es: "En el café" }, pages: [{ assetId: "a1" }] }).ready).toBe(true);
  });

  it("needs two speakers and two lines for a dialogue", () => {
    const content = starterContent("DIALOGUE") as { lines: { es: string }[] };
    content.lines[0]!.es = "¡Hola!";
    expect(materialReadiness("DIALOGUE", content).ready).toBe(false);
    content.lines[1]!.es = "¿Qué tal?";
    expect(materialReadiness("DIALOGUE", content).ready).toBe(true);
  });

  it("marks a starter exercise incomplete until the steps are filled", () => {
    const content = starterContent("EXERCISE", "multiple_choice") as { steps: { prompt: { ka: string }; options: { text: string }[] }[] };
    expect(materialReadiness("EXERCISE", content).ready).toBe(false);
    const step = content.steps[0]!;
    step.prompt.ka = "ღამე მშვიდობისა";
    step.options.forEach((option, index) => { option.text = ["buenas noches", "buenos días", "hola"][index]!; });
    const readiness = materialReadiness("EXERCISE", content);
    expect(readiness.ready).toBe(true);
    expect(exerciseContentSchema.safeParse(content).success).toBe(true);
  });

  it("uses the matching template material type for games and checkpoints", () => {
    expect((starterContent("GAME", "drag_sort") as { templateId: string }).templateId).toBe("drag_sort");
    expect(materialReadiness("CHECKPOINT", starterContent("CHECKPOINT")).ready).toBe(false);
  });

  it("requires a rule and two examples for grammar", () => {
    expect(materialReadiness("GRAMMAR", { ruleKa: "querer = მინდა", examples: [{ es: "Quiero un café." }] }).ready).toBe(false);
    expect(materialReadiness("GRAMMAR", { ruleKa: "querer = მინდა", examples: [{ es: "Quiero un café." }, { es: "¿Quieres té?" }] }).ready).toBe(true);
  });
});
