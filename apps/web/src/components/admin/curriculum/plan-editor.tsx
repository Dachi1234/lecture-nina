"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Icon, IconTile } from "@nina/ui";
import { IconButton } from "@/components/admin/curriculum/course-board";
import { LibraryPicker, type PickedMaterial } from "@/components/admin/library-picker";
import { LessonStateChip } from "@/components/admin/lesson-row";
import { send } from "@/lib/client";
import { nowMs } from "@/lib/time";
import { lessonWhen } from "@/lib/dates";
import { SECTION_LABELS, SECTION_ORDER, groupTone, materialIcon, materialLabel } from "@/lib/materials";

type Health = { status: string; hasDraft: boolean; ready: boolean; summaryKa: string };
type Item = { id?: string; materialId: string; section: string; noteKa: string | null; title: string; type: string; estMinutes: number | null; health: Health };

export type PlanDetail = {
  id: string;
  titleKa: string;
  titleEs: string | null;
  goalsKa: string[];
  teacherNotes: string | null;
  estMinutes: number | null;
  unit: { id: string; titleKa: string } | null;
  course: { id: string; title: string } | null;
  items: Item[];
  lessons: { id: string; title: string; date: string; published: boolean; audience: { kind: "group" | "student"; id: string; name: string } | null }[];
};

export type UnitOption = { id: string; label: string };

const field = "rounded-xl border-[1.5px] border-sand bg-card px-3 text-[15px] outline-none focus:border-teal-deep focus:ring-4 focus:ring-teal-soft";

export function HealthChip({ health }: { health: Health }) {
  if (health.status === "ARCHIVED") return <span className="rounded-lg bg-burgundy-soft px-2 py-1 text-xs font-semibold text-burgundy">არქივშია</span>;
  if (health.status !== "PUBLISHED")
    return <span className="rounded-lg bg-mustard-soft px-2 py-1 text-xs font-semibold text-mustard-ink">{health.ready ? "მზადაა, გამოსაქვეყნებელი" : `მონახაზი · ${health.summaryKa}`}</span>;
  if (health.hasDraft) return <span className="rounded-lg bg-teal-soft px-2 py-1 text-xs font-semibold text-teal-deep">ცვლილებები გამოუქვეყნებელია</span>;
  return null;
}

