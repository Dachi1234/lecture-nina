"use client";

import { useState } from "react";
import { EXERCISE_TEMPLATE_CATALOG, SPEAKER_PRESETS, blankExerciseStep, exerciseTemplateMeta, materialReadiness } from "@nina/contracts";
import { Checkbox, ChoiceChip } from "@nina/ui";
import { toneClass } from "@/lib/tones";
import { AddButton, MediaSlot, MiniInput, RowTools, Section, Segmented, TextField, arr, miniField, miniInput, move, rec, recs, removeAt, replaceAt, str, type Rec } from "./kit";

type Props = { content: Rec; onChange: (content: Rec) => void };

const THRESHOLDS = [
  { id: "0.5", label: "50%" },
  { id: "0.7", label: "70%" },
  { id: "0.8", label: "80%" },
  { id: "1", label: "100%" },
];

const CHECKPOINT_PARTS = ["multiple_choice", "swipe_true_false", "fill_blank", "sentence_builder", "matching_pairs"] as const;

function stepFilled(templateId: string, step: Rec) {
  const probe = materialReadiness("EXERCISE", { schemaVersion: 1, templateId, title: "x", instructionKa: "x", steps: [step] });
  return probe.checks.find((check) => check.id === "steps")?.done === true;
}

export function ExerciseBuilder({ content, onChange }: Props) {
  const templateId = str(content.templateId);
  const meta = exerciseTemplateMeta(templateId);
  const steps = recs(content.steps);
  const feedback = rec(content.feedback);
  const [switching, setSwitching] = useState(false);
  const [openStep, setOpenStep] = useState<number>(0);

  function setSteps(next: Rec[]) {
    onChange({ ...content, steps: next });
  }

  function switchTemplate(id: string) {
    const next = exerciseTemplateMeta(id);
    if (!next) return;
    onChange({
      ...content,
      templateId: id,
      instructionKa: next.defaultInstructionKa,
      variant: next.variants[0]?.id,
      steps: [blankExerciseStep(id)],
    });
    setSwitching(false);
    setOpenStep(0);
  }

  return (
    <div className="flex flex-col gap-5">
      <Section
        title={meta ? `შაბლონი: ${meta.labelKa}` : "შაბლონი"}
        hint={meta?.purposeKa}
        action={<button type="button" className="h-10 text-sm font-semibold text-teal-deep" onClick={() => setSwitching((value) => !value)}>{switching ? "დახურვა" : "შეცვლა"}</button>}
      >
        {switching ? (
          <div className="flex flex-col gap-2">
            <p className="rounded-xl bg-mustard-soft px-4 py-3 text-sm text-mustard-ink">შაბლონის შეცვლა ნაბიჯებს თავიდან დაიწყებს.</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {EXERCISE_TEMPLATE_CATALOG.filter((item) => item.id !== templateId).map((item) => (
                <button key={item.id} type="button" onClick={() => switchTemplate(item.id)} className="rounded-xl border-[1.5px] border-line bg-paper p-3 text-left hover:border-teal-deep">
                  <b>{item.labelKa}</b>
                  <p className="text-sm text-ink-muted">{item.purposeKa}</p>
                </button>
              ))}
            </div>
          </div>
        ) : null}
        <TextField label="დავალება მოსწავლისთვის" hint="(ერთი ხაზი, ქართულად)" placeholder={meta?.defaultInstructionKa} value={str(content.instructionKa)} onChange={(instructionKa) => onChange({ ...content, instructionKa })} />
        {meta && meta.variants.length > 1 ? (
          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold">როგორ გამოიყურება</p>
            <Segmented label="ვარიანტი" value={str(content.variant) || meta.variants[0]!.id} options={meta.variants.map((variant) => ({ id: variant.id, label: variant.labelKa }))} onChange={(variant) => onChange({ ...content, variant })} />
          </div>
        ) : null}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold">ჩათვლის ზღვარი</p>
            <Segmented label="ჩათვლის ზღვარი" value={String(typeof content.passThreshold === "number" ? content.passThreshold : 0.7)} options={THRESHOLDS} onChange={(value) => onChange({ ...content, passThreshold: Number(value) })} />
          </div>
          <TextField label="დასრულების სიტყვა" hint="(ესპანურად)" lang="es" placeholder="¡Muy bien!" value={str(feedback.finishTitleEs)} onChange={(finishTitleEs) => onChange({ ...content, feedback: { ...feedback, finishTitleEs } })} />
        </div>
        <TextField label="რას ხედავს სწორ პასუხზე" hint="(არასავალდებულო)" placeholder="სწორია! ყოჩაღ." value={str(feedback.correctKa)} onChange={(correctKa) => onChange({ ...content, feedback: { ...feedback, correctKa } })} />
      </Section>

      <Section title={`${templateId === "checkpoint" ? "ნაწილები" : "ნაბიჯები"} · ${steps.length}`} hint="მოსწავლე კომპიუტერზე ერთ ნაბიჯს ხედავს, ტელეფონზე — ყველას ერთად. კარგი სავარჯიშო 4–10 ნაბიჯია.">
        <ol className="flex flex-col gap-3">
          {steps.map((step, index) => {
            const filled = stepFilled(templateId, step);
            const open = openStep === index;
            return (
              <li key={index} className={`rounded-xl border-[1.5px] bg-paper ${open ? "border-teal-deep" : "border-line"}`}>
                <div className="flex items-center gap-2 p-2 pl-3">
                  <button type="button" aria-expanded={open} onClick={() => setOpenStep(open ? -1 : index)} className="flex min-h-11 flex-1 items-center gap-3 text-left">
                    <span className={`flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${filled ? "bg-sage-soft text-sage-ink" : "bg-mustard-soft text-mustard-ink"}`}>{filled ? "✓" : index + 1}</span>
                    <span className="min-w-0 flex-1 truncate font-semibold">{stepTitle(templateId, step) || `ნაბიჯი ${index + 1}`}</span>
                    <span className="text-sm text-ink-muted">{filled ? "" : "შესავსებია"} {open ? "▴" : "▾"}</span>
                  </button>
                  <RowTools
                    index={index}
                    count={steps.length}
                    label={`ნაბიჯი ${index + 1}`}
                    onMove={(direction) => { setSteps(move(steps, index, direction)); setOpenStep(index + direction); }}
                    onDuplicate={() => { setSteps([...steps.slice(0, index + 1), structuredClone(step), ...steps.slice(index + 1)]); setOpenStep(index + 1); }}
                    onRemove={() => setSteps(removeAt(steps, index))}
                  />
                </div>
                {open ? (
                  <div className="border-t border-line-soft p-3">
                    <StepEditor templateId={templateId} step={step} scope={`s${index}`} onChange={(next) => setSteps(replaceAt(steps, index, next))} />
                  </div>
                ) : null}
              </li>
            );
          })}
        </ol>
        {templateId !== "checkpoint" || steps.length === 0 ? (
          <AddButton onClick={() => { setSteps([...steps, blankExerciseStep(templateId)]); setOpenStep(steps.length); }}>ნაბიჯის დამატება</AddButton>
        ) : null}
      </Section>
    </div>
  );
}

