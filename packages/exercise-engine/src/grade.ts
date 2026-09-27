export type GradedStep = { correct: boolean; score: number };

export type GradedExercise = {
  correct: number;
  total: number;
  score: number;
  passed: boolean;
  steps: GradedStep[];
};

type RecordValue = Record<string, unknown>;

function record(value: unknown): RecordValue | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as RecordValue;
}

function list(value: unknown) {
  return Array.isArray(value) ? value : [];
}

export function foldAnswer(value: string, strictAccents = false) {
  const trimmed = value.trim().toLowerCase();
  if (strictAccents) return trimmed;
  return trimmed.normalize("NFD").replace(/\p{M}/gu, "");
}

function sameSequence(left: string[], right: string[]) {
  return left.length === right.length && left.every((item, index) => item === right[index]);
}

/** Tiles omit the punctuation that the answer key keeps on the word („cuenta“ vs „cuenta,“). */
function sentenceToken(value: string) {
  return value.replace(/^[\s¿¡«"“]+|[\s?!.,:;»"”…]+$/gu, "");
}

function fail(): GradedStep {
  return { correct: false, score: 0 };
}

export function gradeStep(templateId: string, step: unknown, answer: unknown): GradedStep {
  const body = record(step);
  const given = record(answer);
  if (!body) return fail();

  if (templateId === "multiple_choice" || templateId === "listening") {
    return given?.optionId === body.correctId ? { correct: true, score: 1 } : fail();
  }

  if (templateId === "swipe_true_false") {
    return given?.value === body.isTrue ? { correct: true, score: 1 } : fail();
  }

  if (templateId === "drag_sort") {
    const items = list(body.items).map(record).filter((item): item is RecordValue => item !== null);
    const placements = record(given?.placements);
    if (items.length === 0) return fail();
    const hits = items.filter((item) => placements?.[String(item.id)] === item.bucketId).length;
    return { correct: hits === items.length, score: hits / items.length };
  }

  if (templateId === "sentence_builder") {
    const order = list(given?.order).filter((item): item is string => typeof item === "string");
    const answer = list(body.answer).filter((item): item is string => typeof item === "string");
    const extras = list(body.acceptAlso).filter(Array.isArray);
    const ordered = order.map(sentenceToken);
    const expected = answer.map(sentenceToken);
    const matched = sameSequence(ordered, expected) || extras.some((option) => sameSequence(ordered, option.filter((item): item is string => typeof item === "string").map(sentenceToken)));
    return matched ? { correct: true, score: 1 } : fail();
  }

  if (templateId === "fill_blank") {
    const rows = list(body.rows).map(record).filter((row): row is RecordValue => row !== null);
    const values = list(given?.values).map((item) => (typeof item === "string" ? item : ""));
    if (rows.length === 0) return fail();
    const strict = body.strictAccents === true;
    const hits = rows.filter((row, index) => foldAnswer(values[index] ?? "", strict) === foldAnswer(String(row.answer ?? ""), strict)).length;
    return { correct: hits === rows.length, score: hits / rows.length };
  }

  if (templateId === "matching_pairs") {
    const pairs = list(body.pairs).map(record).filter((pair): pair is RecordValue => pair !== null);
    const links = record(given?.links);
    if (pairs.length === 0 || !links) return fail();
    const hits = pairs.filter((pair) => {
      const right = pair.right;
      const expected = typeof right === "string" ? right : record(right)?.assetId;
      return links[String(pair.left)] === expected;
    }).length;
    return { correct: hits === pairs.length, score: hits / pairs.length };
  }

  if (templateId === "branching_dialogue") {
    const path = list(given?.path).map(record).filter((hop): hop is RecordValue => hop !== null);
    const nodes = list(body.nodes).map(record).filter((node): node is RecordValue => node !== null);
    if (path.length === 0) return fail();
    let chosen = 0;
    let good = 0;
    for (const hop of path) {
      const node = nodes.find((item) => item.id === hop.nodeId);
      const choices = list(node?.choices).map(record).filter((choice): choice is RecordValue => choice !== null);
      const choice = choices[Number(hop.choiceIndex)];
      if (!choice) continue;
      chosen += 1;
      if (choice.isGood !== false) good += 1;
    }
    if (chosen === 0) return fail();
    return { correct: good === chosen, score: good / chosen };
  }

  if (templateId === "checkpoint") {
    const sections = list(body.sections).map(record).filter((section): section is RecordValue => section !== null);
    const sectionAnswers = list(given?.sections);
    const graded: GradedStep[] = [];
    sections.forEach((section, index) => {
      const refs = list(section.stepRefs).map(record).filter((ref): ref is RecordValue => ref !== null && typeof ref.templateId === "string");
      const answers = list(sectionAnswers[index]);
      refs.forEach((ref, refIndex) => graded.push(gradeStep(String(ref.templateId), ref, answers[refIndex])));
    });
    if (graded.length === 0) return fail();
    const score = graded.reduce((sum, step) => sum + step.score, 0) / graded.length;
    return { correct: graded.every((step) => step.correct), score };
  }

  return fail();
}

export function gradeExercise(content: { templateId: string; passThreshold?: number; steps: unknown[] }, answers: unknown[]): GradedExercise {
  const steps = content.steps.map((step, index) => gradeStep(content.templateId, step, answers[index]));
  const total = steps.length;
  const correct = steps.filter((step) => step.correct).length;
  const score = total === 0 ? 0 : steps.reduce((sum, step) => sum + step.score, 0) / total;
  const threshold = content.passThreshold ?? 0.7;
  return { correct, total, score, passed: total > 0 && score >= threshold, steps };
}
