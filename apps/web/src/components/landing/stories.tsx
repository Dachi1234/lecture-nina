"use client";

import { useState } from "react";
import { landing } from "@/content/landing.ka";
import { BookButton } from "./booking";

const copy = landing.stories;

export function Stories() {
  const [english, setEnglish] = useState(false);
  const [cell, setCell] = useState({ x: 2, y: 1 });
  const [word, setWord] = useState("");

  function move(dx: number, dy: number, nextWord: string) {
    setCell((current) => ({
      x: Math.min(4, Math.max(0, current.x + dx)),
      y: Math.min(2, Math.max(0, current.y + dy)),
    }));
    setWord(nextWord);
  }

  return (
    <section id="istorias" className="scroll-mt-24 bg-navy text-on-dark">
      <Wave className="rotate-180 text-paper" />
      <div className="mx-auto grid max-w-[1280px] gap-10 px-5 py-16 md:px-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:py-20">
        <div>
          <div className="relative">
            <img src="/illustrations/scene-cafe-friends.webp" alt={copy.imageAlt} className="aspect-[6/7] w-full object-cover object-[50%_88%]" style={{ borderRadius: "180px 180px 28px 28px" }} loading="lazy" />
            <ul className="absolute inset-x-4 top-4 flex justify-between">
              {copy.names.map((person) => (
                <li key={person.name} className={`rounded-full bg-navy/70 px-3 py-1 font-hand text-2xl ${person.tone}`}>
                  {person.name}
                </li>
              ))}
            </ul>
          </div>
          <DanceFloor
            cell={cell}
            word={word}
            onMove={move}
          />
        </div>
        <div className="flex flex-col gap-5">
          <p className="font-hand text-4xl text-mustard md:text-[44px]">{copy.kicker}</p>
          <h2 className="text-[36px] leading-tight font-bold md:text-[46px]">{copy.title}</h2>
          <p className="text-[19px] leading-relaxed text-on-dark-muted">{copy.text}</p>
          <ul className="grid gap-4 sm:grid-cols-2">
            {copy.people.map((person) => (
              <li key={person.name}>
                <p className="font-hand text-3xl text-mustard">{person.name}</p>
                <p className="text-base leading-relaxed">{person.text}</p>
              </li>
            ))}
          </ul>
          <article className="rounded-2xl bg-card p-5 text-ink">
            <div className="mb-4 flex items-center justify-between gap-3">
              <p className="font-[family-name:var(--font-montserrat)] text-[15px] font-bold tracking-wide">
                {copy.dialogueLabel}
                <span className="font-normal text-ink-muted"> · {copy.dialoguePlace}</span>
              </p>
              <button type="button" className="rounded-lg border border-sand px-3 py-1.5 text-sm font-semibold text-teal-deep" aria-pressed={english} onClick={() => setEnglish((value) => !value)}>
                {copy.englishToggle} {english ? "✓" : "+"}
              </button>
            </div>
            <ul className="flex flex-col gap-3">
              {copy.lines.map((line) => (
                <li key={line.es} className="flex gap-3">
                  <span className={`inline-flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${line.tone}`}>{line.initial}</span>
                  <span>
                    <span className="block font-medium">{line.es}</span>
                    {english ? <span className="block text-sm text-ink-muted">{line.en}</span> : null}
                  </span>
                </li>
              ))}
            </ul>
          </article>
          <BookButton source="stories" variant="burgundy" className="w-fit" />
        </div>
      </div>
      <Wave className="text-paper" />
    </section>
  );
}

function DanceFloor({
  cell,
  word,
  onMove,
}: {
  cell: { x: number; y: number };
  word: string;
  onMove: (dx: number, dy: number, word: string) => void;
}) {
  return (
    <div
      className="mt-6 flex flex-col gap-3"
      tabIndex={0}
      onKeyDown={(event) => {
        const move = copy.moves.find((item) => item.id === event.key.replace("Arrow", "").toLowerCase());
        if (!move) return;
        event.preventDefault();
        onMove(move.dx, move.dy, move.word);
      }}
    >
      <p className="text-sm font-semibold text-on-dark-muted">{copy.danceTitle}</p>
      <div className="flex flex-wrap items-end gap-4">
        <div className="relative grid h-32 w-[236px] grid-cols-5 grid-rows-3 rounded-2xl border border-on-dark/20 bg-navy">
          <span
            className="relative col-start-1 row-start-1 size-8 self-center justify-self-center rounded-full bg-mustard transition-transform duration-300"
            style={{ transform: `translate(${cell.x * 40}px, ${cell.y * 32}px)` }}
          >
            <span className="absolute -top-1 left-1 size-2 rounded-full border border-navy" />
            <span className="absolute -top-1 right-1 size-2 rounded-full border border-navy" />
          </span>
          {word ? <span className="pointer-events-none absolute right-2 bottom-1 font-hand text-2xl text-mustard">{word}</span> : null}
        </div>
        <div className="grid grid-cols-2 gap-2">
          {copy.moves.map((move) => (
            <button key={move.id} type="button" className="rounded-xl border border-on-dark/30 px-3 py-2 text-sm" onClick={() => onMove(move.dx, move.dy, move.word)}>
              {move.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Wave({ className }: { className?: string }) {
  return (
    <svg className={`block h-10 w-full ${className ?? ""}`} viewBox="0 0 1440 48" preserveAspectRatio="none" aria-hidden>
      <path fill="currentColor" d="M0 24 C 240 48, 480 0, 720 20 C 980 42, 1200 8, 1440 28 V48 H0 Z" />
    </svg>
  );
}
