"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Icon } from "@nina/ui";
import { send } from "@/lib/client";

type PlanRow = { id: string; order: number; titleKa: string; titleEs: string | null; items: number; homework: number; unpublished: number; lessons: number };
type UnitRow = { id: string; order: number; titleKa: string; titleEs: string | null; summaryKa: string | null; plans: PlanRow[] };

export type CourseDetail = {
  id: string;
  title: string;
  level: string | null;
  descriptionKa: string | null;
  isArchived: boolean;
  students: { id: string; name: string }[];
  groups: { id: string; name: string }[];
  units: UnitRow[];
};

const inputClass = "h-11 rounded-xl border-[1.5px] border-sand bg-card px-3 text-[15px] outline-none focus:border-teal-deep focus:ring-4 focus:ring-teal-soft";

export function CourseBoard({ course }: { course: CourseDetail }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [meta, setMeta] = useState({ title: course.title, level: course.level ?? "", descriptionKa: course.descriptionKa ?? "" });
  const [newUnit, setNewUnit] = useState("");
  const totalPlans = course.units.reduce((sum, unit) => sum + unit.plans.length, 0);
  const emptyPlans = course.units.reduce((sum, unit) => sum + unit.plans.filter((plan) => plan.items === 0).length, 0);

  async function run(key: string, method: "POST" | "PATCH" | "DELETE", path: string, body?: unknown) {
    setBusy(key);
    setError("");
    const result = await send<{ id?: string }>(method, path, body);
    setBusy(null);
    if (!result.ok) {
      setError(result.message);
      return null;
    }
    router.refresh();
    return result.data;
  }

  async function saveMeta(event: FormEvent) {
    event.preventDefault();
    if (await run("meta", "PATCH", `/v1/admin/courses/${course.id}`, meta)) setEditing(false);
  }

  async function addUnit(event: FormEvent) {
    event.preventDefault();
    if (!newUnit.trim()) return;
    if (await run("unit", "POST", `/v1/admin/courses/${course.id}/units`, { titleKa: newUnit })) setNewUnit("");
  }

  return (
    <div className="flex flex-col gap-6">
      <Link href="/admin/curriculum" className="text-sm font-semibold text-teal-deep">
        ← კურიკულუმი
      </Link>
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="flex flex-col gap-5">
          {editing ? (
            <form onSubmit={(event) => void saveMeta(event)} className="flex flex-col gap-3 rounded-2xl border-[1.5px] border-line bg-card p-5">
              <input aria-label="კურსის სახელი" className={`${inputClass} text-xl font-bold`} value={meta.title} onChange={(event) => setMeta({ ...meta, title: event.target.value })} />
              <input aria-label="დონე" placeholder="დონე, მაგ. A1" className={inputClass} value={meta.level} onChange={(event) => setMeta({ ...meta, level: event.target.value })} />
              <textarea aria-label="აღწერა" placeholder="მოკლე აღწერა" className={`${inputClass} h-24 py-2`} value={meta.descriptionKa} onChange={(event) => setMeta({ ...meta, descriptionKa: event.target.value })} />
              <div className="flex gap-2">
                <Button type="submit" size="s" loading={busy === "meta"}>
                  შენახვა
                </Button>
                <Button size="s" variant="outline" onClick={() => setEditing(false)}>
                  გაუქმება
                </Button>
              </div>
            </form>
          ) : (
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl font-bold">{course.title}</h1>
                  {course.level ? <span className="rounded-full bg-teal-soft px-3 py-1 text-sm font-semibold text-teal-deep">{course.level}</span> : null}
                  {course.isArchived ? <span className="rounded-full bg-sand-soft px-3 py-1 text-sm font-semibold">არქივი</span> : null}
                </div>
                {course.descriptionKa ? <p className="mt-2 max-w-2xl text-ink-muted">{course.descriptionKa}</p> : null}
                <p className="mt-2 text-sm text-ink-muted">
                  {course.units.length} თავი · {totalPlans} გეგმა{emptyPlans ? ` · ${emptyPlans} ცარიელი გეგმა` : ""}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="s" variant="outline" onClick={() => setEditing(true)}>
                  რედაქტირება
                </Button>
                <Button size="s" variant="text" onClick={() => void run("archive", "PATCH", `/v1/admin/courses/${course.id}`, { isArchived: !course.isArchived })}>
                  {course.isArchived ? "არქივიდან დაბრუნება" : "არქივში"}
                </Button>
              </div>
            </div>
          )}

          {error ? <p className="rounded-xl bg-burgundy-soft px-4 py-3 text-sm font-medium text-burgundy">{error}</p> : null}

          {course.units.map((unit, index) => (
            <UnitCard key={unit.id} unit={unit} first={index === 0} last={index === course.units.length - 1} busy={busy} run={run} />
          ))}

          <form onSubmit={(event) => void addUnit(event)} className="flex flex-wrap gap-2 rounded-2xl border-[1.5px] border-dashed border-sand p-4">
            <input aria-label="ახალი თავის სახელი" placeholder="ახალი თავი, მაგ. 11 · მოგზაურობა" className={`${inputClass} min-w-64 flex-1`} value={newUnit} onChange={(event) => setNewUnit(event.target.value)} />
            <Button type="submit" size="s" loading={busy === "unit"} disabled={!newUnit.trim()} className="h-11">
              + თავის დამატება
            </Button>
          </form>
        </div>

        <aside className="flex flex-col gap-4 xl:sticky xl:top-6">
          <div className="flex flex-col gap-2 rounded-2xl border-[1.5px] border-line bg-card p-5">
            <p className="font-bold">მოსწავლეები · {course.students.length}</p>
            {course.students.length === 0 ? <p className="text-sm text-ink-muted">ჯერ არავინ.</p> : null}
            {course.students.map((student) => (
              <Link key={student.id} href={`/admin/students/${student.id}`} className="text-[15px] font-semibold text-teal-deep">
                {student.name}
              </Link>
            ))}
          </div>
          <div className="flex flex-col gap-2 rounded-2xl border-[1.5px] border-line bg-card p-5">
            <p className="font-bold">ჯგუფები · {course.groups.length}</p>
            {course.groups.length === 0 ? <p className="text-sm text-ink-muted">ჯერ არცერთი.</p> : null}
            {course.groups.map((group) => (
              <Link key={group.id} href={`/admin/groups/${group.id}`} className="text-[15px] font-semibold text-teal-deep">
                {group.name}
              </Link>
            ))}
          </div>
          <p className="px-1 text-sm leading-relaxed text-ink-muted">მოსწავლე თავის პროგრესს ამ თავების მიხედვით ხედავს. „გავლილია“ გეგმა, რომლის გაკვეთილიც ჩატარდა ან გაიგზავნა.</p>
        </aside>
      </div>
    </div>
  );
}

