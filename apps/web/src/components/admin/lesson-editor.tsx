"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@nina/ui";
import { groupTone, materialIcon, materialLabel } from "@/lib/materials";

type Health = { status: string; hasDraft: boolean; filled: boolean };

type Item = {
  materialId: string;
  title: string;
  type: string;
  kind: string;
  groupLabel: string;
  dueAt: string;
  readyForStudent: boolean;
  health: Health | null;
};

type SearchResult = { id: string; title: string; type: string; usage: number; status: string; ready: boolean; summaryKa: string };

type Lesson = {
  id: string;
  studentId: string;
  studentName: string;
  number: number;
  title: string;
  date: string;
  noteFromNina: string | null;
  readyForStudent: boolean;
  isGift: boolean;
  topics: { id: string; number: number; titleKa: string }[];
  items: { materialId: string; title: string; type: string; status: string; hasDraft: boolean; filled: boolean; kind: string; groupLabel: string | null; dueAt: string | null; readyForStudent: boolean }[];
};

type Topic = { id: string; number: number; titleKa: string };

const kinds = [
  ["LESSON_MATERIAL", "გაკვეთილის მასალა"],
  ["HOMEWORK", "საშინაო"],
  ["REVIEW", "გამეორება"],
  ["PERSONAL", "პირადი"],
] as const;

