"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import type { ExerciseContent } from "@nina/contracts";
import { gradeExercise, gradeStep, templateRegistry } from "@nina/exercise-engine";
import { Button } from "@nina/ui";
import type { MaterialPayload } from "./viewers";
import { withLesson } from "@/lib/materials";

type Answer = Record<string, unknown> | null;

export function ExercisePlayer({ material, content }: { material: MaterialPayload; content: ExerciseContent }) {
  const total = content.steps.length;
  const resume = Math.min(Math.max((material.lastStep ?? 1) - 1, 0), Math.max(total - 1, 0));
  const [index, setIndex] = useState(resume);
  const [answers, setAnswers] = useState<Answer[]>(() => content.steps.map(() => null));
  const [checked, setChecked] = useState<boolean[]>(() => content.steps.map(() => false));
  const [done, setDone] = useState<{ correct: number; total: number; passed: boolean } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const back = material.lessonId ? `/app/lessons/${material.lessonId}` : "/app/lessons";
  const query = material.lessonId ? `?lessonId=${material.lessonId}` : "";
  const meta = templateRegistry[content.templateId];

  function update(stepIndex: number, answer: Answer) {
    setAnswers((current) => current.map((item, index) => (index === stepIndex ? answer : item)));
    setChecked((current) => current.map((item, index) => (index === stepIndex ? false : item)));
  }

  function checkAt(stepIndex: number) {
    setChecked((current) => current.map((item, index) => (index === stepIndex ? true : item)));
  }

  async function savePosition(step: number) {
    if (material.preview) return;
    await fetch(withLesson(`/v1/me/exercises/${material.id}/position`, material.lessonId), {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lastStep: step }),
    });
  }

  async function submit() {
    if (material.preview) {
      const graded = gradeExercise(content, answers);
      setDone({ correct: graded.correct, total: graded.total, passed: graded.passed });
      return;
    }
    setBusy(true);
    setError("");
    const response = await fetch(withLesson(`/v1/me/exercises/${material.id}/attempts`, material.lessonId), {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers }),
    });
    setBusy(false);
    if (!response.ok) {
      setError("შედეგი ვერ შეინახა.");
      return;
    }
    const body = (await response.json()) as { correct: number; total: number; passed: boolean };
    setDone(body);
  }

  function restart() {
    setIndex(0);
    setAnswers(content.steps.map(() => null));
    setChecked(content.steps.map(() => false));
    setDone(null);
    void savePosition(1);
  }

  if (done?.passed) {
    return (
      <section className="mx-auto flex max-w-xl flex-col items-start gap-4 rounded-2xl bg-exercise p-8">
        <p className="font-hand text-6xl leading-none text-burgundy">{content.feedback?.finishTitleEs ?? "¡Muy bien!"}</p>
        <h1 className="text-3xl font-bold">სავარჯიშო დასრულებულია</h1>
        <p className="text-lg text-ink-muted">{done.correct} / {done.total} · {material.preview ? "გადახედვაა, პროგრესი არ ინახება" : "მასალა მოინიშნა დასრულებულად"}</p>
        <div className="flex flex-wrap gap-3">
          <Button type="button" variant="outline" onClick={restart}>თავიდან</Button>
          {material.next ? <Link href={`/app/m/${material.next.id}${query}`} className="inline-flex h-12 items-center rounded-xl bg-teal-deep px-6 font-semibold text-on-dark">შემდეგი მასალა →</Link> : <Link href={back} className="inline-flex h-12 items-center rounded-xl bg-teal-deep px-6 font-semibold text-on-dark">გაკვეთილზე დაბრუნება</Link>}
        </div>
      </section>
    );
  }

  if (done && !done.passed) {
    return (
      <section className="mx-auto flex max-w-xl flex-col items-start gap-4 rounded-2xl bg-exercise p-8">
        <p className="font-hand text-6xl leading-none text-teal-deep">¡Uy!</p>
        <h1 className="text-3xl font-bold">კიდევ ერთხელ სცადე</h1>
        <p className="text-lg text-ink-muted">{done.correct} / {done.total}</p>
        <Button type="button" onClick={restart}>თავიდან</Button>
      </section>
    );
  }

  const stepResult = (stepIndex: number) => (checked[stepIndex] ? gradeStep(content.templateId, content.steps[stepIndex], answers[stepIndex]) : null);

  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col gap-5 rounded-2xl bg-exercise p-4 sm:p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold tracking-wide text-teal-deep">{meta.labelKa} · {index + 1} / {total}</p>
          <h1 className="mt-1 text-3xl font-bold">{content.title}</h1>
        </div>
        {material.preview ? null : <Link href={back} className="text-sm font-semibold text-teal-deep">დახურვა</Link>}
      </div>
      <p className="text-lg">{content.instructionKa}</p>
      <div className="h-2 overflow-hidden rounded-full bg-line">
        <div className="h-full rounded-full bg-teal-deep" style={{ width: `${((index + 1) / total) * 100}%` }} />
      </div>

      <div className="hidden flex-col gap-4 lg:flex">
        <StepBody content={content} index={index} answer={answers[index] ?? null} result={stepResult(index)} assets={material.assets} onAnswer={(answer) => update(index, answer)} />
        <footer className="flex flex-wrap items-center gap-3">
          <Button type="button" variant="outline" onClick={restart} aria-label="თავიდან">↺</Button>
          <p className="min-w-0 flex-1 text-sm">{feedbackLine(content, index, stepResult(index))}</p>
          {!checked[index] ? <Button type="button" onClick={() => checkAt(index)}>შემოწმება</Button> : index < total - 1 ? <Button type="button" onClick={() => { const next = index + 1; setIndex(next); void savePosition(next + 1); }}>შემდეგი →</Button> : <Button type="button" loading={busy} onClick={() => void submit()}>დასრულება</Button>}
        </footer>
      </div>

      <div className="flex flex-col gap-8 lg:hidden">
        {content.steps.map((_, stepIndex) => (
          <StepBody key={stepIndex} content={content} index={stepIndex} answer={answers[stepIndex] ?? null} result={stepResult(stepIndex)} assets={material.assets} onAnswer={(answer) => update(stepIndex, answer)} />
        ))}
        <div className="sticky bottom-24 z-20">
          <Button type="button" className="w-full" loading={busy} onClick={() => { setChecked(content.steps.map(() => true)); void submit(); }}>შემოწმება</Button>
        </div>
      </div>
      {error ? <p className="text-sm font-medium text-burgundy">{error}</p> : null}
    </section>
  );
}

