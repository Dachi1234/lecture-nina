"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Icon, IconTile, StatusChip, StatusRing } from "@nina/ui";
import { IconButton } from "@/components/admin/curriculum/course-board";
import { HealthChip } from "@/components/admin/curriculum/plan-editor";
import { LibraryPicker, type PickedMaterial } from "@/components/admin/library-picker";
import { fromLocalInput, send, toLocalInput } from "@/lib/client";
import { lessonWhen } from "@/lib/dates";
import { SECTION_LABELS, SECTION_ORDER, groupTone, materialIcon, materialLabel, ringFor } from "@/lib/materials";

type Health = { status: string; hasDraft: boolean; ready: boolean; summaryKa: string };
type Status = "NOT_STARTED" | "OPENED" | "COMPLETED";

type Item = {
  key: string;
  source: "plan" | "extra";
  planItemId: string | null;
  materialId: string;
  section: string;
  noteKa: string | null;
  planNoteKa: string | null;
  hidden: boolean;
  held: boolean;
  title: string;
  type: string;
  estMinutes: number | null;
  health: Health;
};

export type LessonDetail = {
  id: string;
  title: string | null;
  displayTitle: string;
  date: string;
  durationMin: number | null;
  noteKa: string | null;
  privateNote: string | null;
  homeworkDueAt: string | null;
  publishedAt: string | null;
  heldAt: string | null;
  isGift: boolean;
  audience: { kind: "group" | "student"; id: string; name: string } | null;
  plan: { id: string; titleKa: string; goalsKa: string[]; teacherNotes: string | null; unit: { id: string; titleKa: string; course: { id: string; title: string } } | null } | null;
  items: Item[];
  progress: { studentId: string; name: string; status: "NEW" | "IN_PROGRESS" | "DONE"; counter: { completed: number; total: number }; items: Record<string, { status: Status; bestScore: number | null }> }[];
};

type Plan = { id: string; titleKa: string; courseTitle: string | null; unitTitle: string | null };

const field = "rounded-xl border-[1.5px] border-sand bg-card px-3 text-[15px] outline-none focus:border-teal-deep focus:ring-4 focus:ring-teal-soft";
const chip = { NEW: "new", IN_PROGRESS: "progress", DONE: "done" } as const;