export function LessonEditor({ lesson, topics }: { lesson: Lesson; topics: Topic[] }) {
  const router = useRouter();
  const [title, setTitle] = useState(lesson.title);
  const [date, setDate] = useState(toLocal(lesson.date));
  const [note, setNote] = useState(lesson.noteFromNina ?? "");
  const [gift, setGift] = useState(lesson.isGift);
  const [ready, setReady] = useState(lesson.readyForStudent);
  const [topicIds, setTopicIds] = useState(lesson.topics.map((topic) => topic.id));
  const [items, setItems] = useState<Item[]>(
    lesson.items.map((item) => ({
      materialId: item.materialId,
      title: item.title,
      type: item.type,
      kind: item.kind,
      groupLabel: item.groupLabel ?? "",
      dueAt: item.dueAt ? toLocal(item.dueAt) : "",
      readyForStudent: item.readyForStudent,
      health: { status: item.status, hasDraft: item.hasDraft, filled: item.filled },
    })),
  );
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const used = useMemo(() => new Set(items.map((item) => item.materialId)), [items]);
  const problems = items.filter((item) => item.health && (!item.health.filled || item.health.status !== "PUBLISHED")).length;
  const returnTo = encodeURIComponent(`/admin/students/${lesson.studentId}/lessons/${lesson.id}`);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void (async () => {
        const response = await fetch(`/v1/admin/materials?q=${encodeURIComponent(query.trim())}`, { credentials: "include" }).catch(() => null);
        if (!response?.ok) return;
        const body = (await response.json()) as { items: { id: string; title: string; type: string; status: string; usage: unknown[]; readiness: { ready: boolean; summaryKa: string } }[] };
        setResults(body.items.slice(0, 15).map((item) => ({ id: item.id, title: item.title, type: item.type, status: item.status, usage: item.usage.length, ready: item.readiness.ready, summaryKa: item.readiness.summaryKa })));
      })();
    }, 250);
    return () => window.clearTimeout(timer);
  }, [query]);

  async function createNew() {
    if (await save()) router.push(`/admin/library/new?lessonId=${lesson.id}`);
  }

  function move(index: number, direction: -1 | 1) {
    const next = index + direction;
    if (next < 0 || next >= items.length) return;
    const copy = [...items];
    const current = copy[index];
    const other = copy[next];
    if (!current || !other) return;
    copy[index] = other;
    copy[next] = current;
    setItems(copy);
  }

  async function save() {
    setError("");
    setMessage("");
    const patch = await fetch(`/v1/admin/lessons/${lesson.id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, date: new Date(date).toISOString(), noteFromNina: note, isGift: gift, topicIds }),
    });
    const put = await fetch(`/v1/admin/lessons/${lesson.id}/items`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: items.map((item) => ({
          materialId: item.materialId,
          kind: item.kind,
          groupLabel: item.groupLabel || null,
          dueAt: item.dueAt ? new Date(item.dueAt).toISOString() : null,
          readyForStudent: item.readyForStudent,
        })),
      }),
    });
    const readyResponse = await fetch(`/v1/admin/lessons/${lesson.id}/ready`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ready }),
    });
    if (!patch.ok || !put.ok || !readyResponse.ok) {
      setError("ვერ შეინახა.");
      return false;
    }
    setMessage("შენახულია.");
    router.refresh();
    return true;
  }

  async function saveTemplate() {
    const response = await fetch(`/v1/admin/lessons/${lesson.id}/template`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    if (!response.ok) setError("შაბლონი ვერ შეინახა.");
    else setMessage("შაბლონი შეინახა.");
  }

  return (
    <section className="flex flex-col gap-4">
      <div>
        <Link href={`/admin/students/${lesson.studentId}?tab=lessons`} className="text-sm font-semibold text-teal-deep">{lesson.studentName}</Link>
        <h1 className="text-3xl font-bold">გაკვეთილი {lesson.number}</h1>
      </div>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="flex flex-col gap-3">
          <div className="grid gap-3 rounded-2xl border-[1.5px] border-line bg-card p-4 md:grid-cols-2">
            <label className="text-sm font-semibold">სათაური<input value={title} onChange={(event) => setTitle(event.target.value)} className="mt-1 h-11 w-full rounded-xl border-[1.5px] border-sand px-3 font-medium" /></label>
            <label className="text-sm font-semibold">თარიღი<input type="datetime-local" value={date} onChange={(event) => setDate(event.target.value)} className="mt-1 h-11 w-full rounded-xl border-[1.5px] border-sand px-3 font-medium" /></label>
            <label className="text-sm font-semibold md:col-span-2">შენიშვნა მოსწავლისთვის<textarea value={note} onChange={(event) => setNote(event.target.value)} rows={2} className="mt-1 w-full rounded-xl border-[1.5px] border-sand px-3 py-2 font-medium" /></label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={gift} onChange={(event) => setGift(event.target.checked)} /> საჩუქარი გაკვეთილი</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={ready} onChange={(event) => setReady(event.target.checked)} /> მოსწავლეს უჩანს</label>
            <div className="md:col-span-2">
              <p className="text-sm font-semibold">თემები</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {topics.map((topic) => {
                  const on = topicIds.includes(topic.id);
                  return (
                    <button
                      key={topic.id}
                      type="button"
                      aria-pressed={on}
                      onClick={() => setTopicIds(on ? topicIds.filter((id) => id !== topic.id) : [...topicIds, topic.id])}
                      className={`rounded-full px-3 py-1 text-sm ${on ? "bg-teal-deep text-on-dark" : "bg-paper text-ink"}`}
                    >
                      {topic.number}. {topic.titleKa}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          {problems > 0 ? (
            <p className="rounded-xl bg-mustard-soft px-4 py-3 text-sm text-mustard-ink">
              {problems} მასალა ჯერ არ არის მზად (ცარიელია ან არ გამოქვეყნებულა). მოსწავლე ასეთ მასალაზე „ნინა ჯერ ამზადებს“-ს ნახავს.
            </p>
          ) : null}
          <ul className="flex flex-col gap-2">
            {items.map((item, index) => (
              <li key={item.materialId} className="rounded-2xl border-[1.5px] border-line bg-card p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-3">
                    <TypeIcon type={item.type} size="size-10" />
                    <div className="min-w-0">
                      <Link href={`/admin/library/${item.materialId}?returnTo=${returnTo}`} className="font-semibold text-teal-deep">{item.title}</Link>
                      <p className="flex flex-wrap items-center gap-2 text-sm text-ink-muted">
                        {materialLabel(item.type, null)}
                        {item.health && !item.health.filled ? <span className="rounded-full bg-burgundy-soft px-2 text-xs font-semibold text-burgundy">შესავსებია</span> : null}
                        {item.health?.status === "DRAFT" ? <span className="rounded-full bg-teal-soft px-2 text-xs font-semibold text-teal-deep">არ გამოქვეყნებულა</span> : null}
                        {item.health?.hasDraft ? <span className="rounded-full bg-mustard-soft px-2 text-xs font-semibold text-mustard-ink">გამოუქვეყნებელი ცვლილებები</span> : null}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button type="button" aria-label="ზემოთ" className="h-10 w-10 rounded-xl border border-sand" onClick={() => move(index, -1)}>↑</button>
                    <button type="button" aria-label="ქვემოთ" className="h-10 w-10 rounded-xl border border-sand" onClick={() => move(index, 1)}>↓</button>
                    <button type="button" className="h-10 rounded-xl px-3 text-sm text-burgundy" onClick={() => setItems(items.filter((_, itemIndex) => itemIndex !== index))}>ამოღება</button>
                  </div>
                </div>
                <div className="mt-2 grid gap-2 sm:grid-cols-3">
                  <select value={item.kind} onChange={(event) => setItems(items.map((row, rowIndex) => rowIndex === index ? { ...row, kind: event.target.value } : row))} className="h-11 rounded-xl border-[1.5px] border-sand px-2">
                    {kinds.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </select>
                  <input value={item.groupLabel} placeholder="ჯგუფი" onChange={(event) => setItems(items.map((row, rowIndex) => rowIndex === index ? { ...row, groupLabel: event.target.value } : row))} className="h-11 rounded-xl border-[1.5px] border-sand px-3" />
                  <input type="datetime-local" value={item.dueAt} onChange={(event) => setItems(items.map((row, rowIndex) => rowIndex === index ? { ...row, dueAt: event.target.value } : row))} className="h-11 rounded-xl border-[1.5px] border-sand px-3" />
                </div>
                <label className="mt-2 flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={item.readyForStudent} onChange={(event) => setItems(items.map((row, rowIndex) => rowIndex === index ? { ...row, readyForStudent: event.target.checked } : row))} />
                  მოსწავლეს უჩანს
                </label>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="h-11 rounded-xl bg-teal-deep px-4 font-semibold text-on-dark" onClick={() => void save()}>შენახვა</button>
            <button type="button" className="h-11 rounded-xl border-[1.5px] border-teal-deep px-4 font-semibold text-teal-deep" onClick={() => void saveTemplate()}>შაბლონად შენახვა</button>
          </div>
          {message ? <p className="text-sm text-sage-ink">{message}</p> : null}
          {error ? <p className="text-sm text-burgundy">{error}</p> : null}
        </div>
        <aside className="flex flex-col gap-3 self-start rounded-2xl border-[1.5px] border-line bg-card p-4 xl:sticky xl:top-6">
          <button type="button" onClick={() => void createNew()} className="flex h-12 items-center justify-center rounded-xl bg-teal-deep px-4 font-semibold text-on-dark transition hover:-translate-y-0.5 hover:bg-teal-hover">
            + ახალი მასალა ამ გაკვეთილში
          </button>
          <p className="text-xs text-ink-muted">ჯერ შეინახება გაკვეთილი, მერე გაიხსნება ოსტატი.</p>
          <h2 className="mt-2 font-bold">ან აირჩიე ბიბლიოთეკიდან</h2>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ძებნა სათაურით" aria-label="ბიბლიოთეკაში ძებნა" className="h-11 w-full rounded-xl border-[1.5px] border-sand px-3" />
          <ul className="flex max-h-[60vh] flex-col gap-1 overflow-y-auto">
            {results.map((item) => (
              <li key={item.id} className="flex items-center gap-2 rounded-xl p-1.5 text-sm hover:bg-paper">
                <TypeIcon type={item.type} size="size-9" />
                <span className="min-w-0 flex-1">
                  <span className="line-clamp-2 font-semibold">{item.title}</span>
                  <span className={`block text-xs ${item.ready ? "text-ink-muted" : "text-burgundy"}`}>
                    {materialLabel(item.type, null)} · {item.summaryKa}{item.usage ? ` · ${item.usage}× გამოყენებული` : ""}
                  </span>
                </span>
                <button
                  type="button"
                  disabled={used.has(item.id)}
                  aria-label={used.has(item.id) ? `${item.title}: უკვე გაკვეთილშია` : `${item.title}: დამატება`}
                  className="flex size-11 shrink-0 items-center justify-center rounded-xl border-[1.5px] border-teal-deep text-lg font-semibold text-teal-deep transition hover:bg-teal-softer disabled:border-line disabled:text-ink-muted"
                  onClick={() => setItems([...items, { materialId: item.id, title: item.title, type: item.type, kind: "LESSON_MATERIAL", groupLabel: items.at(-1)?.groupLabel ?? "", dueAt: "", readyForStudent: false, health: { status: item.status, hasDraft: false, filled: item.ready } }])}
                >
                  {used.has(item.id) ? "✓" : "+"}
                </button>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </section>
  );
}

function TypeIcon({ type, size }: { type: string; size: string }) {
  const tone = groupTone(type);
  return (
    <span className={`inline-flex ${size} shrink-0 items-center justify-center rounded-xl ${tone.tile} ${tone.ink}`}>
      <Icon name={materialIcon(type)} width={18} height={18} />
    </span>
  );
}

function toLocal(iso: string) {
  const date = new Date(iso);
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 16);
}
