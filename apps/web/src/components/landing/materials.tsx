import type { ReactNode } from "react";
import { landing } from "@/content/landing.ka";

const copy = landing.materials;

export function Materials() {
  return (
    <section id="materiales" className="scroll-mt-24 bg-sand-soft">
      <div className="mx-auto grid max-w-[1280px] gap-10 px-5 py-16 md:px-10 lg:grid-cols-[380px_minmax(0,1fr)] lg:py-24">
        <div className="flex flex-col gap-4">
          <p className="font-hand text-4xl text-burgundy md:text-[44px]">{copy.kicker}</p>
          <h2 className="text-[36px] leading-tight font-bold md:text-[46px]">{copy.title}</h2>
          <p className="text-lg leading-relaxed text-ink-muted">{copy.text}</p>
          <ul className="flex flex-wrap gap-2">
            {copy.chips.map((chip) => (
              <li key={chip} className="rounded-full bg-card px-3 py-1 text-sm font-semibold text-teal-deep">
                {chip}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 lg:grid lg:grid-cols-3 lg:overflow-visible">
          <Mini className="rotate-[-4deg]">
            <p className="text-[11px] font-semibold tracking-widest text-teal-deep">{copy.cardKicker}</p>
            <p className="font-[family-name:var(--font-montserrat)] text-xl font-bold">{copy.cardTitle}</p>
            <ul className="mt-3 flex flex-col gap-2 text-sm">
              {copy.greetings.map(([es, ka]) => (
                <li key={es}>
                  <span className="font-semibold">{es}</span> <span className="text-ink-muted">{ka}</span>
                </li>
              ))}
            </ul>
          </Mini>
          <Mini className="rotate-[3deg]">
            <div className="flex items-start justify-between">
              <p className="text-lg font-bold">{copy.vocabTitle}</p>
              <p className="text-[11px] font-semibold tracking-widest text-teal-deep">{copy.vocabKicker}</p>
            </div>
            <ul className="mt-3 flex flex-col gap-2 text-sm">
              {copy.vocab.map(([es, ka]) => (
                <li key={es}>
                  <span className="font-semibold">{es}</span> · {ka}
                </li>
              ))}
            </ul>
          </Mini>
          <Mini className="rotate-[-2deg] bg-navy text-on-dark">
            <p className="text-sm font-semibold">{copy.audioTitle}</p>
            <p className="text-xs text-on-dark-muted">{copy.audioMeta}</p>
            <div className="mt-4 h-1.5 rounded-full bg-on-dark/20">
              <div className="h-1.5 w-1/3 rounded-full bg-mustard" />
            </div>
          </Mini>
          <Mini className="rotate-[2deg]">
            <ul className="flex flex-wrap gap-2">
              {copy.sounds.map((sound) => (
                <li key={sound} className="inline-flex size-12 items-center justify-center rounded-[46%_54%_42%_58%/52%_40%_60%_48%] bg-pronunciation text-lg font-semibold">
                  {sound}
                </li>
              ))}
            </ul>
          </Mini>
          <Mini className="rotate-[-1deg]">
            <ul className="flex flex-col gap-2 text-sm">
              {copy.miniDialogue.map(([who, line]) => (
                <li key={line}>
                  <span className="font-bold">{who}:</span> {line}
                </li>
              ))}
            </ul>
          </Mini>
          <Mini className="rotate-[4deg] bg-exercise">
            <p className="text-[11px] font-semibold tracking-widest text-teal-deep">{copy.exerciseKicker}</p>
            <p className="font-bold">{copy.exerciseTitle}</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {copy.tiles.map((tile) => (
                <li key={tile} className="rounded-lg border border-tile bg-card px-2 py-1 text-sm font-medium">
                  {tile}
                </li>
              ))}
            </ul>
            <p className="mt-4 inline-flex h-10 items-center rounded-xl bg-teal-deep px-4 text-sm font-semibold text-on-dark">{copy.check}</p>
          </Mini>
        </div>
        <p className="font-hand text-3xl text-teal-deep lg:col-start-2">{copy.footnote}</p>
      </div>
    </section>
  );
}

function Mini({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <article className={`min-w-[240px] snap-center rounded-2xl border border-line bg-card p-4 shadow-[var(--shadow-lift)] transition duration-200 hover:translate-y-0 hover:rotate-0 ${className ?? ""}`}>
      {children}
    </article>
  );
}