export function PlanEditor({ plan, units }: { plan: PlanDetail; units: UnitOption[] }) {
  const router = useRouter();
  const [items, setItems] = useState<Item[]>(plan.items);
  const [meta, setMeta] = useState({
    titleKa: plan.titleKa,
    titleEs: plan.titleEs ?? "",
    goals: plan.goalsKa.join("\n"),
    teacherNotes: plan.teacherNotes ?? "",
    estMinutes: plan.estMinutes ? String(plan.estMinutes) : "",
    unitId: plan.unit?.id ?? "",
  });
  const [metaDirty, setMetaDirty] = useState(false);
  const [picker, setPicker] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const returnTo = encodeURIComponent(`/admin/plans/${plan.id}`);

  const [syncedItems, setSyncedItems] = useState(plan.items);
  if (syncedItems !== plan.items) {
    setSyncedItems(plan.items);
    setItems(plan.items);
  }

  async function saveItems(next: Item[]) {
    setItems(next);
    setSaving(true);
    setError("");
    const result = await send("PUT", `/v1/admin/plans/${plan.id}/items`, { items: next.map(({ materialId, section, noteKa }) => ({ materialId, section, noteKa })) });
    setSaving(false);
    if (!result.ok) return setError(result.message);
    setMessage("შენახულია");
    router.refresh();
  }

  async function saveMeta() {
    setSaving(true);
    setError("");
    const result = await send("PATCH", `/v1/admin/plans/${plan.id}`, {
      titleKa: meta.titleKa,
      titleEs: meta.titleEs,
      goalsKa: meta.goals.split("\n"),
      teacherNotes: meta.teacherNotes,
      estMinutes: meta.estMinutes ? Number(meta.estMinutes) : null,
      unitId: meta.unitId || null,
    });
    setSaving(false);
    if (!result.ok) return setError(result.message);
    setMetaDirty(false);
    setMessage("შენახულია");
    router.refresh();
  }

  function update(patch: Partial<typeof meta>) {
    setMeta({ ...meta, ...patch });
    setMetaDirty(true);
    setMessage("");
  }

  function move(materialId: string, offset: number) {
    const section = items.find((item) => item.materialId === materialId)?.section;
    const inSection = items.filter((item) => item.section === section);
    const index = inSection.findIndex((item) => item.materialId === materialId);
    const target = index + offset;
    if (target < 0 || target >= inSection.length) return;
    const reordered = [...inSection];
    [reordered[index], reordered[target]] = [reordered[target]!, reordered[index]!];
    void saveItems(SECTION_ORDER.flatMap((name) => (name === section ? reordered : items.filter((item) => item.section === name))));
  }

  function add(section: string, picked: PickedMaterial[]) {
    const fresh = picked.map((material) => ({
      materialId: material.id,
      section,
      noteKa: null,
      title: material.title,
      type: material.type,
      estMinutes: material.estMinutes,
      health: { status: material.status, hasDraft: false, ready: material.status === "PUBLISHED", summaryKa: "" },
    }));
    void saveItems([...items, ...fresh]);
  }

  async function duplicate() {
    const result = await send<{ id: string }>("POST", `/v1/admin/plans/${plan.id}/duplicate`);
    if (!result.ok) return setError(result.message);
    router.push(`/admin/plans/${result.data.id}`);
  }

  async function remove() {
    if (!window.confirm("წავშალო ეს გეგმა? მასალები ბიბლიოთეკაში დარჩება.")) return;
    const result = await send("DELETE", `/v1/admin/plans/${plan.id}`);
    if (!result.ok) return setError(result.message);
    router.push(plan.course ? `/admin/curriculum/${plan.course.id}` : "/admin/curriculum");
  }

  const totalMinutes = items.reduce((sum, item) => sum + (item.section === "HOMEWORK" ? 0 : (item.estMinutes ?? 0)), 0);
  const problems = items.filter((item) => item.health.status !== "PUBLISHED").length;

  return (
    <div className="flex flex-col gap-5">
      <nav className="flex flex-wrap gap-1 text-sm text-ink-muted">
        <Link href="/admin/curriculum" className="font-semibold text-teal-deep">
          კურიკულუმი
        </Link>
        {plan.course ? (
          <>
            {" / "}
            <Link href={`/admin/curriculum/${plan.course.id}`} className="font-semibold text-teal-deep">
              {plan.course.title}
            </Link>
          </>
        ) : null}
        {plan.unit ? <span>/ {plan.unit.titleKa}</span> : null}
      </nav>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-3 rounded-2xl border-[1.5px] border-line bg-card p-5">
            <p className="text-sm font-semibold text-ink-muted">გაკვეთილის გეგმა</p>
            <input aria-label="სათაური" className={`${field} h-14 text-2xl font-bold`} value={meta.titleKa} onChange={(event) => update({ titleKa: event.target.value })} />
            <div className="grid gap-3 sm:grid-cols-[1fr_160px]">
              <input aria-label="ესპანური სათაური" placeholder="სათაური ესპანურად (არასავალდებულო)" className={`${field} h-11`} value={meta.titleEs} onChange={(event) => update({ titleEs: event.target.value })} />
              <input aria-label="ხანგრძლივობა წუთებში" type="number" min={0} placeholder="წუთი" className={`${field} h-11`} value={meta.estMinutes} onChange={(event) => update({ estMinutes: event.target.value })} />
            </div>
            <label className="flex flex-col gap-1 text-sm font-semibold">
              თავი
              <select className={`${field} h-11 font-normal`} value={meta.unitId} onChange={(event) => update({ unitId: event.target.value })}>
                <option value="">ცალკე გეგმა (თავის გარეშე)</option>
                {units.map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    {unit.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-sm font-semibold">
              მიზნები <span className="font-normal text-ink-muted">— თითო ხაზზე ერთი. მოსწავლე ხედავს გაკვეთილის გვერდზე.</span>
              <textarea className={`${field} min-h-24 py-2 font-normal`} value={meta.goals} onChange={(event) => update({ goals: event.target.value })} placeholder={"მაგ. მისალმება და დამშვიდობება\nსახელის თქმა"} />
            </label>
            <label className="flex flex-col gap-1 text-sm font-semibold">
              ჩემი შენიშვნები <span className="font-normal text-ink-muted">— მხოლოდ შენ ხედავ.</span>
              <textarea className={`${field} min-h-20 py-2 font-normal`} value={meta.teacherNotes} onChange={(event) => update({ teacherNotes: event.target.value })} />
            </label>
            <div className="flex items-center gap-3">
              <Button size="s" disabled={!metaDirty} loading={saving && metaDirty} onClick={() => void saveMeta()}>
                შენახვა
              </Button>
              {message && !metaDirty ? <span className="text-sm text-sage-ink">{message}</span> : null}
            </div>
          </div>

          {error ? <p className="rounded-xl bg-burgundy-soft px-4 py-3 text-sm font-medium text-burgundy">{error}</p> : null}
          {problems ? (
            <p className="rounded-xl bg-mustard-soft px-4 py-3 text-sm text-mustard-ink">
              {problems} მასალა ჯერ გამოუქვეყნებელია — მოსწავლე მათ ვერ დაინახავს, სანამ ბიბლიოთეკაში არ გამოაქვეყნებ.
            </p>
          ) : null}

          {SECTION_ORDER.map((section) => {
            const rows = items.filter((item) => item.section === section);
            return (
              <section key={section} className="overflow-hidden rounded-2xl border-[1.5px] border-line bg-card">
                <header className="flex flex-wrap items-center justify-between gap-2 border-b border-line-soft bg-paper-deep px-4 py-2.5">
                  <h2 className="font-bold">
                    {SECTION_LABELS[section]} <span className="font-normal text-ink-muted">· {rows.length}</span>
                  </h2>
                  <div className="flex gap-1">
                    <Button size="s" variant="text" onClick={() => setPicker(section)}>
                      + ბიბლიოთეკიდან
                    </Button>
                    <Link href={`/admin/library/new?planId=${plan.id}&section=${section}`} className="inline-flex h-10 items-center rounded-[10px] px-3 text-sm font-semibold text-teal-deep hover:bg-teal-softer">
                      + ახალი მასალა
                    </Link>
                  </div>
                </header>
                {rows.length === 0 ? <p className="px-4 py-3 text-sm text-ink-muted">ცარიელია.</p> : null}
                <ol>
                  {rows.map((item, index) => {
                    const tone = groupTone(item.type);
                    return (
                      <li key={item.materialId} className="flex flex-wrap items-center gap-2 border-b border-line-soft px-3 py-2.5 last:border-b-0">
                        <IconTile name={materialIcon(item.type)} className={`size-10 ${tone.tile} ${tone.ink}`} />
                        <div className="min-w-48 flex-1">
                          <Link href={`/admin/library/${item.materialId}?returnTo=${returnTo}`} className="font-semibold hover:text-teal-deep">
                            {item.title}
                          </Link>
                          <p className="text-[13px] text-ink-muted">{materialLabel(item.type, item.estMinutes)}</p>
                          <input
                            aria-label="შენიშვნა მოსწავლისთვის"
                            placeholder="შენიშვნა მოსწავლისთვის (არასავალდებულო)"
                            defaultValue={item.noteKa ?? ""}
                            onBlur={(event) => {
                              const value = event.target.value.trim() || null;
                              if (value !== item.noteKa) void saveItems(items.map((row) => (row.materialId === item.materialId ? { ...row, noteKa: value } : row)));
                            }}
                            className="mt-1 h-9 w-full max-w-md rounded-lg border border-line bg-paper px-2 text-sm outline-none focus:border-teal-deep"
                          />
                        </div>
                        <HealthChip health={item.health} />
                        <select
                          aria-label="სექცია"
                          value={item.section}
                          onChange={(event) => void saveItems(items.map((row) => (row.materialId === item.materialId ? { ...row, section: event.target.value } : row)))}
                          className="h-11 rounded-xl border-[1.5px] border-sand bg-card px-2 text-sm"
                        >
                          {SECTION_ORDER.map((name) => (
                            <option key={name} value={name}>
                              {SECTION_LABELS[name]}
                            </option>
                          ))}
                        </select>
                        <IconButton label="ზემოთ" disabled={index === 0} onClick={() => move(item.materialId, -1)}>
                          <Icon name="chevron" width={16} height={16} className="-rotate-90" />
                        </IconButton>
                        <IconButton label="ქვემოთ" disabled={index === rows.length - 1} onClick={() => move(item.materialId, 1)}>
                          <Icon name="chevron" width={16} height={16} className="rotate-90" />
                        </IconButton>
                        <IconButton label="ამოღება გეგმიდან" onClick={() => void saveItems(items.filter((row) => row.materialId !== item.materialId))}>
                          <Icon name="close" width={16} height={16} />
                        </IconButton>
                      </li>
                    );
                  })}
                </ol>
              </section>
            );
          })}
          <p className="text-sm text-ink-muted">
            {items.length} მასალა · გაკვეთილზე ~{totalMinutes} წთ{saving ? " · ინახება…" : ""}
          </p>
        </div>

        <aside className="flex flex-col gap-4 xl:sticky xl:top-6">
          <div className="flex flex-col gap-3 rounded-2xl border-[1.5px] border-line bg-card p-5">
            <p className="font-bold">გაკვეთილები ამ გეგმით · {plan.lessons.length}</p>
            <Link href={`/admin/lessons/new?planId=${plan.id}`} className="inline-flex h-11 items-center justify-center rounded-xl bg-teal-deep px-4 text-sm font-semibold text-on-dark transition hover:-translate-y-0.5 hover:bg-teal-hover">
              + გაკვეთილის დაგეგმვა
            </Link>
            {plan.lessons.map((lesson) => (
              <Link key={lesson.id} href={`/admin/lessons/${lesson.id}`} className="flex flex-col gap-1 rounded-xl border border-line-soft px-3 py-2 hover:bg-paper-deep">
                <span className="text-sm font-semibold">{lesson.audience?.name ?? "—"}</span>
                <span className="flex items-center justify-between gap-2 text-[13px] text-ink-muted">
                  {lessonWhen(lesson.date)}
                  <LessonStateChip published={lesson.published} past={new Date(lesson.date).getTime() < nowMs()} />
                </span>
              </Link>
            ))}
            <p className="text-[13px] leading-relaxed text-ink-muted">გეგმაში ცვლილება ყველა ამ გაკვეთილზე აისახება. ერთი მოსწავლისთვის ცვლილება გააკეთე თავად გაკვეთილში.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="s" variant="outline" onClick={() => void duplicate()}>
              ასლის გაკეთება
            </Button>
            {plan.lessons.length === 0 ? (
              <Button size="s" variant="text" onClick={() => void remove()}>
                წაშლა
              </Button>
            ) : null}
          </div>
        </aside>
      </div>

      <LibraryPicker
        open={picker !== null}
        onClose={() => setPicker(null)}
        sectionLabel={picker ? SECTION_LABELS[picker]! : ""}
        exclude={items.map((item) => item.materialId)}
        onPick={(picked) => picker && add(picker, picked)}
      />
    </div>
  );
}
