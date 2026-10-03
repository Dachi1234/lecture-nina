"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button, ChoiceChip } from "@nina/ui";
import { fromLocalInput, send } from "@/lib/client";

type Plan = { id: string; titleKa: string; items: number; courseTitle: string | null; unitTitle: string | null };

const field = "h-12 w-full rounded-xl border-[1.5px] border-sand bg-card px-3 text-[15px] outline-none focus:border-teal-deep focus:ring-4 focus:ring-teal-soft";

function defaultDate() {
  const date = new Date(Date.now() + 4 * 60 * 60 * 1000 + 24 * 60 * 60 * 1000);
  return `${date.toISOString().slice(0, 10)}T19:00`;
}

export function LessonCreate({
  students,
  groups,
  plans,
  initial,
}: {
  students: { id: string; name: string }[];
  groups: { id: string; name: string; size: number }[];
  plans: Plan[];
  initial: { planId?: string; studentId?: string; groupId?: string };
}) {
  const router = useRouter();
  const [kind, setKind] = useState<"student" | "group">(initial.groupId ? "group" : "student");
  const [studentId, setStudentId] = useState(initial.studentId ?? "");
  const [groupId, setGroupId] = useState(initial.groupId ?? "");
  const [usePlan, setUsePlan] = useState(true);
  const [planId, setPlanId] = useState(initial.planId ?? "");
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(defaultDate);
  const [duration, setDuration] = useState(75);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const grouped = useMemo(() => {
    const map = new Map<string, Plan[]>();
    for (const plan of plans) {
      const key = plan.courseTitle && plan.unitTitle ? `${plan.courseTitle} · ${plan.unitTitle}` : "ცალკე გეგმები";
      map.set(key, [...(map.get(key) ?? []), plan]);
    }
    return [...map.entries()];
  }, [plans]);

  const audienceId = kind === "student" ? studentId : groupId;
  const ready = Boolean(audienceId && date && (usePlan ? planId : title.trim()));

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!ready) return;
    setBusy(true);
    setError("");
    const result = await send<{ id: string }>("POST", "/v1/admin/lessons", {
      ...(kind === "student" ? { studentId } : { groupId }),
      planId: usePlan ? planId : null,
      title: usePlan ? null : title,
      date: fromLocalInput(date),
      durationMin: duration,
    });
    setBusy(false);
    if (!result.ok) return setError(result.message);
    router.push(`/admin/lessons/${result.data.id}`);
  }

  return (
    <form onSubmit={(event) => void submit(event)} className="flex flex-col gap-5 rounded-2xl border-[1.5px] border-line bg-card p-5 sm:p-6">
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-semibold">ვისთვის</legend>
        <div className="flex gap-2">
          <ChoiceChip pressed={kind === "student"} onClick={() => setKind("student")}>
            ინდივიდუალური
          </ChoiceChip>
          <ChoiceChip pressed={kind === "group"} onClick={() => setKind("group")}>
            ჯგუფი
          </ChoiceChip>
        </div>
        {kind === "student" ? (
          <select aria-label="მოსწავლე" className={field} value={studentId} onChange={(event) => setStudentId(event.target.value)}>
            <option value="">აირჩიე მოსწავლე</option>
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.name}
              </option>
            ))}
          </select>
        ) : (
          <select aria-label="ჯგუფი" className={field} value={groupId} onChange={(event) => setGroupId(event.target.value)}>
            <option value="">აირჩიე ჯგუფი</option>
            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name} · {group.size} მოსწავლე
              </option>
            ))}
          </select>
        )}
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-semibold">რა</legend>
        <div className="flex gap-2">
          <ChoiceChip pressed={usePlan} onClick={() => setUsePlan(true)}>
            გეგმიდან
          </ChoiceChip>
          <ChoiceChip pressed={!usePlan} onClick={() => setUsePlan(false)}>
            ცარიელი გაკვეთილი
          </ChoiceChip>
        </div>
        {usePlan ? (
          <select aria-label="გეგმა" className={field} value={planId} onChange={(event) => setPlanId(event.target.value)}>
            <option value="">აირჩიე გეგმა</option>
            {grouped.map(([label, rows]) => (
              <optgroup key={label} label={label}>
                {rows.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.titleKa} · {plan.items} მასალა
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        ) : (
          <input aria-label="სათაური" placeholder="გაკვეთილის სათაური" className={field} value={title} onChange={(event) => setTitle(event.target.value)} />
        )}
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-[1fr_180px]">
        <label className="flex flex-col gap-1.5 text-sm font-semibold">
          როდის (თბილისის დროით)
          <input type="datetime-local" className={field} value={date} onChange={(event) => setDate(event.target.value)} required />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-semibold">
          ხანგრძლივობა (წთ)
          <input type="number" min={15} step={15} className={field} value={duration} onChange={(event) => setDuration(Number(event.target.value) || 75)} />
        </label>
      </div>

      {error ? <p className="text-sm font-medium text-burgundy">{error}</p> : null}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ink-muted">გაკვეთილი შეიქმნება მონახაზად — მოსწავლე ჯერ ვერ დაინახავს.</p>
        <Button type="submit" loading={busy} disabled={!ready}>
          შექმნა →
        </Button>
      </div>
    </form>
  );
}
