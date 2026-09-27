"use client";

import { Fragment, useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { exerciseContentSchema, materialReadiness, type ExerciseContent } from "@nina/contracts";
import { Icon } from "@nina/ui";
import { MarkDone } from "./mark-done";
import { ExercisePlayer } from "./exercise-player";
import { groupTone, materialIcon, materialLabel } from "@/lib/materials";
import { toneClass } from "@/lib/tones";

type Neighbor = { id: string; title: string } | null;

export type MaterialPayload = {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  type: string;
  content: unknown;
  status: "NOT_STARTED" | "OPENED" | "COMPLETED";
  lastStep: number | null;
  canMarkDone: boolean;
  lessonId: string | null;
  preview?: boolean;
  assets: Record<string, string>;
  prev: Neighbor;
  next: Neighbor;
};

type Rec = Record<string, unknown>;
type Assets = Record<string, string>;

const exerciseTypes = new Set(["EXERCISE", "GAME", "CHECKPOINT"]);

export function MaterialStage({ material }: { material: MaterialPayload }) {
  const exercise = exerciseContentSchema.safeParse(material.content);
  if (exerciseTypes.has(material.type) && exercise.success && exercise.data.steps.length > 0) {
    return <ExercisePlayer material={material} content={exercise.data} />;
  }
  return <PassiveViewer material={material} />;
}

function PassiveViewer({ material }: { material: MaterialPayload }) {
  const back = material.lessonId ? `/app/lessons/${material.lessonId}` : "/app/lessons";
  const query = material.lessonId ? `?lessonId=${material.lessonId}` : "";
  const readiness = materialReadiness(material.type, material.content);
  const tone = groupTone(material.type);
  const empty = readiness.empty || (exerciseTypes.has(material.type) && !readiness.ready);
  return (
    <article className="mx-auto flex w-full max-w-3xl flex-col gap-5">
      {material.preview ? null : (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link href={back} className="text-sm font-semibold text-teal-deep">
            ← გაკვეთილზე დაბრუნება
          </Link>
          <div className="flex gap-4 text-sm font-semibold">
            {material.prev ? <Link href={`/app/m/${material.prev.id}${query}`} className="text-teal-deep">← {material.prev.title}</Link> : null}
            {material.next ? <Link href={`/app/m/${material.next.id}${query}`} className="text-teal-deep">{material.next.title} →</Link> : null}
          </div>
        </div>
      )}
      <header className="flex items-start gap-3">
        <span className={`inline-flex size-11 shrink-0 items-center justify-center rounded-xl ${tone.tile} ${tone.ink}`}>
          <Icon name={materialIcon(material.type)} width={22} height={22} />
        </span>
        <div className="min-w-0">
          <p className={`text-sm font-semibold ${tone.ink}`}>{materialLabel(material.type, null)}</p>
          <h1 className="text-3xl leading-tight font-bold break-words sm:text-4xl">{material.title}</h1>
          {material.subtitle ? <p className="mt-1 text-lg text-ink-muted">{material.subtitle}</p> : null}
        </div>
      </header>
      {empty ? <NotReady preview={Boolean(material.preview)} /> : <ViewerBody material={material} />}
      {material.description && !empty ? (
        <p className="rounded-2xl border-l-4 border-mustard bg-card px-5 py-4 text-lg leading-relaxed">{material.description}</p>
      ) : null}
      {!material.preview && !empty && material.canMarkDone && material.status !== "COMPLETED" ? <MarkDone materialId={material.id} /> : null}
    </article>
  );
}

function NotReady({ preview }: { preview: boolean }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border-[1.5px] border-dashed border-sand bg-card px-6 py-10 text-center">
      <img src="/illustrations/spots/spot-notebook.webp" alt="" className="h-28" />
      <p className="text-lg font-semibold">{preview ? "აქ გამოჩნდება მასალა" : "ნინა ამ მასალას ჯერ ამზადებს"}</p>
      <p className="max-w-sm text-ink-muted">{preview ? "შეავსე ველები მარცხნივ — გადახედვა მაშინვე განახლდება." : "როგორც კი მზად იქნება, აქვე გამოჩნდება. მანამდე შეგიძლია სხვა მასალაზე გადახვიდე."}</p>
    </div>
  );
}