function feedbackLine(content: ExerciseContent, index: number, result: { correct: boolean } | null) {
  if (!result) return "";
  if (result.correct) return content.feedback?.correctKa ?? "სწორია";
  const step = content.steps[index];
  if (step && "explanationKa" in step && step.explanationKa) return step.explanationKa;
  return "პასუხი არასწორია";
}

function StepBody({
  content,
  index,
  answer,
  result,
  assets,
  onAnswer,
}: {
  content: ExerciseContent;
  index: number;
  answer: Answer;
  result: { correct: boolean; score: number } | null;
  assets: Record<string, string>;
  onAnswer: (answer: Answer) => void;
}) {
  const step = content.steps[index];
  if (!step || content.templateId === "multiple_choice" && !("options" in step)) return null;
  if (content.templateId === "multiple_choice" && "options" in step && !("questionEs" in step)) return <Choice options={step.options} context={"context" in step ? step.context : undefined} prompt={"prompt" in step ? step.prompt?.ka ?? step.prompt?.es : undefined} variant={content.variant} selected={typeof answer?.optionId === "string" ? answer.optionId : ""} correctId={result ? step.correctId : null} onSelect={(optionId) => onAnswer({ optionId })} />;
  if (content.templateId === "listening" && "questionEs" in step) {
    const src = step.audio ? assets[step.audio.assetId] : undefined;
    return (
      <div className="flex flex-col gap-3">
        {src ? <audio controls src={src} className="w-full" /> : null}
        <p className="text-lg font-semibold">{step.questionEs}</p>
        {step.questionKa ? <p className="text-ink-muted">{step.questionKa}</p> : null}
        <Choice options={step.options} selected={typeof answer?.optionId === "string" ? answer.optionId : ""} correctId={result ? step.correctId : null} onSelect={(optionId) => onAnswer({ optionId })} />
      </div>
    );
  }
  if (content.templateId === "swipe_true_false" && "statement" in step) return <Swipe statement={step.statement} value={typeof answer?.value === "boolean" ? answer.value : null} revealed={Boolean(result)} isTrue={step.isTrue} onChoose={(value) => onAnswer({ value })} />;
  if (content.templateId === "drag_sort" && "buckets" in step) return <Sort buckets={step.buckets} items={step.items} placements={recordOf(answer?.placements)} revealed={Boolean(result)} onChange={(placements) => onAnswer({ placements })} />;
  if (content.templateId === "sentence_builder" && "tiles" in step) return <Sentence prompt={step.promptKa} tiles={step.tiles} order={stringList(answer?.order)} revealed={Boolean(result)} answer={result && !result.correct ? step.answer : null} onChange={(order) => onAnswer({ order })} />;
  if (content.templateId === "fill_blank" && "rows" in step) return <Fill hint={step.verbHint} rows={step.rows} values={stringList(answer?.values)} revealed={Boolean(result)} onChange={(values) => onAnswer({ values })} />;
  if (content.templateId === "matching_pairs" && "pairs" in step) return <Pairs pairs={step.pairs} links={recordOf(answer?.links)} revealed={Boolean(result)} assets={assets} onChange={(links) => onAnswer({ links })} />;
  if (content.templateId === "branching_dialogue" && "nodes" in step) return <Branch step={step} path={pathOf(answer?.path)} onChange={(path) => onAnswer({ path })} />;
  if (content.templateId === "checkpoint" && "sections" in step) {
    const given = Array.isArray(answer?.sections) ? (answer.sections as unknown[]) : [];
    return (
      <ol className="flex flex-col gap-6">
        {step.sections.map((section, sectionIndex) => {
          const sectionAnswers = Array.isArray(given[sectionIndex]) ? (given[sectionIndex] as Answer[]) : [];
          return (
            <li key={`${section.labelKa}-${sectionIndex}`} className="flex flex-col gap-4">
              <p className="text-sm font-semibold tracking-wide text-teal-deep">{sectionIndex + 1} · {section.labelKa}</p>
              {section.stepRefs.length === 0 ? <p className="text-sm text-ink-muted">ამ ნაწილში კითხვები ჯერ არ არის.</p> : null}
              {section.stepRefs.map((ref, refIndex) => {
                const templateId = typeof ref.templateId === "string" ? ref.templateId : "";
                const nested = { ...content, templateId, steps: [ref] } as unknown as ExerciseContent;
                const refAnswer = sectionAnswers[refIndex] ?? null;
                return (
                  <div key={refIndex} className="rounded-xl border-[1.5px] border-line bg-paper p-4">
                    <StepBody
                      content={nested}
                      index={0}
                      answer={refAnswer}
                      result={result ? gradeStep(templateId, ref, refAnswer) : null}
                      assets={assets}
                      onAnswer={(next) => {
                        const sections = step.sections.map((_, index) => (Array.isArray(given[index]) ? [...(given[index] as Answer[])] : []));
                        const row = sections[sectionIndex] ?? [];
                        row[refIndex] = next;
                        sections[sectionIndex] = row;
                        onAnswer({ sections });
                      }}
                    />
                  </div>
                );
              })}
            </li>
          );
        })}
      </ol>
    );
  }
  return null;
}