function stepTitle(templateId: string, step: Rec): string {
  switch (templateId) {
    case "multiple_choice":
      return str(rec(step.prompt).ka) || str(rec(step.prompt).es) || str(step.context);
    case "listening":
      return str(step.questionEs);
    case "swipe_true_false":
      return str(step.statement);
    case "sentence_builder":
      return str(step.promptKa);
    case "fill_blank":
      return recs(step.rows).map((row) => `${str(row.before)} ___ ${str(row.after)}`.trim()).join(" · ");
    case "drag_sort":
      return recs(step.buckets).map((bucket) => str(bucket.label)).filter(Boolean).join(" / ");
    case "matching_pairs":
      return recs(step.pairs).map((pair) => str(pair.left)).filter(Boolean).join(", ");
    case "branching_dialogue":
      return str(recs(step.nodes)[0]?.text);
    case "checkpoint":
      return recs(step.sections).map((section) => str(section.labelKa)).join(" · ");
    default:
      return "";
  }
}

function nextId(existing: string[], prefix: string) {
  let index = existing.length + 1;
  while (existing.includes(`${prefix}${index}`)) index++;
  return `${prefix}${index}`;
}

function scramble(tiles: string[]) {
  if (tiles.length < 2) return tiles;
  const keyed = tiles.map((tile, index) => ({ tile, key: (index * 7 + tile.length * 3) % (tiles.length + 1) }));
  const shuffled = keyed.sort((a, b) => a.key - b.key).map((item) => item.tile);
  return shuffled.join("\u0000") === tiles.join("\u0000") ? [...tiles.slice(1), tiles[0]!] : shuffled;
}