function ViewerBody({ material }: { material: MaterialPayload }) {
  const content = asRecord(material.content);
  const assets = material.assets;
  switch (material.type) {
    case "INFO_CARD":
      return <ImageCard pages={refs(content.pages)} alt={str(content.altKa) || material.title} caption={str(content.captionKa)} assets={assets} />;
    case "VOCAB":
      return <VocabCard content={content} assets={assets} title={material.title} />;
    case "DIALOGUE":
      return <DialogueView dialogue={content} assets={assets} />;
    case "VIDEO":
      return <VideoView content={content} assets={assets} />;
    case "AUDIO":
      return <AudioView content={content} assets={assets} />;
    case "DOCUMENT":
      return <DocumentView content={content} assets={assets} />;
    case "GRADED_READER":
      return <ReaderView content={content} assets={assets} />;
    case "PRONUNCIATION":
      return <PronunciationView content={content} assets={assets} />;
    case "GRAMMAR":
      return <GrammarView content={content} assets={assets} />;
    case "STORY":
      return <StoryView content={content} assets={assets} />;
    case "HTML_EMBED":
      return <EmbedView materialId={material.id} content={content} assets={assets} />;
    default:
      return null;
  }
}

function asRecord(value: unknown): Rec {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as Rec;
}

function records(value: unknown): Rec[] {
  return Array.isArray(value) ? value.map(asRecord) : [];
}

function str(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function ref(value: unknown) {
  const record = asRecord(value);
  return typeof record.assetId === "string" ? record.assetId : undefined;
}

function refs(value: unknown) {
  return Array.isArray(value) ? value.map(ref).filter((id): id is string => Boolean(id)) : [];
}

function src(assets: Assets, value: unknown) {
  const id = ref(value);
  return id ? assets[id] : undefined;
}

function plain(value: unknown): string {
  if (typeof value === "string") return value;
  if (!value || typeof value !== "object") return "";
  if ("text" in value && typeof value.text === "string") return value.text;
  if ("content" in value && Array.isArray(value.content)) return value.content.map(plain).join("\n");
  return "";
}

function inline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, index) =>
    part.startsWith("**") && part.endsWith("**") ? <strong key={index} className="font-bold text-navy">{part.slice(2, -2)}</strong> : <Fragment key={index}>{part}</Fragment>,
  );
}

export function RichText({ value, className, lang }: { value: unknown; className?: string; lang?: string }) {
  const text = plain(value).trim();
  if (!text) return null;
  const blocks = text.split(/\n\s*\n/);
  return (
    <div className={`flex flex-col gap-3 text-lg leading-relaxed ${className ?? ""}`} lang={lang}>
      {blocks.map((block, index) => {
        const lines = block.split("\n").filter((line) => line.trim());
        if (lines.length && lines.every((line) => /^\s*[-•]\s/.test(line))) {
          return (
            <ul key={index} className="flex flex-col gap-1.5 pl-1">
              {lines.map((line, lineIndex) => (
                <li key={lineIndex} className="flex gap-2"><span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-mustard" aria-hidden />{inline(line.replace(/^\s*[-•]\s/, ""))}</li>
              ))}
            </ul>
          );
        }
        return <p key={index}>{lines.map((line, lineIndex) => <Fragment key={lineIndex}>{lineIndex ? <br /> : null}{inline(line)}</Fragment>)}</p>;
      })}
    </div>
  );
}

