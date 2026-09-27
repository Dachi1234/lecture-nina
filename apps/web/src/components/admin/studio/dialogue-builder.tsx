"use client";

import { useState } from "react";
import { SPEAKER_PRESETS } from "@nina/contracts";
import { ChoiceChip } from "@nina/ui";
import { SPEAKER_TONES, toneClass, toneLabels } from "@/lib/tones";
import { AddButton, MediaSlot, MiniInput, RowTools, miniInput, move, recs, removeAt, replaceAt, str, type Rec } from "./kit";

type Speaker = { id: string; name: string; initial: string; tone: string };

function speakerOf(value: Rec): Speaker {
  return { id: str(value.id), name: str(value.name), initial: str(value.initial), tone: str(value.tone) || "teal" };
}

function slug(name: string, taken: Set<string>) {
  const base = name.toLowerCase().normalize("NFD").replace(/[^a-z0-9]/g, "") || "persona";
  let id = base;
  let index = 2;
  while (taken.has(id)) id = `${base}${index++}`;
  return id;
}

export function parseScript(text: string, speakers: Speaker[]) {
  const nextSpeakers = [...speakers];
  const lines: Rec[] = [];
  for (const raw of text.split("\n")) {
    const row = raw.trim();
    if (!row) continue;
    const colon = row.indexOf(":");
    if (colon <= 0) continue;
    const name = row.slice(0, colon).trim();
    const [es = "", en = ""] = row.slice(colon + 1).split("|").map((part) => part.trim());
    if (!es) continue;
    let speaker = nextSpeakers.find((item) => item.name.toLowerCase() === name.toLowerCase());
    if (!speaker) {
      const preset = SPEAKER_PRESETS.find((item) => item.name.toLowerCase() === name.toLowerCase());
      const taken = new Set(nextSpeakers.map((item) => item.id));
      speaker = preset && !taken.has(preset.id)
        ? { ...preset }
        : { id: slug(name, taken), name, initial: name.slice(0, 1).toUpperCase(), tone: SPEAKER_TONES[nextSpeakers.length % SPEAKER_TONES.length] ?? "teal" };
      nextSpeakers.push(speaker);
    }
    lines.push({ speakerId: speaker.id, es, en });
  }
  return { speakers: nextSpeakers, lines };
}