function UnitCard({
  unit,
  first,
  last,
  busy,
  run,
}: {
  unit: UnitRow;
  first: boolean;
  last: boolean;
  busy: string | null;
  run: (key: string, method: "POST" | "PATCH" | "DELETE", path: string, body?: unknown) => Promise<{ id?: string } | null>;
}) {
  const router = useRouter();
  const [renaming, setRenaming] = useState(false);
  const [title, setTitle] = useState(unit.titleKa);
  const [titleEs, setTitleEs] = useState(unit.titleEs ?? "");
  const [newPlan, setNewPlan] = useState("");

  async function rename(event: FormEvent) {
    event.preventDefault();
    if (await run(`rename-${unit.id}`, "PATCH", `/v1/admin/units/${unit.id}`, { titleKa: title, titleEs })) setRenaming(false);
  }

  async function addPlan(event: FormEvent) {
    event.preventDefault();
    if (!newPlan.trim()) return;
    const created = await run(`plan-${unit.id}`, "POST", "/v1/admin/plans", { titleKa: newPlan, unitId: unit.id });
    if (created?.id) router.push(`/admin/plans/${created.id}`);
  }

  return (
    <section className="overflow-hidden rounded-2xl border-[1.5px] border-line bg-card">
      <header className="flex flex-wrap items-center gap-3 border-b border-line-soft bg-paper-deep px-4 py-3">
        {renaming ? (
          <form onSubmit={(event) => void rename(event)} className="flex flex-1 flex-wrap gap-2">
            <input aria-label="თავის სახელი" className={`${inputClass} min-w-56 flex-1`} value={title} onChange={(event) => setTitle(event.target.value)} />
            <input aria-label="ესპანური სახელი" placeholder="ესპანურად" className={`${inputClass} w-48`} value={titleEs} onChange={(event) => setTitleEs(event.target.value)} />
            <Button type="submit" size="s" className="h-11" loading={busy === `rename-${unit.id}`}>
              შენახვა
            </Button>
          </form>
        ) : (
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-bold">{unit.titleKa}</h2>
            {unit.titleEs ? <p className="text-sm text-ink-muted">{unit.titleEs}</p> : null}
          </div>
        )}
        <div className="flex items-center gap-1">
          <IconButton label="ზემოთ" disabled={first} onClick={() => void run(`move-${unit.id}`, "POST", `/v1/admin/units/${unit.id}/move`, { direction: "up" })}>
            <Icon name="chevron" width={18} height={18} className="-rotate-90" />
          </IconButton>
          <IconButton label="ქვემოთ" disabled={last} onClick={() => void run(`move-${unit.id}`, "POST", `/v1/admin/units/${unit.id}/move`, { direction: "down" })}>
            <Icon name="chevron" width={18} height={18} className="rotate-90" />
          </IconButton>
          <Button size="s" variant="text" onClick={() => setRenaming((value) => !value)}>
            {renaming ? "გაუქმება" : "სახელის შეცვლა"}
          </Button>
          {unit.plans.length === 0 ? (
            <Button size="s" variant="text" onClick={() => void run(`delete-${unit.id}`, "DELETE", `/v1/admin/units/${unit.id}`)}>
              წაშლა
            </Button>
          ) : null}
        </div>
      </header>
      <ol>
        {unit.plans.map((plan, index) => (
          <li key={plan.id} className="flex items-center gap-2 border-b border-line-soft px-4 py-2.5 last:border-b-0">
            <span className="w-7 shrink-0 text-sm text-ink-muted">{index + 1}.</span>
            <Link href={`/admin/plans/${plan.id}`} className="min-w-0 flex-1 rounded-lg py-1 hover:text-teal-deep">
              <span className="block font-semibold">{plan.titleKa}</span>
              <span className="block text-[13px] text-ink-muted">
                {plan.items === 0 ? "ცარიელი — დაამატე მასალები" : `${plan.items} მასალა${plan.homework ? ` · ${plan.homework} საშინაო` : ""}`}
                {plan.lessons ? ` · ${plan.lessons} გაკვეთილი` : ""}
              </span>
            </Link>
            {plan.unpublished ? <span className="hidden rounded-lg bg-mustard-soft px-2 py-1 text-xs font-semibold text-mustard-ink sm:inline">{plan.unpublished} მონახაზი</span> : null}
            {plan.items === 0 ? <span className="hidden rounded-lg bg-burgundy-soft px-2 py-1 text-xs font-semibold text-burgundy sm:inline">ცარიელი</span> : null}
            <IconButton label="ზემოთ" disabled={index === 0} onClick={() => void run(`pmove-${plan.id}`, "POST", `/v1/admin/plans/${plan.id}/move`, { direction: "up" })}>
              <Icon name="chevron" width={16} height={16} className="-rotate-90" />
            </IconButton>
            <IconButton label="ქვემოთ" disabled={index === unit.plans.length - 1} onClick={() => void run(`pmove-${plan.id}`, "POST", `/v1/admin/plans/${plan.id}/move`, { direction: "down" })}>
              <Icon name="chevron" width={16} height={16} className="rotate-90" />
            </IconButton>
          </li>
        ))}
      </ol>
      <form onSubmit={(event) => void addPlan(event)} className="flex flex-wrap gap-2 border-t border-line-soft px-4 py-3">
        <input aria-label="ახალი გეგმის სახელი" placeholder="ახალი გაკვეთილის გეგმა" className={`${inputClass} min-w-56 flex-1`} value={newPlan} onChange={(event) => setNewPlan(event.target.value)} />
        <Button type="submit" size="s" variant="outline" className="h-11" loading={busy === `plan-${unit.id}`} disabled={!newPlan.trim()}>
          + გეგმა
        </Button>
      </form>
    </section>
  );
}

export function IconButton({ label, disabled, onClick, children }: { label: string; disabled?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className="flex size-11 shrink-0 items-center justify-center rounded-xl text-ink-muted hover:bg-line-soft hover:text-ink disabled:opacity-30 disabled:hover:bg-transparent"
    >
      {children}
    </button>
  );
}