function tokens(sentence: string) {
  return sentence.split(/\s+/).map((part) => part.trim()).filter(Boolean);
}

export function StepEditor({ templateId, step, scope, onChange }: { templateId: string; step: Rec; scope: string; onChange: (step: Rec) => void }) {
  switch (templateId) {
    case "multiple_choice":
    case "listening":
      return <ChoiceStep listening={templateId === "listening"} step={step} scope={scope} onChange={onChange} />;
    case "swipe_true_false":
      return (
        <div className="flex flex-col gap-3">
          <MiniInput label="განცხადება ესპანურად" placeholder="Ana es de Barcelona." lang="es" value={str(step.statement)} onChange={(statement) => onChange({ ...step, statement })} />
          <MiniInput label="კონტექსტი (არასავალდებულო)" placeholder="კონტექსტი: ანა მადრიდიდანაა." value={str(step.context)} onChange={(context) => onChange({ ...step, context })} />
          <Segmented label="სწორი პასუხი" value={step.isTrue === false ? "false" : "true"} options={[{ id: "true", label: "მართალია" }, { id: "false", label: "მცდარია" }]} onChange={(value) => onChange({ ...step, isTrue: value === "true" })} />
        </div>
      );
    case "sentence_builder":
      return <SentenceStep step={step} onChange={onChange} />;
    case "fill_blank":
      return <FillStep step={step} onChange={onChange} />;
    case "drag_sort":
      return <SortStep step={step} onChange={onChange} />;
    case "matching_pairs":
      return <PairsStep step={step} onChange={onChange} />;
    case "branching_dialogue":
      return <BranchStep step={step} onChange={onChange} />;
    case "checkpoint":
      return <CheckpointStep step={step} scope={scope} onChange={onChange} />;
    default:
      return <p className="text-sm text-ink-muted">ამ შაბლონს რედაქტორი ჯერ არ აქვს.</p>;
  }
}

function ChoiceStep({ listening, step, scope, onChange }: { listening: boolean; step: Rec; scope: string; onChange: (step: Rec) => void }) {
  const options = recs(step.options);
  const prompt = rec(step.prompt);
  return (
    <div className="flex flex-col gap-3">
      {listening ? (
        <>
          <MediaSlot kind="audio" label="ჩანაწერი" value={step.audio} onChange={(audio) => onChange({ ...step, audio })} />
          <div className="grid gap-2 sm:grid-cols-2">
            <MiniInput label="კითხვა ესპანურად" placeholder="¿Qué pide Laura?" lang="es" value={str(step.questionEs)} onChange={(questionEs) => onChange({ ...step, questionEs })} />
            <MiniInput label="კითხვა ქართულად" placeholder="რა შეუკვეთა ლაურამ?" value={str(step.questionKa)} onChange={(questionKa) => onChange({ ...step, questionKa })} />
          </div>
        </>
      ) : (
        <>
          <div className="grid gap-2 sm:grid-cols-2">
            <MiniInput label="კითხვა ქართულად" placeholder="როგორ ეტყვი „ღამე მშვიდობისა“?" value={str(prompt.ka)} onChange={(ka) => onChange({ ...step, prompt: { ...prompt, ka } })} />
            <MiniInput label="ან ესპანურად" placeholder="¿Cómo se dice…?" lang="es" value={str(prompt.es)} onChange={(es) => onChange({ ...step, prompt: { ...prompt, es } })} />
          </div>
          <MiniInput label="დიალოგის ხაზი ___ გამოტოვებით (არასავალდებულო)" placeholder="— ¿Qué quieres tomar? — ___ un café." lang="es" value={str(step.context)} onChange={(context) => onChange({ ...step, context })} />
        </>
      )}
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-sm font-semibold">პასუხები · მონიშნე სწორი</legend>
        {options.map((option, index) => {
          const correct = step.correctId === option.id;
          return (
            <div key={str(option.id) || index} className={`flex items-center gap-2 rounded-lg p-1 ${correct ? "bg-sage-soft" : ""}`}>
              <label className="flex size-11 shrink-0 cursor-pointer items-center justify-center">
                <input type="radio" name={`${scope}-correct`} checked={correct} onChange={() => onChange({ ...step, correctId: option.id })} className="size-5 accent-teal-deep" />
                <span className="sr-only">პასუხი {index + 1} სწორია</span>
              </label>
              <MiniInput label={`პასუხი ${index + 1}`} lang="es" value={str(option.text)} onChange={(text) => onChange({ ...step, options: replaceAt(options, index, { ...option, text }) })} />
              {options.length > 2 ? (
                <button type="button" aria-label={`პასუხი ${index + 1}: წაშლა`} className="size-11 shrink-0 text-ink-muted hover:text-burgundy" onClick={() => {
                  const next = removeAt(options, index);
                  onChange({ ...step, options: next, correctId: correct ? next[0]?.id : step.correctId });
                }}>×</button>
              ) : null}
            </div>
          );
        })}
      </fieldset>
      {options.length < 6 ? (
        <button type="button" className="h-10 w-fit text-sm font-semibold text-teal-deep" onClick={() => onChange({ ...step, options: [...options, { id: nextId(options.map((option) => str(option.id)), "o"), text: "" }] })}>+ პასუხი</button>
      ) : null}
      <MiniInput label="ახსნა არასწორ პასუხზე (არასავალდებულო)" placeholder="„buenos días“ დილით ვამბობთ, საღამოს — „buenas noches“." value={str(step.explanationKa)} onChange={(explanationKa) => onChange({ ...step, explanationKa })} />
    </div>
  );
}