function Choice({
  options,
  prompt,
  context,
  variant,
  selected,
  correctId,
  onSelect,
}: {
  options: { id: string; text: string }[];
  prompt?: string;
  context?: string;
  variant?: string;
  selected: string;
  correctId: string | null;
  onSelect: (id: string) => void;
}) {
  const grid = variant === "cards_2x2";
  return (
    <div className="flex flex-col gap-3">
      {context ? <p className="rounded-2xl bg-card px-4 py-3 text-lg">{context}</p> : null}
      {prompt ? <p className="font-semibold">{prompt}</p> : null}
      <div className={grid ? "grid grid-cols-2 gap-3" : "flex flex-col gap-2"}>
        {options.map((option) => {
          const state =
            correctId && option.id === correctId
              ? "border-sage bg-sage-soft text-sage-ink"
              : correctId && option.id === selected
                ? "border-burgundy bg-burgundy-soft text-burgundy"
                : selected === option.id
                  ? "border-teal-deep bg-teal-soft"
                  : "border-sand bg-card";
          return (
            <button key={option.id} type="button" aria-pressed={selected === option.id} className={`min-h-12 rounded-xl border-[1.5px] px-4 py-3 text-left transition ${state}`} onClick={() => onSelect(option.id)}>
              {option.text}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Swipe({ statement, value, revealed, isTrue, onChoose }: { statement: string; value: boolean | null; revealed: boolean; isTrue: boolean; onChoose: (value: boolean) => void }) {
  return (
    <div className="flex flex-col gap-4" onKeyDown={(event) => { if (event.key === "ArrowLeft") onChoose(false); if (event.key === "ArrowRight") onChoose(true); }}>
      <p className="rounded-2xl bg-card px-5 py-8 text-center text-2xl font-bold">{statement}</p>
      <div className="flex gap-3">
        <ChoiceButton pressed={value === false} wrong={revealed && value === false && isTrue} right={revealed && !isTrue} onClick={() => onChoose(false)}>არა ←</ChoiceButton>
        <ChoiceButton pressed={value === true} wrong={revealed && value === true && !isTrue} right={revealed && isTrue} onClick={() => onChoose(true)}>დიახ →</ChoiceButton>
      </div>
    </div>
  );
}

function Sort({
  buckets,
  items,
  placements,
  revealed,
  onChange,
}: {
  buckets: { id: string; label: string }[];
  items: { id: string; text: string; bucketId: string }[];
  placements: Record<string, string>;
  revealed: boolean;
  onChange: (placements: Record<string, string>) => void;
}) {
  return (
    <ul className="flex flex-col gap-3">
      {items.map((item) => (
        <li key={item.id} className="flex flex-wrap items-center gap-2 rounded-xl border-[1.5px] border-sand bg-card px-3 py-2">
          <span className="min-w-24 flex-1 font-semibold">{item.text}</span>
          {buckets.map((bucket) => {
            const selected = placements[item.id] === bucket.id;
            const right = revealed && item.bucketId === bucket.id;
            const wrong = revealed && selected && item.bucketId !== bucket.id;
            return (
              <button key={bucket.id} type="button" aria-pressed={selected} className={`h-11 rounded-xl border-[1.5px] px-3 ${right ? "border-sage bg-sage-soft text-sage-ink" : wrong ? "border-burgundy bg-burgundy-soft text-burgundy" : selected ? "border-teal-deep bg-teal-soft" : "border-sand"}`} onClick={() => onChange({ ...placements, [item.id]: bucket.id })}>
                {bucket.label}
              </button>
            );
          })}
        </li>
      ))}
    </ul>
  );
}

function Sentence({ prompt, tiles, order, revealed, answer, onChange }: { prompt: string; tiles: string[]; order: string[]; revealed: boolean; answer: string[] | null; onChange: (order: string[]) => void }) {
  const used = [...order];
  const bank = tiles.filter((tile) => {
    const at = used.indexOf(tile);
    if (at === -1) return true;
    used.splice(at, 1);
    return false;
  });
  return (
    <div className="flex flex-col gap-4">
      <p className="text-ink-muted">{prompt}</p>
      <div className={`flex min-h-14 flex-wrap gap-2 rounded-xl border-[1.5px] bg-card p-3 ${revealed && answer ? "border-burgundy" : revealed ? "border-sage" : "border-sand"}`}>
        {order.map((tile, tileIndex) => (
          <button key={`${tile}-${tileIndex}`} type="button" className="rounded-lg border-[1.5px] border-sand px-3 py-2" onClick={() => onChange(order.filter((_, index) => index !== tileIndex))}>{tile}</button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {bank.map((tile, tileIndex) => (
          <button key={`${tile}-${tileIndex}`} type="button" className="rounded-lg border-[1.5px] border-line bg-card px-3 py-2" onClick={() => onChange([...order, tile])}>{tile}</button>
        ))}
      </div>
      {answer ? <p className="text-sm text-burgundy">{answer.join(" ")}</p> : null}
    </div>
  );
}

function Fill({ hint, rows, values, revealed, onChange }: { hint?: string; rows: { before: string; after: string; answer: string; options?: string[] }[]; values: string[]; revealed: boolean; onChange: (values: string[]) => void }) {
  return (
    <div className="flex flex-col gap-3">
      {hint ? <p className="text-sm font-semibold text-teal-deep">{hint}</p> : null}
      {rows.map((row, rowIndex) => (
        <label key={rowIndex} className="flex flex-wrap items-center gap-2 text-lg">
          <span>{row.before}</span>
          {row.options ? (
            <select className="h-11 rounded-xl border-[1.5px] border-sand bg-card px-2" value={values[rowIndex] ?? ""} onChange={(event) => onChange(values.map((item, index) => (index === rowIndex ? event.target.value : item)))}>
              <option value="">…</option>
              {row.options.map((option) => <option key={option}>{option}</option>)}
            </select>
          ) : (
            <input className={`h-11 w-28 rounded-xl border-[1.5px] bg-card px-3 ${!revealed ? "border-sand" : (values[rowIndex] ?? "").trim().toLowerCase() === row.answer.toLowerCase() ? "border-sage" : "border-burgundy"}`} value={values[rowIndex] ?? ""} onChange={(event) => onChange(rows.map((_, index) => (index === rowIndex ? event.target.value : values[index] ?? "")))} />
          )}
          <span>{row.after}</span>
        </label>
      ))}
    </div>
  );
}

function Pairs({
  pairs,
  links,
  revealed,
  assets,
  onChange,
}: {
  pairs: { left: string; right: string | { assetId: string } }[];
  links: Record<string, string>;
  revealed: boolean;
  assets: Record<string, string>;
  onChange: (links: Record<string, string>) => void;
}) {
  const [picked, setPicked] = useState<string | null>(null);
  const keyOf = (right: string | { assetId: string }) => (typeof right === "string" ? right : right.assetId);
  const rights = [...pairs.map((pair) => pair.right)].sort((a, b) => {
    const left = keyOf(a);
    const right = keyOf(b);
    return (left.length * 7 + left.charCodeAt(0)) % 11 - (right.length * 7 + right.charCodeAt(0)) % 11 || left.localeCompare(right);
  });
  const linkedTo = new Set(Object.values(links));
  const face = (right: string | { assetId: string }) =>
    typeof right === "string" ? right : assets[right.assetId] ? <img src={assets[right.assetId]} alt="" className="h-20 w-full rounded-lg object-cover" /> : "—";
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="flex flex-col gap-2">
        {pairs.map((pair) => {
          const chosen = links[pair.left];
          const ok = revealed && chosen === keyOf(pair.right);
          const bad = revealed && !ok;
          return (
            <button
              key={pair.left}
              type="button"
              aria-pressed={picked === pair.left}
              className={`min-h-12 rounded-xl border-[1.5px] px-3 py-2 text-left font-semibold ${ok ? "border-sage bg-sage-soft" : bad ? "border-burgundy" : picked === pair.left ? "border-teal-deep bg-teal-soft" : chosen ? "border-teal-deep bg-card" : "border-sand bg-card"}`}
              onClick={() => setPicked(pair.left)}
            >
              <span lang="es">{pair.left}</span>
              {chosen && typeof pair.right === "string" ? <span className="block text-sm font-normal text-ink-muted">→ {chosen}</span> : null}
              {bad ? <span className="block text-sm font-normal text-burgundy">სწორია: {typeof pair.right === "string" ? pair.right : "სურათი"}</span> : null}
            </button>
          );
        })}
      </div>
      <div className="flex flex-col gap-2">
        {rights.map((right) => (
          <button
            key={keyOf(right)}
            type="button"
            disabled={!picked}
            className={`min-h-12 rounded-xl border-[1.5px] px-3 py-2 text-left ${linkedTo.has(keyOf(right)) ? "border-line bg-paper text-ink-muted" : "border-sand bg-card"}`}
            onClick={() => { if (!picked) return; onChange({ ...links, [picked]: keyOf(right) }); setPicked(null); }}
          >
            {face(right)}
          </button>
        ))}
      </div>
      <p className="col-span-2 text-sm text-ink-muted">ჯერ აირჩიე სიტყვა მარცხნივ, მერე მისი წყვილი მარჯვნივ.</p>
    </div>
  );
}

function Branch({
  step,
  path,
  onChange,
}: {
  step: Extract<ExerciseContent, { templateId: "branching_dialogue" }>["steps"][number];
  path: { nodeId: string; choiceIndex: number }[];
  onChange: (path: { nodeId: string; choiceIndex: number }[]) => void;
}) {
  let nodeId = step.start;
  const history: { text: string; speaker?: string; reply: string }[] = [];
  for (const hop of path) {
    const node = step.nodes.find((item) => item.id === hop.nodeId);
    const choice = node?.choices?.[hop.choiceIndex];
    if (node && choice) history.push({ text: node.text, speaker: step.speakers.find((item) => item.id === node.speakerId)?.name, reply: choice.text });
    nodeId = choice?.next ?? nodeId;
  }
  const node = step.nodes.find((item) => item.id === nodeId) ?? step.nodes[0];
  if (!node) return null;
  const speaker = step.speakers.find((item) => item.id === node.speakerId);
  const finished = (node.choices ?? []).length === 0;
  return (
    <div className="flex flex-col gap-3">
      {history.map((item, index) => (
        <div key={index} className="flex flex-col gap-2 opacity-70">
          <p className="max-w-[85%] rounded-2xl rounded-bl-md bg-card px-4 py-3 text-lg" lang="es">{item.speaker ? <span className="block text-sm font-semibold text-ink-muted">{item.speaker}</span> : null}{item.text}</p>
          <p className="max-w-[85%] self-end rounded-2xl rounded-br-md bg-teal-soft px-4 py-3 text-lg" lang="es">{item.reply}</p>
        </div>
      ))}
      <p className="max-w-[85%] rounded-2xl rounded-bl-md bg-card px-4 py-3 text-lg" lang="es">
        {speaker ? <span className="block text-sm font-semibold text-ink-muted">{speaker.name}</span> : null}
        {node.text}
      </p>
      {(node.choices ?? []).map((choice, choiceIndex) => (
        <button key={`${choice.text}-${choiceIndex}`} type="button" lang="es" className="self-end rounded-xl border-[1.5px] border-teal-deep bg-card px-4 py-3 text-left text-lg hover:bg-teal-softer" onClick={() => onChange([...path, { nodeId: node.id, choiceIndex }])}>{choice.text}</button>
      ))}
      {finished && path.length ? <p className="text-sm font-semibold text-sage-ink">საუბარი დასრულდა — დააჭირე „შემოწმება“.</p> : null}
      {path.length ? <button type="button" className="h-10 w-fit text-sm font-semibold text-teal-deep" onClick={() => onChange([])}>თავიდან დაწყება</button> : null}
    </div>
  );
}

function ChoiceButton({ pressed, wrong, right, onClick, children }: { pressed: boolean; wrong?: boolean; right?: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" aria-pressed={pressed} onClick={onClick} className={`h-12 flex-1 rounded-xl border-[1.5px] font-semibold ${right ? "border-sage bg-sage-soft text-sage-ink" : wrong ? "border-burgundy bg-burgundy-soft text-burgundy" : pressed ? "border-teal-deep bg-teal-soft" : "border-sand bg-card"}`}>
      {children}
    </button>
  );
}

function recordOf(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(Object.entries(value).filter((entry): entry is [string, string] => typeof entry[1] === "string"));
}

function stringList(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function pathOf(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const hop = item as { nodeId?: unknown; choiceIndex?: unknown };
    if (typeof hop.nodeId !== "string" || typeof hop.choiceIndex !== "number") return [];
    return [{ nodeId: hop.nodeId, choiceIndex: hop.choiceIndex }];
  });
}