function ImageCard({ pages, alt, caption, assets }: { pages: string[]; alt: string; caption?: string; assets: Assets }) {
  const [page, setPage] = useState(0);
  const [zoom, setZoom] = useState(1);
  const touch = useRef<number | null>(null);
  const current = pages[Math.min(page, pages.length - 1)];
  const image = current ? assets[current] : undefined;
  const go = (direction: -1 | 1) => {
    setZoom(1);
    setPage((value) => Math.min(Math.max(value + direction, 0), pages.length - 1));
  };
  if (!image) return null;
  return (
    <figure
      className="flex flex-col items-center gap-3"
      tabIndex={0}
      aria-label="ბარათები"
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") go(-1);
        if (event.key === "ArrowRight") go(1);
      }}
    >
      <div
        className="w-full max-w-sm overflow-hidden rounded-2xl bg-sand-soft shadow-sm"
        onTouchStart={(event) => { touch.current = event.touches[0]?.clientX ?? null; }}
        onTouchEnd={(event) => {
          const start = touch.current;
          const end = event.changedTouches[0]?.clientX;
          if (start === null || end === undefined || Math.abs(end - start) < 40 || zoom > 1) return;
          go(end < start ? 1 : -1);
        }}
      >
        <img src={image} alt={`${alt}${pages.length > 1 ? ` · ${page + 1} / ${pages.length}` : ""}`} className="aspect-[9/16] w-full object-contain transition-transform motion-reduce:transition-none" style={{ transform: `scale(${zoom})` }} />
      </div>
      {caption ? <figcaption className="text-center text-lg font-semibold">{caption}</figcaption> : null}
      <div className="flex items-center gap-2">
        <button type="button" className="size-11 rounded-xl border-[1.5px] border-sand bg-card" aria-label="დაპატარავება" onClick={() => setZoom((value) => Math.max(1, value - 0.25))}>−</button>
        <button type="button" className="size-11 rounded-xl border-[1.5px] border-sand bg-card" aria-label="გადიდება" onClick={() => setZoom((value) => Math.min(2, value + 0.25))}>+</button>
        {pages.length > 1 ? (
          <>
            <button type="button" className="h-11 rounded-xl border-[1.5px] border-sand bg-card px-4" aria-label="წინა ბარათი" disabled={page === 0} onClick={() => go(-1)}>←</button>
            <span className="min-w-12 text-center text-sm font-semibold">{page + 1} / {pages.length}</span>
            <button type="button" className="h-11 rounded-xl border-[1.5px] border-sand bg-card px-4" aria-label="შემდეგი ბარათი" disabled={page === pages.length - 1} onClick={() => go(1)}>→</button>
          </>
        ) : null}
      </div>
      {pages.length > 1 ? <p className="text-sm text-ink-muted">ტელეფონზე გადაფურცლე ← →</p> : null}
    </figure>
  );
}

type Word = { article: string; es: string; ka: string; en: string; exampleEs: string; exampleKa: string; audio?: string; image?: string };

const articleTone: Record<string, string> = {
  el: "text-teal-deep",
  los: "text-teal-deep",
  la: "text-burgundy",
  las: "text-burgundy",
};