function SentenceStep({ step, onChange }: { step: Rec; onChange: (step: Rec) => void }) {
  const answer = arr(step.answer).map(str);
  const tiles = arr(step.tiles).map(str);
  const extras = [...tiles];
  for (const token of answer) {
    const at = extras.indexOf(token);
    if (at >= 0) extras.splice(at, 1);
  }
  const [sentence, setSentence] = useState(answer.join(" "));
  const [distractors, setDistractors] = useState(extras.join(" "));
  const alternates = arr(step.acceptAlso).map((item) => arr(item).map(str).join(" "));

  function update(nextSentence: string, nextDistractors: string) {
    const answerTokens = tokens(nextSentence);
    const tileSet = scramble([...answerTokens, ...tokens(nextDistractors)]);
    onChange({ ...step, answer: answerTokens, tiles: tileSet });
  }

  return (
    <div className="flex flex-col gap-3">
      <MiniInput label="რა უნდა ააწყოს (ქართულად)" placeholder="რას დალევ?" value={str(step.promptKa)} onChange={(promptKa) => onChange({ ...step, promptKa })} />
      <MiniInput label="სწორი წინადადება ესპანურად" placeholder="¿Qué vas a tomar?" lang="es" value={sentence} onChange={(value) => { setSentence(value); update(value, distractors); }} />
      <MiniInput label="ზედმეტი ფილები (არასავალდებულო)" placeholder="quieres tomas" lang="es" value={distractors} onChange={(value) => { setDistractors(value); update(sentence, value); }} />
      {tiles.length > 0 ? (
        <div className="flex flex-col gap-1">
          <p className="text-sm text-ink-muted">მოსწავლე ამ ფილებს ნახავს (არეული):</p>
          <div className="flex flex-wrap gap-2">
            {tiles.map((tile, index) => (
              <span key={`${tile}-${index}`} className={`rounded-lg border-[1.5px] px-3 py-1.5 text-[15px] ${answer.includes(tile) ? "border-line bg-card" : "border-dashed border-sand text-ink-muted"}`} lang="es">{tile}</span>
            ))}
          </div>
        </div>
      ) : null}
      <label className="flex flex-col gap-1 text-sm font-semibold">
        სხვა სწორი ვარიანტები (თითო ხაზზე)
        <textarea
          rows={2}
          lang="es"
          value={alternates.join("\n")}
          placeholder="¿Qué tomas?"
          onChange={(event) => onChange({ ...step, acceptAlso: event.target.value.split("\n").map(tokens).filter((row) => row.length > 0) })}
          className={`${miniInput} h-auto py-2 font-normal`}
        />
      </label>
    </div>
  );
}