export function LessonEditor({ lesson, plans }: { lesson: LessonDetail; plans: Plan[] }) {
  const router = useRouter();
  const [items, setItems] = useState<Item[]>(lesson.items);
  const [meta, setMeta] = useState({
    title: lesson.title ?? "",
    date: toLocalInput(lesson.date),
    durationMin: lesson.durationMin ? String(lesson.durationMin) : "",
    homeworkDueAt: toLocalInput(lesson.homeworkDueAt),
    noteKa: lesson.noteKa ?? "",
    privateNote: lesson.privateNote ?? "",
  });
  const [dirty, setDirty] = useState(false);
  const [picker, setPicker] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const published = lesson.publishedAt !== null;
  const held = lesson.heldAt !== null;
  const returnTo = encodeURIComponent(`/admin/lessons/${lesson.id}`);
  const audienceHref = lesson.audience ? `/admin/${lesson.audience.kind === "group" ? "groups" : "students"}/${lesson.audience.id}` : null;

  const [syncedItems, setSyncedItems] = useState(lesson.items);
  if (syncedItems !== lesson.items) {
    setSyncedItems(lesson.items);
    setItems(lesson.items);
  }

  async function call(key: string, method: "POST" | "PATCH" | "PUT" | "DELETE", path: string, body?: unknown) {
    setBusy(key);
    setError("");
    setMessage("");
    const result = await send<{ id?: string }>(method, path, body);
    setBusy(null);
    if (!result.ok) {
      setError(result.message);
      return null;
    }
    router.refresh();
    return result.data;
  }

  async function saveItems(next: Item[]) {
    setItems(next);
    await call("items", "PUT", `/v1/admin/lessons/${lesson.id}/items`, {
      tweaks: next
        .filter((item) => item.source === "plan")
        .map((item) => ({ planItemId: item.planItemId, hidden: item.hidden, held: item.held, noteKa: item.noteKa !== item.planNoteKa ? item.noteKa : null })),
      extras: next.filter((item) => item.source === "extra").map((item) => ({ materialId: item.materialId, section: item.section, held: item.held, noteKa: item.noteKa })),
    });
  }

  function patchItem(key: string, patch: Partial<Item>) {
    void saveItems(items.map((item) => (item.key === key ? { ...item, ...patch } : item)));
  }

  function addExtras(section: string, picked: PickedMaterial[]) {
    const fresh: Item[] = picked.map((material) => ({
      key: `new-${material.id}`,
      source: "extra",
      planItemId: null,
      materialId: material.id,
      section,
      noteKa: null,
      planNoteKa: null,
      hidden: false,
      held: false,
      title: material.title,
      type: material.type,
      estMinutes: material.estMinutes,
      health: { status: material.status, hasDraft: false, ready: material.status === "PUBLISHED", summaryKa: "" },
    }));
    void saveItems([...items, ...fresh]);
  }

  function update(patch: Partial<typeof meta>) {
    setMeta({ ...meta, ...patch });
    setDirty(true);
    setMessage("");
  }

  async function saveMeta() {
    const ok = await call("meta", "PATCH", `/v1/admin/lessons/${lesson.id}`, {
      title: meta.title,
      date: fromLocalInput(meta.date),
      durationMin: meta.durationMin ? Number(meta.durationMin) : null,
      homeworkDueAt: fromLocalInput(meta.homeworkDueAt),
      noteKa: meta.noteKa,
      privateNote: meta.privateNote,
    });
    if (ok) {
      setDirty(false);
      setMessage("შენახულია");
    }
  }

  async function changePlan(planId: string) {
    if (!window.confirm("გეგმის შეცვლისას ამ გაკვეთილის ცვლილებები გეგმის მასალებზე გაუქმდება (დამატებითი მასალები დარჩება). გავაგრძელო?")) return;
    await call("plan", "PATCH", `/v1/admin/lessons/${lesson.id}`, { planId: planId || null, ...(planId ? {} : { title: meta.title || lesson.displayTitle }) });
  }

  async function saveAsPlan() {
    const created = await call("save-plan", "POST", `/v1/admin/lessons/${lesson.id}/save-as-plan`, { titleKa: lesson.displayTitle });
    if (created?.id) router.push(`/admin/plans/${created.id}`);
  }

  async function remove() {
    if (!window.confirm("წავშალო ეს გაკვეთილი?")) return;
    const ok = await call("delete", "DELETE", `/v1/admin/lessons/${lesson.id}`);
    if (ok) router.push(audienceHref ?? "/admin/lessons");
  }

  const visibleCount = items.filter((item) => !item.hidden && !item.held && item.health.status === "PUBLISHED").length;
  const drafts = items.filter((item) => !item.hidden && item.health.status !== "PUBLISHED").length;
  const homework = items.some((item) => item.section === "HOMEWORK" && !item.hidden);

  return (
    <div className="flex flex-col gap-5">
      <nav className="flex flex-wrap gap-1 text-sm text-ink-muted">
        <Link href="/admin/lessons" className="font-semibold text-teal-deep">
          გაკვეთილები
        </Link>
        {lesson.audience && audienceHref ? (
          <>
            {" / "}
            <Link href={audienceHref} className="font-semibold text-teal-deep">
              {lesson.audience.kind === "group" ? `ჯგუფი · ${lesson.audience.name}` : lesson.audience.name}
            </Link>
          </>
        ) : null}
      </nav>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex flex-col gap-5">
          <header className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {held ? <span className="rounded-lg bg-sage-soft px-2.5 py-1 text-[13px] font-semibold text-sage-ink">ჩატარდა</span> : null}
              {published ? (
                <span className="rounded-lg bg-teal-soft px-2.5 py-1 text-[13px] font-semibold text-teal-deep">გაგზავნილია მოსწავლეს</span>
              ) : (
                <span className="rounded-lg bg-mustard-soft px-2.5 py-1 text-[13px] font-semibold text-mustard-ink">მონახაზი — მოსწავლე ვერ ხედავს</span>
              )}
              <span className="text-sm text-ink-muted">{lessonWhen(lesson.date)}</span>
            </div>
            <h1 className="text-3xl font-bold">{lesson.displayTitle}</h1>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="text-ink-muted">გეგმა:</span>
              {lesson.plan ? (
                <Link href={`/admin/plans/${lesson.plan.id}`} className="font-semibold text-teal-deep">
                  {lesson.plan.unit ? `${lesson.plan.unit.titleKa} · ` : ""}
                  {lesson.plan.titleKa}
                </Link>
              ) : (
                <span className="font-semibold">გეგმის გარეშე</span>
              )}
              <select aria-label="გეგმის შეცვლა" value="" onChange={(event) => event.target.value && void changePlan(event.target.value === "none" ? "" : event.target.value)} className="h-10 rounded-lg border border-line bg-card px-2 text-sm">
                <option value="">შეცვლა…</option>
                {lesson.plan ? <option value="none">გეგმის მოხსნა</option> : null}
                {plans
                  .filter((plan) => plan.id !== lesson.plan?.id)
                  .map((plan) => (
                    <option key={plan.id} value={plan.id}>
                      {plan.unitTitle ? `${plan.unitTitle} · ` : ""}
                      {plan.titleKa}
                    </option>
                  ))}
              </select>
            </div>
          </header>

          <div className="flex flex-wrap items-center gap-3 rounded-2xl border-[1.5px] border-line bg-card p-4">
            <Button variant={published ? "outline" : "burgundy"} loading={busy === "publish"} onClick={() => void call("publish", "POST", `/v1/admin/lessons/${lesson.id}/publish`, { published: !published })}>
              {published ? "გაგზავნის გაუქმება" : "გაგზავნა მოსწავლეს"}
            </Button>
            <Button variant="outline" loading={busy === "held"} onClick={() => void call("held", "PATCH", `/v1/admin/lessons/${lesson.id}`, { held: !held })}>
              {held ? "ჩატარების მოხსნა" : "✓ ჩატარდა"}
            </Button>
            <p className="min-w-48 flex-1 text-sm text-ink-muted">
              {published ? `მოსწავლე ხედავს ${visibleCount} მასალას.` : `გაგზავნის შემდეგ მოსწავლე დაინახავს ${visibleCount} მასალას.`}
              {drafts ? ` ${drafts} მონახაზს ვერ დაინახავს.` : ""}
            </p>
          </div>

          {error ? <p className="rounded-xl bg-burgundy-soft px-4 py-3 text-sm font-medium text-burgundy">{error}</p> : null}

          {SECTION_ORDER.map((section) => {
            const rows = items.filter((item) => item.section === section);
            return (
              <section key={section} className="overflow-hidden rounded-2xl border-[1.5px] border-line bg-card">
                <header className="flex flex-wrap items-center justify-between gap-2 border-b border-line-soft bg-paper-deep px-4 py-2.5">
                  <h2 className="font-bold">
                    {SECTION_LABELS[section]} <span className="font-normal text-ink-muted">· {rows.filter((row) => !row.hidden).length}</span>
                  </h2>
                  <div className="flex gap-1">
                    <Button size="s" variant="text" onClick={() => setPicker(section)}>
                      + ბიბლიოთეკიდან
                    </Button>
                    <Link href={`/admin/library/new?lessonId=${lesson.id}&section=${section}`} className="inline-flex h-10 items-center rounded-[10px] px-3 text-sm font-semibold text-teal-deep hover:bg-teal-softer">
                      + ახალი
                    </Link>
                  </div>
                </header>
                {rows.length === 0 ? <p className="px-4 py-3 text-sm text-ink-muted">ცარიელია.</p> : null}
                <ol>
                  {rows.map((item) => {
                    const tone = groupTone(item.type);
                    return (
                      <li key={item.key} className={`flex flex-wrap items-center gap-2 border-b border-line-soft px-3 py-2.5 last:border-b-0 ${item.hidden ? "bg-paper-deep/70" : ""}`}>
                        <IconTile name={materialIcon(item.type)} className={`size-10 ${tone.tile} ${tone.ink} ${item.hidden ? "opacity-50" : ""}`} />
                        <div className="min-w-48 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <Link href={`/admin/library/${item.materialId}?returnTo=${returnTo}`} className={`font-semibold hover:text-teal-deep ${item.hidden ? "text-ink-muted line-through" : ""}`}>
                              {item.title}
                            </Link>
                            {item.source === "extra" ? <span className="rounded-md bg-sand-soft px-1.5 py-0.5 text-xs font-semibold">მხოლოდ აქ</span> : null}
                            {item.held && !item.hidden ? <span className="rounded-md bg-mustard-soft px-1.5 py-0.5 text-xs font-semibold text-mustard-ink">ჯერ არ ჩანს</span> : null}
                          </div>
                          <p className="text-[13px] text-ink-muted">{materialLabel(item.type, item.estMinutes)}</p>
                          {!item.hidden ? (
                            <input
                              aria-label="შენიშვნა მოსწავლისთვის"
                              placeholder="შენიშვნა მოსწავლისთვის"
                              defaultValue={item.noteKa ?? ""}
                              onBlur={(event) => {
                                const value = event.target.value.trim() || null;
                                if (value !== item.noteKa) patchItem(item.key, { noteKa: value });
                              }}
                              className="mt-1 h-9 w-full max-w-md rounded-lg border border-line bg-paper px-2 text-sm outline-none focus:border-teal-deep"
                            />
                          ) : null}
                        </div>
                        <HealthChip health={item.health} />
                        {!item.hidden ? (
                          <Button size="s" variant="text" onClick={() => patchItem(item.key, { held: !item.held })}>
                            {item.held ? "გამოჩენა" : "მოგვიანებით"}
                          </Button>
                        ) : null}
                        {item.source === "plan" ? (
                          <Button size="s" variant="text" onClick={() => patchItem(item.key, { hidden: !item.hidden })}>
                            {item.hidden ? "დაბრუნება" : "ამოღება"}
                          </Button>
                        ) : (
                          <IconButton label="ამოღება" onClick={() => void saveItems(items.filter((row) => row.key !== item.key))}>
                            <Icon name="close" width={16} height={16} />
                          </IconButton>
                        )}
                      </li>
                    );
                  })}
                </ol>
              </section>
            );
          })}
          <p className="text-[13px] leading-relaxed text-ink-muted">
            „ამოღება“ მალავს გეგმის მასალას მხოლოდ ამ გაკვეთილში. „მოგვიანებით“ — მასალა აქ რჩება, მაგრამ მოსწავლე ჯერ ვერ ხედავს. გეგმის შეცვლა (ახალი მასალა გეგმაში) ავტომატურად ჩანს აქაც.
          </p>

          <section className="flex flex-col gap-3 rounded-2xl border-[1.5px] border-line bg-card p-5">
            <h2 className="text-lg font-bold">დეტალები</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-1 text-sm font-semibold">
                თარიღი და დრო
                <input type="datetime-local" className={`${field} h-11 font-normal`} value={meta.date} onChange={(event) => update({ date: event.target.value })} />
              </label>
              <label className="flex flex-col gap-1 text-sm font-semibold">
                ხანგრძლივობა (წთ)
                <input type="number" min={15} step={15} className={`${field} h-11 font-normal`} value={meta.durationMin} onChange={(event) => update({ durationMin: event.target.value })} />
              </label>
              <label className="flex flex-col gap-1 text-sm font-semibold">
                სათაური <span className="font-normal text-ink-muted">(ცარიელი = გეგმის სათაური)</span>
                <input className={`${field} h-11 font-normal`} value={meta.title} placeholder={lesson.plan?.titleKa} onChange={(event) => update({ title: event.target.value })} />
              </label>
              <label className="flex flex-col gap-1 text-sm font-semibold">
                საშინაოს ვადა {homework ? null : <span className="font-normal text-ink-muted">(საშინაო არ არის)</span>}
                <input type="datetime-local" className={`${field} h-11 font-normal`} value={meta.homeworkDueAt} onChange={(event) => update({ homeworkDueAt: event.target.value })} />
              </label>
            </div>
            <label className="flex flex-col gap-1 text-sm font-semibold">
              შენიშვნა მოსწავლისთვის <span className="font-normal text-ink-muted">— ჩანს გაკვეთილის გვერდზე</span>
              <textarea className={`${field} min-h-20 py-2 font-normal`} value={meta.noteKa} onChange={(event) => update({ noteKa: event.target.value })} />
            </label>
            <label className="flex flex-col gap-1 text-sm font-semibold">
              ჩემი პირადი შენიშვნა <span className="font-normal text-ink-muted">— მხოლოდ შენ</span>
              <textarea className={`${field} min-h-20 py-2 font-normal`} value={meta.privateNote} onChange={(event) => update({ privateNote: event.target.value })} />
            </label>
            <div className="flex items-center gap-3">
              <Button size="s" disabled={!dirty} loading={busy === "meta"} onClick={() => void saveMeta()}>
                შენახვა
              </Button>
              {message ? <span className="text-sm text-sage-ink">{message}</span> : null}
            </div>
          </section>
        </div>

        <aside className="flex flex-col gap-4 xl:sticky xl:top-6">
          <div className="flex flex-col gap-3 rounded-2xl border-[1.5px] border-line bg-card p-5">
            <p className="font-bold">პროგრესი</p>
            {lesson.progress.length === 0 ? <p className="text-sm text-ink-muted">ჯგუფში ჯერ არავინაა.</p> : null}
            {lesson.progress.map((row) => (
              <div key={row.studentId} className="flex flex-col gap-2 border-b border-line-soft pb-3 last:border-b-0 last:pb-0">
                <div className="flex items-center justify-between gap-2">
                  <Link href={`/admin/students/${row.studentId}`} className="font-semibold text-teal-deep">
                    {row.name}
                  </Link>
                  <StatusChip status={chip[row.status]} />
                </div>
                <div className="flex flex-wrap gap-1" aria-label={`${row.counter.completed} / ${row.counter.total} დასრულებული`}>
                  {items
                    .filter((item) => row.items[item.materialId])
                    .map((item) => (
                      <span key={item.key} title={item.title}>
                        <StatusRing status={ringFor(row.items[item.materialId]!.status)} />
                      </span>
                    ))}
                </div>
                <p className="text-[13px] text-ink-muted">
                  {row.counter.completed} / {row.counter.total} დასრულებული
                </p>
              </div>
            ))}
          </div>
          {lesson.plan && (lesson.plan.goalsKa.length > 0 || lesson.plan.teacherNotes) ? (
            <div className="flex flex-col gap-2 rounded-2xl border-[1.5px] border-line bg-card p-5">
              <p className="font-bold">გეგმიდან</p>
              {lesson.plan.goalsKa.length ? (
                <ul className="list-disc pl-5 text-sm leading-relaxed">
                  {lesson.plan.goalsKa.map((goal) => (
                    <li key={goal}>{goal}</li>
                  ))}
                </ul>
              ) : null}
              {lesson.plan.teacherNotes ? <p className="rounded-lg bg-paper-deep p-3 text-sm leading-relaxed whitespace-pre-line">{lesson.plan.teacherNotes}</p> : null}
            </div>
          ) : null}
          <div className="flex flex-wrap gap-2">
            {!lesson.plan ? (
              <Button size="s" variant="outline" loading={busy === "save-plan"} onClick={() => void saveAsPlan()}>
                გეგმად შენახვა
              </Button>
            ) : null}
            <Button size="s" variant="text" loading={busy === "delete"} onClick={() => void remove()}>
              წაშლა
            </Button>
          </div>
        </aside>
      </div>

      <LibraryPicker
        open={picker !== null}
        onClose={() => setPicker(null)}
        sectionLabel={picker ? SECTION_LABELS[picker]! : ""}
        exclude={items.map((item) => item.materialId)}
        onPick={(picked) => picker && addExtras(picker, picked)}
      />
    </div>
  );
}