function VocabCard({ content, assets, title }: { content: Rec; assets: Assets; title: string }) {
  const heading = asRecord(content.title);
  const words: Word[] = records(content.entries)
    .filter((entry) => str(entry.es))
    .map((entry) => ({
      article: str(entry.article),
      es: str(entry.es),
      ka: str(entry.ka),
      en: str(entry.en),
      exampleEs: str(entry.exampleEs),
      exampleKa: str(entry.exampleKa),
      audio: src(assets, entry.audio),
      image: src(assets, entry.image),
    }));
  const pages = refs(content.pages);
  const [mode, setMode] = useState<"list" | "cards">("list");
  const [english, setEnglish] = useState(false);
  return (
    <div className="flex flex-col gap-5">
      {content.layout === "image" && pages.length ? <ImageCard pages={pages} alt={str(heading.es) || title} assets={assets} /> : null}
      {words.length ? (
        <section className="overflow-hidden rounded-2xl border-[1.5px] border-line bg-card">
          <header className="flex flex-wrap items-end justify-between gap-3 border-b border-line-soft bg-mustard-soft px-5 py-4">
            <div>
              {str(heading.es) ? <h2 className="text-2xl font-bold" lang="es">{str(heading.es)}</h2> : null}
              <p className="text-ink-muted">{[str(heading.ka), `${words.length} სიტყვა`].filter(Boolean).join(" · ")}</p>
            </div>
            <div className="flex gap-2">
              <Toggle pressed={mode === "list"} onClick={() => setMode("list")}>სია</Toggle>
              <Toggle pressed={mode === "cards"} onClick={() => setMode("cards")}>ბარათებით ვარჯიში</Toggle>
            </div>
          </header>
          {str(content.introKa) ? <p className="px-5 pt-4 text-lg leading-relaxed">{str(content.introKa)}</p> : null}
          {mode === "list" ? (
            <>
              <div className="flex justify-end px-5 pt-3">
                <Toggle pressed={english} onClick={() => setEnglish((value) => !value)}>EN</Toggle>
              </div>
              <ul className="flex flex-col px-5 pb-3">
                {words.map((word, index) => (
                  <li key={`${word.es}-${index}`} className="flex items-center gap-3 border-b border-line-soft py-3 last:border-b-0">
                    {word.image ? <img src={word.image} alt="" className="size-14 shrink-0 rounded-xl object-cover" loading="lazy" /> : null}
                    <div className="min-w-0 flex-1">
                      <p className="text-lg" lang="es">
                        {word.article ? <span className={`font-semibold ${articleTone[word.article] ?? ""}`}>{word.article} </span> : null}
                        <b>{word.es}</b>
                        <span className="text-ink-muted"> — {word.ka}{english && word.en ? ` · ${word.en}` : ""}</span>
                      </p>
                      {word.exampleEs ? (
                        <p className="mt-0.5 text-[15px] text-ink-muted"><span lang="es" className="italic">{word.exampleEs}</span>{word.exampleKa ? ` — ${word.exampleKa}` : ""}</p>
                      ) : null}
                    </div>
                    {word.audio ? <PlayButton src={word.audio} label={`${word.es}: მოსმენა`} /> : null}
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <Flashcards words={words} />
          )}
        </section>
      ) : null}
    </div>
  );
}

function Flashcards({ words }: { words: Word[] }) {
  const [order, setOrder] = useState(() => words.map((_, index) => index));
  const [position, setPosition] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const word = words[order[position] ?? 0];
  if (!word) return null;
  const go = (direction: -1 | 1) => {
    setFlipped(false);
    setPosition((value) => Math.min(Math.max(value + direction, 0), words.length - 1));
  };
  return (
    <div className="flex flex-col items-center gap-4 p-5">
      <button
        type="button"
        onClick={() => setFlipped((value) => !value)}
        aria-label={flipped ? "ბარათის წინა მხარე" : "გადაბრუნება"}
        className="flex min-h-64 w-full max-w-md flex-col items-center justify-center gap-3 rounded-2xl border-[1.5px] border-line bg-paper px-6 py-8 text-center shadow-sm transition hover:-translate-y-0.5"
      >
        {!flipped ? (
          <>
            {word.image ? <img src={word.image} alt="" className="h-28 rounded-xl object-cover" /> : null}
            <p className="text-4xl font-bold" lang="es">
              {word.article ? <span className={`font-semibold ${articleTone[word.article] ?? ""}`}>{word.article} </span> : null}
              {word.es}
            </p>
            <p className="text-sm text-ink-muted">დააჭირე, რომ ნახო თარგმანი</p>
          </>
        ) : (
          <>
            <p className="text-3xl font-bold">{word.ka}</p>
            {word.en ? <p className="text-lg text-ink-muted" lang="en">{word.en}</p> : null}
            {word.exampleEs ? <p className="mt-2 text-lg italic" lang="es">{word.exampleEs}</p> : null}
            {word.exampleKa ? <p className="text-ink-muted">{word.exampleKa}</p> : null}
          </>
        )}
      </button>
      <div className="flex items-center gap-2">
        <button type="button" className="h-11 rounded-xl border-[1.5px] border-sand bg-card px-4" aria-label="წინა" disabled={position === 0} onClick={() => go(-1)}>←</button>
        <span className="min-w-14 text-center text-sm font-semibold">{position + 1} / {words.length}</span>
        <button type="button" className="h-11 rounded-xl border-[1.5px] border-sand bg-card px-4" aria-label="შემდეგი" disabled={position === words.length - 1} onClick={() => go(1)}>→</button>
        {word.audio ? <PlayButton src={word.audio} label={`${word.es}: მოსმენა`} /> : null}
        <button
          type="button"
          className="h-11 rounded-xl px-3 text-sm font-semibold text-teal-deep"
          onClick={() => {
            setOrder((current) => [...current].sort(() => Math.random() - 0.5));
            setPosition(0);
            setFlipped(false);
          }}
        >
          არევა
        </button>
      </div>
    </div>
  );
}

type Speaker = { id: string; name: string; initial: string; tone: string };

export function DialogueView({ dialogue, assets }: { dialogue: Rec; assets: Assets }) {
  const [english, setEnglish] = useState(false);
  const speakers = records(dialogue.speakers).map((speaker) => ({ id: str(speaker.id), name: str(speaker.name), initial: str(speaker.initial), tone: str(speaker.tone) })) as Speaker[];
  const lines = records(dialogue.lines).filter((line) => str(line.es));
  const context = asRecord(dialogue.context);
  const full = src(assets, dialogue.fullAudio);
  const hasEnglish = lines.some((line) => str(line.en));
  const order = [...new Set(lines.map((line) => str(line.speakerId)))];
  if (lines.length === 0) return null;
  return (
    <section className="flex flex-col gap-4">
      {str(context.ka) || str(context.es) ? (
        <p className="rounded-2xl bg-teal-softer px-5 py-3 text-lg leading-relaxed">
          {str(context.es) ? <span className="font-semibold text-teal-deep" lang="es">{str(context.es)} · </span> : null}
          {str(context.ka)}
        </p>
      ) : null}
      {full ? <audio controls src={full} className="w-full" /> : null}
      {hasEnglish ? (
        <div className="flex gap-2" role="group" aria-label="თარგმანი">
          <Toggle pressed={!english} onClick={() => setEnglish(false)}>ES</Toggle>
          <Toggle pressed={english} onClick={() => setEnglish(true)}>ES+EN</Toggle>
        </div>
      ) : null}
      <ol className="flex flex-col gap-3">
        {lines.map((line, index) => {
          const speaker = speakers.find((item) => item.id === str(line.speakerId));
          const right = order.indexOf(str(line.speakerId)) % 2 === 1;
          const audio = src(assets, line.audio);
          return (
            <li key={index} className={`flex items-end gap-3 ${right ? "flex-row-reverse" : ""}`}>
              <span className={`flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${toneClass(speaker?.tone)}`} aria-hidden>{speaker?.initial ?? "?"}</span>
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${right ? "rounded-br-md bg-teal-soft" : "rounded-bl-md bg-card"}`}>
                <p className="text-sm font-semibold text-ink-muted">{speaker?.name}</p>
                <p className="text-lg" lang="es">{str(line.es)}</p>
                {english && str(line.en) ? <p className="text-ink-muted" lang="en">{str(line.en)}</p> : null}
              </div>
              {audio ? <PlayButton src={audio} label={`ხაზი ${index + 1}: მოსმენა`} /> : null}
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function Intro({ text }: { text: string }) {
  if (!text) return null;
  return <p className="rounded-2xl bg-teal-softer px-5 py-3 text-lg leading-relaxed">{text}</p>;
}

function VideoView({ content, assets }: { content: Rec; assets: Assets }) {
  const video = src(assets, content.video);
  const captions = src(assets, content.captions);
  return (
    <div className="flex flex-col gap-4">
      <Intro text={str(content.introKa)} />
      {video ? (
        <video controls playsInline className="w-full rounded-2xl bg-navy" src={video}>
          {captions ? <track kind="captions" src={captions} srcLang="es" label="ES" default /> : null}
        </video>
      ) : null}
      <DialogueView dialogue={asRecord(content.dialogue)} assets={assets} />
    </div>
  );
}

function AudioView({ content, assets }: { content: Rec; assets: Assets }) {
  const audio = src(assets, content.audio);
  const player = useRef<HTMLAudioElement>(null);
  const [speed, setSpeed] = useState(1);
  const transcript = asRecord(content.transcript);
  useEffect(() => {
    if (player.current) player.current.playbackRate = speed;
  }, [speed]);
  return (
    <div className="flex flex-col gap-4">
      <Intro text={str(content.introKa)} />
      {audio ? (
        <div className="flex flex-col gap-3 rounded-2xl border-[1.5px] border-line bg-card p-4">
          <audio ref={player} controls src={audio} className="w-full" />
          <div className="flex items-center gap-2" role="group" aria-label="სიჩქარე">
            {[0.75, 1, 1.25].map((value) => (
              <Toggle key={value} pressed={speed === value} onClick={() => setSpeed(value)}>{value}×</Toggle>
            ))}
          </div>
        </div>
      ) : null}
      {records(transcript.lines).length ? (
        <>
          <p className="text-sm font-semibold tracking-wide text-teal-deep">TRANSCRIPCIÓN</p>
          <DialogueView dialogue={transcript} assets={assets} />
        </>
      ) : null}
    </div>
  );
}

function DocumentView({ content, assets }: { content: Rec; assets: Assets }) {
  const file = src(assets, content.file);
  const note = str(content.noteKa);
  return (
    <div className="flex flex-col gap-3">
      <Intro text={note} />
      {file ? (
        <>
          <iframe title="დოკუმენტი" src={file} className="h-[70vh] w-full rounded-2xl border-[1.5px] border-line bg-card" />
          {content.allowDownload !== false ? (
            <a href={file} className="inline-flex h-12 w-fit items-center gap-2 rounded-xl border-[1.5px] border-teal-deep px-5 font-semibold text-teal-deep" download>
              <Icon name="download" width={20} height={20} /> ჩამოტვირთვა
            </a>
          ) : null}
        </>
      ) : null}
    </div>
  );
}

function ReaderView({ content, assets }: { content: Rec; assets: Assets }) {
  const glossary = records(content.glossary).filter((item) => str(item.es));
  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-2xl border-[1.5px] border-line bg-card px-6 py-6 sm:px-10">
        <RichText value={content.body} lang="es" className="text-xl leading-loose" />
      </div>
      {glossary.length ? (
        <section className="rounded-2xl bg-mustard-soft px-5 py-4">
          <p className="text-sm font-semibold tracking-wide text-mustard-ink">VOCABULARIO</p>
          <ul className="mt-2 grid gap-x-6 gap-y-1 sm:grid-cols-2">
            {glossary.map((item, index) => (
              <li key={index} className="text-[17px]"><b lang="es">{str(item.es)}</b> — {str(item.ka)}</li>
            ))}
          </ul>
        </section>
      ) : null}
      {ref(content.file) ? <DocumentView content={{ file: content.file, allowDownload: true }} assets={assets} /> : null}
    </div>
  );
}

function PronunciationView({ content, assets }: { content: Rec; assets: Assets }) {
  const items = records(content.items).filter((item) => str(item.grapheme));
  const examples = Array.isArray(content.examples) ? content.examples.map(str).filter(Boolean) : [];
  const [playing, setPlaying] = useState<string | null>(null);
  function play(audio: string | undefined, key: string) {
    if (!audio) return;
    setPlaying(key);
    const sound = new Audio(audio);
    sound.onended = () => setPlaying(null);
    void sound.play().catch(() => setPlaying(null));
  }
  return (
    <div className="flex flex-col gap-6">
      <ul className="grid gap-4 sm:grid-cols-2">
        {items.map((item, index) => {
          const audio = src(assets, item.audio);
          const key = `${str(item.grapheme)}-${index}`;
          return (
            <li key={key} className="flex items-center gap-4 rounded-2xl border-[1.5px] border-line bg-card p-4">
              <button
                type="button"
                disabled={!audio}
                className={`flex size-20 shrink-0 items-center justify-center bg-pronunciation text-3xl text-navy lowercase transition motion-reduce:transition-none ${playing === key ? "scale-110" : ""} ${audio ? "hover:scale-105" : "cursor-default"}`}
                style={{ borderRadius: "46% 54% 42% 58% / 48% 42% 58% 52%" }}
                onClick={() => play(audio, key)}
                aria-label={audio ? `${str(item.grapheme)}: მოსმენა` : str(item.grapheme)}
              >
                {str(item.grapheme).toLowerCase()}
              </button>
              <div className="min-w-0">
                {str(item.hintKa) ? <p className="text-[17px] leading-snug">{str(item.hintKa)}</p> : null}
                {str(item.example) ? <p className="mt-1 text-lg font-semibold" lang="es">{str(item.example)}</p> : null}
                {audio ? <p className="mt-1 text-sm text-ink-muted">დააჭირე წრეს და მოუსმინე</p> : null}
              </div>
            </li>
          );
        })}
      </ul>
      {examples.length ? (
        <section className="flex flex-col gap-2">
          <p className="text-sm font-semibold">წაიკითხე ხმამაღლა</p>
          <div className="flex flex-wrap gap-2">
            {examples.map((example, index) => (
              <span key={`${example}-${index}`} className="rounded-full border-[1.5px] border-sand bg-card px-4 py-2 text-lg" lang="es">{example}</span>
            ))}
          </div>
        </section>
      ) : null}
      {str(content.tipKa) ? <Tip text={str(content.tipKa)} /> : null}
    </div>
  );
}

function Tip({ text }: { text: string }) {
  return (
    <aside className="flex gap-3 rounded-2xl bg-mustard-soft px-5 py-4">
      <img src="/illustrations/spots/spot-coffee.webp" alt="" className="h-14 shrink-0" loading="lazy" />
      <div>
        <p className="font-hand text-2xl leading-none text-burgundy">Un consejo</p>
        <p className="mt-1 text-[17px] leading-relaxed text-mustard-ink">{text}</p>
      </div>
    </aside>
  );
}

function GrammarView({ content, assets }: { content: Rec; assets: Assets }) {
  const examples = records(content.examples).filter((example) => str(example.es));
  const mistakes = records(content.mistakes).filter((mistake) => str(mistake.wrong) || str(mistake.right));
  const table = asRecord(content.table);
  const headers = Array.isArray(table.headers) ? table.headers.map(str) : [];
  const rows = Array.isArray(table.rows) ? table.rows.map((row) => (Array.isArray(row) ? row.map(str) : [])) : [];
  const image = src(assets, content.image);
  return (
    <div className="flex flex-col gap-5">
      {str(content.titleEs) || str(content.ruleKa) ? (
        <section className="rounded-2xl bg-sage-soft px-5 py-5">
          {str(content.titleEs) ? <p className="text-2xl font-bold text-sage-ink" lang="es">{str(content.titleEs)}</p> : null}
          {str(content.ruleKa) ? <p className="mt-1 text-xl leading-relaxed font-semibold">{inline(str(content.ruleKa))}</p> : null}
        </section>
      ) : null}
      <RichText value={content.body} />
      {headers.length && rows.length ? (
        <figure className="overflow-x-auto rounded-2xl border-[1.5px] border-line bg-card">
          <table className="w-full text-left text-lg">
            {headers.some(Boolean) ? (
              <thead className="bg-paper-deep text-sm text-ink-muted">
                <tr>{headers.map((header, index) => <th key={index} className="px-4 py-2.5 font-semibold">{header}</th>)}</tr>
              </thead>
            ) : null}
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={rowIndex} className="border-t border-line-soft">
                  {headers.map((_, column) => (
                    <td key={column} className={`px-4 py-2.5 ${column === 0 ? "text-ink-muted" : column === 1 ? "font-bold" : ""}`} lang={column < 2 ? "es" : undefined}>{inline(row[column] ?? "")}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {str(table.caption) ? <figcaption className="border-t border-line-soft px-4 py-2 text-sm text-ink-muted">{str(table.caption)}</figcaption> : null}
        </figure>
      ) : null}
      {image ? <img src={image} alt="" className="w-full rounded-2xl" loading="lazy" /> : null}
      {examples.length ? (
        <section className="flex flex-col gap-2">
          <p className="text-sm font-semibold tracking-wide text-teal-deep">EJEMPLOS</p>
          <ul className="flex flex-col gap-2">
            {examples.map((example, index) => (
              <li key={index} className="rounded-xl border-l-4 border-teal-deep bg-card px-4 py-3">
                <p className="text-lg font-semibold" lang="es">{inline(str(example.es))}</p>
                {str(example.ka) ? <p className="text-ink-muted">{str(example.ka)}</p> : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      {mistakes.length ? (
        <section className="flex flex-col gap-2">
          <p className="text-sm font-semibold">ყურადღება</p>
          <ul className="flex flex-col gap-2">
            {mistakes.map((mistake, index) => (
              <li key={index} className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-xl bg-card px-4 py-3 text-lg">
                <span className="text-burgundy line-through decoration-2" lang="es">{str(mistake.wrong).replace(/^✗\s*/, "")}</span>
                <span className="font-semibold text-sage-ink" lang="es">✓ {str(mistake.right).replace(/^✓\s*/, "")}</span>
                {str(mistake.noteKa) ? <span className="text-[15px] text-ink-muted">{str(mistake.noteKa)}</span> : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      {str(content.tipKa) ? <Tip text={str(content.tipKa)} /> : null}
    </div>
  );
}

function StoryView({ content, assets }: { content: Rec; assets: Assets }) {
  const place = asRecord(content.place);
  const image = src(assets, content.image);
  return (
    <div className="flex flex-col gap-5">
      {image ? <img src={image} alt="" className="w-full rounded-2xl object-cover" /> : null}
      {str(place.es) ? (
        <p className="flex items-center gap-2 text-sm font-semibold text-teal-deep">
          <Icon name="home" width={18} height={18} />
          <span lang="es">{str(place.es)}</span>{str(place.ka) ? ` · ${str(place.ka)}` : ""}
        </p>
      ) : null}
      {str(content.contextKa) ? <p className="text-xl leading-relaxed">{str(content.contextKa)}</p> : null}
      <DialogueView dialogue={asRecord(content.dialogue)} assets={assets} />
      {plain(content.grammarKa).trim() ? (
        <section className="rounded-2xl bg-sage-soft px-5 py-4">
          <p className="text-sm font-semibold tracking-wide text-sage-ink">GRAMÁTICA</p>
          <RichText value={content.grammarKa} className="mt-1" />
        </section>
      ) : null}
      {plain(content.cultureKa).trim() ? (
        <section className="rounded-2xl bg-mustard-soft px-5 py-4">
          <p className="text-sm font-semibold tracking-wide text-mustard-ink">CULTURA</p>
          <RichText value={content.cultureKa} className="mt-1" />
        </section>
      ) : null}
    </div>
  );
}

function EmbedView({ materialId, content, assets }: { materialId: string; content: Rec; assets: Assets }) {
  const bundle = src(assets, content.bundle);
  const frame = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(typeof content.height === "number" ? content.height : 640);
  useEffect(() => {
    if (!bundle) return;
    const onMessage = (message: MessageEvent) => {
      if (message.source !== frame.current?.contentWindow) return;
      const data = message.data as { type?: string; height?: number; score?: number };
      if (data?.type === "nina:resize" && typeof data.height === "number") setHeight(data.height);
      if (data?.type === "nina:complete") {
        void fetch(`/v1/me/embeds/${materialId}/complete`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ score: data.score }),
        });
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [materialId, bundle]);
  if (!bundle) return null;
  return (
    <iframe
      ref={frame}
      title="სავარჯიშო"
      sandbox="allow-scripts"
      src={bundle}
      style={{ height }}
      className="w-full rounded-2xl border-[1.5px] border-line bg-exercise"
      onLoad={(event) => {
        event.currentTarget.contentWindow?.postMessage({ type: "nina:init", student: { firstName: "" }, locale: "ka" }, "*");
      }}
    />
  );
}

function PlayButton({ src: audio, label }: { src: string; label: string }) {
  return (
    <button type="button" className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-teal-soft text-teal-deep transition hover:bg-teal-deep hover:text-on-dark" aria-label={label} onClick={() => void new Audio(audio).play()}>
      <Icon name="audio" width={20} height={20} />
    </button>
  );
}

function Toggle({ pressed, onClick, children }: { pressed: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" aria-pressed={pressed} onClick={onClick} className={`h-10 rounded-xl px-3 text-sm font-semibold ${pressed ? "bg-teal-deep text-on-dark" : "border-[1.5px] border-sand bg-card"}`}>
      {children}
    </button>
  );
}

export type { ExerciseContent };