function FillStep({ step, onChange }: { step: Rec; onChange: (step: Rec) => void }) {
  const rows = recs(step.rows);
  return (
    <div className="flex flex-col gap-3">
      <MiniInput label="მინიშნება ზემოთ (მაგ. ზმნა)" placeholder="ser" lang="es" value={str(step.verbHint)} onChange={(verbHint) => onChange({ ...step, verbHint })} />
      <ol className="flex flex-col gap-2">
        {rows.map((row, index) => (
          <li key={index} className="flex flex-col gap-2 rounded-lg bg-card p-2">
            <div className="flex items-center gap-2">
              <div className="grid flex-1 gap-2 sm:grid-cols-[1fr_9rem_1fr]">
                <MiniInput label={`ხაზი ${index + 1}: წინ`} placeholder="Yo" lang="es" value={str(row.before)} onChange={(before) => onChange({ ...step, rows: replaceAt(rows, index, { ...row, before }) })} />
                <MiniInput label={`ხაზი ${index + 1}: პასუხი`} placeholder="soy" lang="es" value={str(row.answer)} onChange={(answer) => onChange({ ...step, rows: replaceAt(rows, index, { ...row, answer }) })} className="border-teal-deep bg-teal-softer font-semibold" />
                <MiniInput label={`ხაზი ${index + 1}: შემდეგ`} placeholder="Ana." lang="es" value={str(row.after)} onChange={(after) => onChange({ ...step, rows: replaceAt(rows, index, { ...row, after }) })} />
              </div>
              <RowTools index={index} count={rows.length} label={`ხაზი ${index + 1}`} onMove={(direction) => onChange({ ...step, rows: move(rows, index, direction) })} onRemove={() => onChange({ ...step, rows: removeAt(rows, index) })} />
            </div>
            <MiniInput
              label={`ხაზი ${index + 1}: არჩევანი`}
              placeholder="არჩევანი მძიმით (თუ გინდა სიიდან აირჩიოს): soy, eres, es"
              lang="es"
              value={arr(row.options).map(str).join(", ")}
              onChange={(value) => {
                const options = value.split(",").map((part) => part.trim()).filter(Boolean);
                onChange({ ...step, rows: replaceAt(rows, index, { ...row, options: options.length ? options : undefined }) });
              }}
            />
          </li>
        ))}
      </ol>
      <button type="button" className="h-10 w-fit text-sm font-semibold text-teal-deep" onClick={() => onChange({ ...step, rows: [...rows, { before: "", answer: "", after: "" }] })}>+ ხაზი</button>
      <Checkbox id={`strict-${rows.length}-${str(step.verbHint)}`} checked={step.strictAccents === true} onCheckedChange={(strictAccents) => onChange({ ...step, strictAccents })}>
        ასოების აქცენტი (á, é, ñ) სავალდებულოა
      </Checkbox>
    </div>
  );
}

function SortStep({ step, onChange }: { step: Rec; onChange: (step: Rec) => void }) {
  const buckets = recs(step.buckets);
  const items = recs(step.items);
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold">ყუთები</p>
        <div className="flex flex-wrap gap-2">
          {buckets.map((bucket, index) => (
            <div key={str(bucket.id)} className="flex items-center gap-1">
              <MiniInput label={`ყუთი ${index + 1}`} placeholder="el" lang="es" value={str(bucket.label)} onChange={(label) => onChange({ ...step, buckets: replaceAt(buckets, index, { ...bucket, label }) })} className="w-36" />
              {buckets.length > 2 ? (
                <button type="button" aria-label={`ყუთი ${index + 1}: წაშლა`} className="size-11 text-ink-muted hover:text-burgundy" onClick={() => {
                  const remaining = removeAt(buckets, index);
                  onChange({ ...step, buckets: remaining, items: items.map((item) => (item.bucketId === bucket.id ? { ...item, bucketId: remaining[0]?.id } : item)) });
                }}>×</button>
              ) : null}
            </div>
          ))}
          <button type="button" className="h-11 px-2 text-sm font-semibold text-teal-deep" onClick={() => onChange({ ...step, buckets: [...buckets, { id: nextId(buckets.map((bucket) => str(bucket.id)), "b"), label: "" }] })}>+ ყუთი</button>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold">ბარათები</p>
        {items.map((item, index) => (
          <div key={str(item.id) || index} className="flex items-center gap-2">
            <MiniInput label={`ბარათი ${index + 1}`} placeholder="café" lang="es" value={str(item.text)} onChange={(text) => onChange({ ...step, items: replaceAt(items, index, { ...item, text }) })} />
            <div className="flex shrink-0 gap-1" role="group" aria-label={`ბარათი ${index + 1}: სწორი ყუთი`}>
              {buckets.map((bucket) => (
                <button key={str(bucket.id)} type="button" aria-pressed={item.bucketId === bucket.id} onClick={() => onChange({ ...step, items: replaceAt(items, index, { ...item, bucketId: bucket.id }) })} className={`h-11 min-w-11 rounded-lg border-[1.5px] px-2 text-sm font-semibold ${item.bucketId === bucket.id ? "border-teal-deep bg-teal-deep text-on-dark" : "border-sand"}`}>
                  {str(bucket.label) || "?"}
                </button>
              ))}
            </div>
            <button type="button" aria-label={`ბარათი ${index + 1}: წაშლა`} className="size-11 shrink-0 text-ink-muted hover:text-burgundy" onClick={() => onChange({ ...step, items: removeAt(items, index) })}>×</button>
          </div>
        ))}
        <button type="button" className="h-10 w-fit text-sm font-semibold text-teal-deep" onClick={() => onChange({ ...step, items: [...items, { id: nextId(items.map((item) => str(item.id)), "i"), text: "", bucketId: buckets[0]?.id ?? "" }] })}>+ ბარათი</button>
      </div>
    </div>
  );
}

