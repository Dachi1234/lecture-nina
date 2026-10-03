"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChoiceChip, Icon, Input } from "@nina/ui";
import { withLesson } from "@/lib/materials";

type Entry = { es: string; article?: string; ka?: string; en?: string; exampleEs?: string; exampleKa?: string; audio?: { assetId: string } };

export type VocabularyData = {
  sets: { materialId: string; title: string; lessonId: string; lessonNumber: number; unitTitle: string | null; entries: Entry[] }[];
  personal: { id: string; es: string; ka: string | null; en: string | null; noteKa: string | null }[];
  assets: Record<string, string>;
};

function matches(query: string, ...values: (string | null | undefined)[]) {
  return values.some((value) => value?.toLowerCase().includes(query));
}

export function VocabularyBrowser({ data }: { data: VocabularyData }) {
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<"all" | "personal">("all");
  const [hidden, setHidden] = useState(false);
  const needle = query.trim().toLowerCase();

  const sets = useMemo(
    () =>
      data.sets
        .map((set) => ({ ...set, entries: needle ? set.entries.filter((entry) => matches(needle, entry.es, entry.ka, entry.en)) : set.entries }))
        .filter((set) => set.entries.length > 0),
    [data.sets, needle],
  );
  const personal = data.personal.filter((word) => !needle || matches(needle, word.es, word.ka, word.en));
  const total = data.sets.reduce((sum, set) => sum + set.entries.length, 0) + data.personal.length;

  if (total === 0) {
    return <p className="rounded-2xl border-[1.5px] border-line bg-card p-6 text-ink-muted">სიტყვები აქ გამოჩნდება, როცა გაკვეთილში ლექსიკა იქნება.</p>;
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="sm:w-80">
          <Input id="vocab-search" type="search" placeholder="მოძებნე სიტყვა" aria-label="მოძებნე სიტყვა" value={query} onChange={(event) => setQuery(event.target.value)} />
        </div>
        <div className="flex flex-wrap gap-2">
          <ChoiceChip pressed={mode === "all"} onClick={() => setMode("all")}>
            ყველა · {total}
          </ChoiceChip>
          <ChoiceChip pressed={mode === "personal"} onClick={() => setMode("personal")}>
            ჩემი სიტყვები · {data.personal.length}
          </ChoiceChip>
          <ChoiceChip pressed={hidden} onClick={() => setHidden((value) => !value)}>
            დამალე თარგმანი
          </ChoiceChip>
        </div>
      </div>

      {personal.length > 0 ? (
        <section className="flex flex-col gap-2.5">
          <h2 className="text-xl font-bold">ნინამ შენთვის დაამატა</h2>
          <ul className="overflow-hidden rounded-2xl border-[1.5px] border-line bg-card">
            {personal.map((word) => (
              <li key={word.id} className="flex flex-wrap items-baseline gap-x-4 gap-y-1 border-b border-line-soft px-5 py-3.5 last:border-b-0">
                <span className="text-lg font-bold">{word.es}</span>
                <Translation hidden={hidden} text={[word.ka, word.en].filter(Boolean).join(" · ")} />
                {word.noteKa ? <span className="w-full text-sm text-ink-muted">{word.noteKa}</span> : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {mode === "all"
        ? sets.map((set) => (
            <section key={set.materialId} className="flex flex-col gap-2.5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-xl font-bold">{set.title}</h2>
                <Link href={withLesson(`/app/m/${set.materialId}`, set.lessonId)} className="text-sm font-semibold text-teal-deep">
                  გაკვეთილი {set.lessonNumber} →
                </Link>
              </div>
              <ul className="overflow-hidden rounded-2xl border-[1.5px] border-line bg-card">
                {set.entries.map((entry, index) => {
                  const audio = entry.audio ? data.assets[entry.audio.assetId] : undefined;
                  return (
                    <li key={`${entry.es}-${index}`} className="flex items-center gap-3 border-b border-line-soft px-5 py-3 last:border-b-0">
                      {audio ? (
                        <button
                          type="button"
                          aria-label={`მოუსმინე: ${entry.es}`}
                          onClick={() => void new Audio(audio).play()}
                          className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-teal-soft text-teal-deep transition hover:bg-teal-deep hover:text-on-dark"
                        >
                          <Icon name="audio" width={20} height={20} />
                        </button>
                      ) : (
                        <span className="size-11 shrink-0" aria-hidden />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-lg font-bold">
                          {entry.article ? <span className="font-medium text-ink-muted">{entry.article} </span> : null}
                          {entry.es}
                        </p>
                        {entry.exampleEs ? <p className="text-sm text-ink-muted italic">{entry.exampleEs}</p> : null}
                      </div>
                      <Translation hidden={hidden} text={[entry.ka, entry.en].filter(Boolean).join(" · ")} />
                    </li>
                  );
                })}
              </ul>
            </section>
          ))
        : null}

      {needle && sets.length === 0 && personal.length === 0 ? <p className="text-ink-muted">ვერაფერი მოიძებნა.</p> : null}
    </div>
  );
}

function Translation({ hidden, text }: { hidden: boolean; text: string }) {
  const [shown, setShown] = useState(false);
  if (!text) return null;
  if (hidden && !shown) {
    return (
      <button type="button" onClick={() => setShown(true)} className="h-11 rounded-xl border-[1.5px] border-dashed border-sand px-3 text-sm text-ink-muted">
        ნახე თარგმანი
      </button>
    );
  }
  return <span className="text-base text-ink">{text}</span>;
}