export function DialogueBuilder({ value, onChange, fullAudio = true }: { value: Rec; onChange: (value: Rec) => void; fullAudio?: boolean }) {
  const speakers = recs(value.speakers).map(speakerOf);
  const lines = recs(value.lines);
  const [customName, setCustomName] = useState("");
  const [script, setScript] = useState("");
  const [scriptOpen, setScriptOpen] = useState(false);
  const used = new Set(lines.map((line) => str(line.speakerId)));

  function setSpeakers(next: Speaker[]) {
    onChange({ ...value, speakers: next });
  }

  function setLines(next: Rec[]) {
    onChange({ ...value, lines: next });
  }

  function togglePreset(preset: (typeof SPEAKER_PRESETS)[number]) {
    if (speakers.some((item) => item.id === preset.id)) {
      if (used.has(preset.id)) return;
      setSpeakers(speakers.filter((item) => item.id !== preset.id));
      return;
    }
    setSpeakers([...speakers, { ...preset }]);
  }

  function addCustom() {
    const name = customName.trim();
    if (!name) return;
    const taken = new Set(speakers.map((item) => item.id));
    setSpeakers([...speakers, { id: slug(name, taken), name, initial: name.slice(0, 2), tone: SPEAKER_TONES[speakers.length % SPEAKER_TONES.length] ?? "teal" }]);
    setCustomName("");
  }

  function addLine() {
    const last = lines.at(-1);
    const lastIndex = speakers.findIndex((item) => item.id === str(last?.speakerId));
    const next = speakers[(lastIndex + 1) % Math.max(speakers.length, 1)] ?? speakers[0];
    setLines([...lines, { speakerId: next?.id ?? "", es: "", en: "" }]);
  }

  function applyScript() {
    const parsed = parseScript(script, speakers);
    if (parsed.lines.length === 0) return;
    onChange({ ...value, speakers: parsed.speakers, lines: [...lines.filter((line) => str(line.es).trim()), ...parsed.lines] });
    setScript("");
    setScriptOpen(false);
  }

  const customs = speakers.filter((speaker) => !SPEAKER_PRESETS.some((preset) => preset.id === speaker.id));

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3">
        <p className="text-sm font-semibold">პერსონაჟები</p>
        <div className="flex flex-wrap gap-2">
          {SPEAKER_PRESETS.map((preset) => {
            const active = speakers.some((item) => item.id === preset.id);
            return (
              <ChoiceChip
                key={preset.id}
                pressed={active}
                onClick={() => togglePreset(preset)}
                title={active && used.has(preset.id) ? "ამ პერსონაჟს ხაზები აქვს" : undefined}
                className="gap-2"
              >
                <span className={`flex size-6 items-center justify-center rounded-full text-xs font-bold ${toneClass(preset.tone)}`}>{preset.initial}</span>
                {preset.name}
              </ChoiceChip>
            );
          })}
        </div>
        {customs.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {customs.map((speaker) => (
              <li key={speaker.id} className="flex flex-wrap items-center gap-2">
                <span className={`flex size-9 items-center justify-center rounded-full text-sm font-bold ${toneClass(speaker.tone)}`}>{speaker.initial}</span>
                <MiniInput label="სახელი" value={speaker.name} onChange={(name) => setSpeakers(speakers.map((item) => (item.id === speaker.id ? { ...item, name } : item)))} className="max-w-48" />
                <MiniInput label="ინიციალი" value={speaker.initial} onChange={(initial) => setSpeakers(speakers.map((item) => (item.id === speaker.id ? { ...item, initial: initial.slice(0, 2) } : item)))} className="max-w-20" />
                <select
                  aria-label="ფერი"
                  value={speaker.tone}
                  onChange={(event) => setSpeakers(speakers.map((item) => (item.id === speaker.id ? { ...item, tone: event.target.value } : item)))}
                  className={`${miniInput} max-w-40`}
                >
                  {SPEAKER_TONES.map((tone) => <option key={tone} value={tone}>{toneLabels[tone]}</option>)}
                </select>
                <button type="button" disabled={used.has(speaker.id)} className="h-11 px-2 text-sm font-semibold text-burgundy disabled:opacity-40" onClick={() => setSpeakers(speakers.filter((item) => item.id !== speaker.id))}>
                  წაშლა
                </button>
              </li>
            ))}
          </ul>
        ) : null}
        <div className="flex gap-2">
          <MiniInput label="სხვა პერსონაჟი" placeholder="სხვა პერსონაჟი (მაგ. Marta)" value={customName} onChange={setCustomName} className="max-w-72" />
          <button type="button" onClick={addCustom} className="h-11 rounded-lg border-[1.5px] border-teal-deep px-3 text-sm font-semibold text-teal-deep">დამატება</button>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-semibold">ხაზები · {lines.length}</p>
          <button type="button" className="h-10 text-sm font-semibold text-teal-deep underline decoration-mustard decoration-2 underline-offset-4" onClick={() => setScriptOpen((open) => !open)}>
            {scriptOpen ? "დახურვა" : "მთლიანი ტექსტის ჩასმა"}
          </button>
        </div>
        {scriptOpen ? (
          <div className="flex flex-col gap-2 rounded-xl bg-paper-deep p-3">
            <p className="text-sm text-ink-muted">თითო ხაზი ახალ სტრიქონზე: <code>Ana: ¡Hola! ¿Qué tal? | Hi! How are you?</code>. ინგლისური „|“-ის შემდეგ არასავალდებულოა. ახალი სახელები ავტომატურად დაემატება.</p>
            <textarea value={script} onChange={(event) => setScript(event.target.value)} rows={6} lang="es" className={`${miniInput} h-auto py-2`} aria-label="დიალოგის ტექსტი" />
            <button type="button" onClick={applyScript} className="h-11 w-fit rounded-lg bg-teal-deep px-4 text-sm font-semibold text-on-dark">ხაზებად გადაქცევა</button>
          </div>
        ) : null}
        {speakers.length === 0 ? <p className="rounded-xl bg-mustard-soft px-4 py-3 text-sm text-mustard-ink">ჯერ აირჩიე მინიმუმ ორი პერსონაჟი.</p> : null}
        <ol className="flex flex-col gap-2">
          {lines.map((line, index) => {
            const speaker = speakers.find((item) => item.id === str(line.speakerId));
            return (
              <li key={index} className="flex flex-col gap-2 rounded-xl border-[1.5px] border-line bg-paper p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1" role="group" aria-label={`ხაზი ${index + 1}: ვინ ლაპარაკობს`}>
                    {speakers.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        aria-pressed={item.id === speaker?.id}
                        onClick={() => setLines(replaceAt(lines, index, { ...line, speakerId: item.id }))}
                        className={`flex h-9 items-center gap-1.5 rounded-lg px-2 text-sm font-semibold transition ${item.id === speaker?.id ? "bg-card ring-2 ring-teal-deep" : "text-ink-muted hover:bg-card"}`}
                      >
                        <span className={`flex size-6 items-center justify-center rounded-full text-xs font-bold ${toneClass(item.tone)}`}>{item.initial}</span>
                        {item.name}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-1">
                    <MediaSlot compact kind="audio" label={`ხაზი ${index + 1}: აუდიო`} value={line.audio} onChange={(audio) => setLines(replaceAt(lines, index, { ...line, audio }))} />
                    <RowTools index={index} count={lines.length} label={`ხაზი ${index + 1}`} onMove={(direction) => setLines(move(lines, index, direction))} onRemove={() => setLines(removeAt(lines, index))} />
                  </div>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <MiniInput label="ესპანურად" placeholder="ესპანურად: ¡Hola! ¿Qué quieres tomar?" lang="es" value={str(line.es)} onChange={(es) => setLines(replaceAt(lines, index, { ...line, es }))} />
                  <MiniInput label="ინგლისურად" placeholder="English: Hi! What would you like?" lang="en" value={str(line.en)} onChange={(en) => setLines(replaceAt(lines, index, { ...line, en }))} />
                </div>
              </li>
            );
          })}
        </ol>
        <AddButton onClick={addLine}>ხაზის დამატება</AddButton>
      </div>

      {fullAudio ? (
        <MediaSlot kind="audio" label="მთლიანი დიალოგის აუდიო (არასავალდებულო)" value={value.fullAudio} onChange={(audio) => onChange({ ...value, fullAudio: audio })} />
      ) : null}
    </div>
  );
}