function PairsStep({ step, onChange }: { step: Rec; onChange: (step: Rec) => void }) {
  const pairs = recs(step.pairs);
  const images = step.mode === "word_image";
  return (
    <div className="flex flex-col gap-3">
      <Segmented
        label="წყვილის ტიპი"
        value={images ? "word_image" : "word_translation"}
        options={[{ id: "word_translation", label: "სიტყვა ↔ თარგმანი" }, { id: "word_image", label: "სიტყვა ↔ სურათი" }]}
        onChange={(mode) => onChange({ ...step, mode, pairs: pairs.map((pair) => ({ ...pair, right: mode === "word_image" ? (typeof pair.right === "string" ? undefined : pair.right) : typeof pair.right === "string" ? pair.right : "" })) })}
      />
      {pairs.map((pair, index) => (
        <div key={index} className="flex items-center gap-2">
          <MiniInput label={`წყვილი ${index + 1}: სიტყვა`} placeholder="el café" lang="es" value={str(pair.left)} onChange={(left) => onChange({ ...step, pairs: replaceAt(pairs, index, { ...pair, left }) })} />
          <span className="text-ink-muted" aria-hidden>↔</span>
          {images ? (
            <MediaSlot compact kind="image" label={`წყვილი ${index + 1}: სურათი`} value={pair.right} onChange={(right) => onChange({ ...step, pairs: replaceAt(pairs, index, { ...pair, right }) })} />
          ) : (
            <MiniInput label={`წყვილი ${index + 1}: თარგმანი`} placeholder="ყავა" value={str(pair.right)} onChange={(right) => onChange({ ...step, pairs: replaceAt(pairs, index, { ...pair, right }) })} />
          )}
          <button type="button" aria-label={`წყვილი ${index + 1}: წაშლა`} className="size-11 shrink-0 text-ink-muted hover:text-burgundy" onClick={() => onChange({ ...step, pairs: removeAt(pairs, index) })}>×</button>
        </div>
      ))}
      <button type="button" className="h-10 w-fit text-sm font-semibold text-teal-deep" onClick={() => onChange({ ...step, pairs: [...pairs, { left: "", right: images ? undefined : "" }] })}>+ წყვილი</button>
    </div>
  );
}

function BranchStep({ step, onChange }: { step: Rec; onChange: (step: Rec) => void }) {
  const speakers = recs(step.speakers);
  const nodes = recs(step.nodes);
  const ids = nodes.map((node) => str(node.id));

  function setNodes(next: Rec[]) {
    onChange({ ...step, nodes: next });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold">ვინ გელაპარაკება</p>
        <div className="flex flex-wrap gap-2">
          {SPEAKER_PRESETS.filter((preset) => preset.id !== "tu").map((preset) => {
            const active = speakers.some((speaker) => speaker.id === preset.id);
            return (
              <ChoiceChip key={preset.id} pressed={active} className="gap-2" onClick={() => onChange({ ...step, speakers: active ? speakers.filter((speaker) => speaker.id !== preset.id) : [...speakers, { ...preset }] })}>
                <span className={`flex size-6 items-center justify-center rounded-full text-xs font-bold ${toneClass(preset.tone)}`}>{preset.initial}</span>
                {preset.name}
              </ChoiceChip>
            );
          })}
        </div>
      </div>
      <p className="rounded-xl bg-paper-deep px-4 py-3 text-sm leading-relaxed text-ink-muted">
        ყოველი „რეპლიკა“ — ის, რასაც პერსონაჟი ამბობს. ქვემოთ — მოსწავლის პასუხის ვარიანტები და სად გადადის საუბარი. რეპლიკა პასუხების გარეშე = დასასრული.
      </p>
      <ol className="flex flex-col gap-3">
        {nodes.map((node, index) => {
          const choices = recs(node.choices);
          return (
            <li key={str(node.id)} className="flex flex-col gap-2 rounded-xl border-[1.5px] border-line bg-card p-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-md bg-teal-soft px-2 py-1 text-xs font-bold text-teal-deep">{str(node.id)}{step.start === node.id ? " · დასაწყისი" : ""}</span>
                <select aria-label={`${str(node.id)}: ვინ ამბობს`} value={str(node.speakerId)} onChange={(event) => setNodes(replaceAt(nodes, index, { ...node, speakerId: event.target.value || undefined }))} className={`${miniField} w-40`}>
                  <option value="">მთხრობელი</option>
                  {speakers.map((speaker) => <option key={str(speaker.id)} value={str(speaker.id)}>{str(speaker.name)}</option>)}
                </select>
                {step.start !== node.id ? <button type="button" className="h-9 text-xs font-semibold text-teal-deep" onClick={() => onChange({ ...step, start: node.id })}>დასაწყისად</button> : null}
                <span className="flex-1" />
                {nodes.length > 1 ? <button type="button" aria-label={`${str(node.id)}: წაშლა`} className="size-11 text-ink-muted hover:text-burgundy" onClick={() => setNodes(removeAt(nodes, index))}>×</button> : null}
              </div>
              <MiniInput label={`${str(node.id)}: ტექსტი`} placeholder="¡Hola! ¿Qué te pongo?" lang="es" value={str(node.text)} onChange={(text) => setNodes(replaceAt(nodes, index, { ...node, text }))} />
              <div className="flex flex-col gap-2 border-l-2 border-line pl-3">
                {choices.map((choice, choiceIndex) => (
                  <div key={choiceIndex} className="flex flex-wrap items-center gap-2">
                    <MiniInput label={`${str(node.id)}: პასუხი ${choiceIndex + 1}`} placeholder="Un café, por favor." lang="es" value={str(choice.text)} onChange={(text) => setNodes(replaceAt(nodes, index, { ...node, choices: replaceAt(choices, choiceIndex, { ...choice, text }) }))} className="min-w-48 flex-1" />
                    <select aria-label={`${str(node.id)}: პასუხი ${choiceIndex + 1} გადადის`} value={str(choice.next)} onChange={(event) => setNodes(replaceAt(nodes, index, { ...node, choices: replaceAt(choices, choiceIndex, { ...choice, next: event.target.value }) }))} className={`${miniField} w-32`}>
                      {ids.map((id) => <option key={id} value={id}>→ {id}</option>)}
                    </select>
                    <button type="button" aria-pressed={choice.isGood === true} onClick={() => setNodes(replaceAt(nodes, index, { ...node, choices: replaceAt(choices, choiceIndex, { ...choice, isGood: choice.isGood !== true }) }))} className={`h-11 rounded-lg border-[1.5px] px-2 text-sm font-semibold ${choice.isGood ? "border-sage bg-sage-soft text-sage-ink" : "border-sand text-ink-muted"}`}>
                      {choice.isGood ? "✓ კარგი" : "კარგი?"}
                    </button>
                    <button type="button" aria-label={`${str(node.id)}: პასუხი ${choiceIndex + 1} წაშლა`} className="size-11 text-ink-muted hover:text-burgundy" onClick={() => setNodes(replaceAt(nodes, index, { ...node, choices: removeAt(choices, choiceIndex) }))}>×</button>
                  </div>
                ))}
                <button type="button" className="h-10 w-fit text-sm font-semibold text-teal-deep" onClick={() => setNodes(replaceAt(nodes, index, { ...node, choices: [...choices, { text: "", next: ids[index + 1] ?? ids[0] ?? "", isGood: false }] }))}>+ პასუხის ვარიანტი</button>
              </div>
            </li>
          );
        })}
      </ol>
      <AddButton onClick={() => setNodes([...nodes, { id: nextId(ids, "n"), speakerId: str(speakers[0]?.id) || undefined, text: "" }])}>რეპლიკის დამატება</AddButton>
    </div>
  );
}

function CheckpointStep({ step, scope, onChange }: { step: Rec; scope: string; onChange: (step: Rec) => void }) {
  const sections = recs(step.sections);
  const [open, setOpen] = useState<string>("0-0");

  function setSections(next: Rec[]) {
    onChange({ ...step, sections: next });
  }

  return (
    <div className="flex flex-col gap-4">
      {sections.map((section, sectionIndex) => {
        const refs = recs(section.stepRefs);
        return (
          <div key={sectionIndex} className="flex flex-col gap-3 rounded-xl border-[1.5px] border-line bg-card p-3">
            <div className="flex items-center gap-2">
              <MiniInput label={`ნაწილი ${sectionIndex + 1}: სახელი`} placeholder="ლექსიკა" value={str(section.labelKa)} onChange={(labelKa) => setSections(replaceAt(sections, sectionIndex, { ...section, labelKa }))} className="font-semibold" />
              <RowTools index={sectionIndex} count={sections.length} label={`ნაწილი ${sectionIndex + 1}`} onMove={(direction) => setSections(move(sections, sectionIndex, direction))} onRemove={() => setSections(removeAt(sections, sectionIndex))} />
            </div>
            <ol className="flex flex-col gap-2">
              {refs.map((ref, refIndex) => {
                const key = `${sectionIndex}-${refIndex}`;
                const refTemplate = str(ref.templateId) || "multiple_choice";
                const expanded = open === key;
                return (
                  <li key={refIndex} className="rounded-lg border-[1.5px] border-line-soft bg-paper">
                    <div className="flex items-center gap-2 p-1 pl-2">
                      <button type="button" aria-expanded={expanded} onClick={() => setOpen(expanded ? "" : key)} className="flex min-h-11 flex-1 items-center gap-2 text-left text-sm">
                        <span className={`flex size-6 items-center justify-center rounded-full text-xs font-bold ${stepFilled(refTemplate, ref) ? "bg-sage-soft text-sage-ink" : "bg-mustard-soft text-mustard-ink"}`}>{refIndex + 1}</span>
                        <span className="font-semibold">{exerciseTemplateMeta(refTemplate)?.labelKa}</span>
                        <span className="truncate text-ink-muted">{stepTitle(refTemplate, ref)}</span>
                      </button>
                      <button type="button" aria-label={`კითხვა ${refIndex + 1}: წაშლა`} className="size-11 text-ink-muted hover:text-burgundy" onClick={() => setSections(replaceAt(sections, sectionIndex, { ...section, stepRefs: removeAt(refs, refIndex) }))}>×</button>
                    </div>
                    {expanded ? (
                      <div className="border-t border-line-soft p-3">
                        <StepEditor templateId={refTemplate} step={ref} scope={`${scope}-${key}`} onChange={(next) => setSections(replaceAt(sections, sectionIndex, { ...section, stepRefs: replaceAt(refs, refIndex, { ...next, templateId: refTemplate }) }))} />
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ol>
            <div className="flex flex-wrap gap-2">
              {CHECKPOINT_PARTS.map((id) => (
                <button
                  key={id}
                  type="button"
                  className="h-10 rounded-lg border-[1.5px] border-dashed border-teal-deep px-3 text-sm font-semibold text-teal-deep"
                  onClick={() => {
                    setSections(replaceAt(sections, sectionIndex, { ...section, stepRefs: [...refs, { templateId: id, ...blankExerciseStep(id) }] }));
                    setOpen(`${sectionIndex}-${refs.length}`);
                  }}
                >
                  + {exerciseTemplateMeta(id)?.labelKa}
                </button>
              ))}
            </div>
          </div>
        );
      })}
      <AddButton onClick={() => setSections([...sections, { labelKa: "", stepRefs: [] }])}>ნაწილის დამატება</AddButton>
    </div>
  );
}
