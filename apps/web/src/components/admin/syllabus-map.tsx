import Link from "next/link";

export type Syllabus = {
  units: {
    id: string;
    titleKa: string;
    state: "done" | "current" | "upcoming";
    done: number;
    total: number;
    plans: { id: string; titleKa: string; state: "done" | "scheduled" | "upcoming"; lessonIds: string[] }[];
  }[];
  done: number;
  total: number;
  nextPlan: { id: string; titleKa: string } | null;
};

const planTone = {
  done: "bg-sage-soft text-sage-ink",
  scheduled: "bg-teal-soft text-teal-deep",
  upcoming: "bg-paper-deep text-ink-muted",
} as const;

export function SyllabusMap({ title, syllabus, scheduleHref }: { title: string; syllabus: Syllabus; scheduleHref: (planId: string) => string }) {
  const percent = syllabus.total ? Math.round((syllabus.done / syllabus.total) * 100) : 0;
  return (
    <section className="flex flex-col gap-4 rounded-2xl border-[1.5px] border-line bg-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold">{title}</h2>
          <p className="text-sm text-ink-muted">
            {syllabus.done} / {syllabus.total} გეგმა გავლილია · {percent}%
          </p>
        </div>
        {syllabus.nextPlan ? (
          <Link href={scheduleHref(syllabus.nextPlan.id)} className="inline-flex h-11 items-center rounded-xl bg-teal-deep px-4 text-sm font-semibold text-on-dark transition hover:-translate-y-0.5 hover:bg-teal-hover">
            შემდეგი: {syllabus.nextPlan.titleKa} → დაგეგმვა
          </Link>
        ) : null}
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-line">
        <div className="h-full rounded-full bg-sage" style={{ width: `${percent}%` }} />
      </div>
      <ol className="flex flex-col gap-3">
        {syllabus.units.map((unit) => (
          <li key={unit.id} className="flex flex-col gap-1.5">
            <p className={`text-sm font-semibold ${unit.state === "upcoming" ? "text-ink-muted" : ""}`}>
              {unit.titleKa} · {unit.done}/{unit.total}
              {unit.state === "current" ? <span className="ml-2 rounded-md bg-mustard-soft px-1.5 py-0.5 text-xs text-mustard-ink">ახლა</span> : null}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {unit.plans.map((plan) => (
                <Link
                  key={plan.id}
                  href={plan.lessonIds[0] ? `/admin/lessons/${plan.lessonIds[0]}` : scheduleHref(plan.id)}
                  className={`rounded-lg px-2.5 py-1.5 text-[13px] hover:ring-2 hover:ring-teal-soft ${planTone[plan.state]}`}
                  title={plan.state === "done" ? "გავლილია" : plan.state === "scheduled" ? "დაგეგმილია" : "დასაგეგმი"}
                >
                  {plan.state === "done" ? "✓ " : ""}
                  {plan.titleKa}
                </Link>
              ))}
            </div>
          </li>
        ))}
      </ol>
      <p className="text-[13px] text-ink-muted">✓ — გავლილი · ფერადი — დაგეგმილი · ღია — ჯერ არა. დააჭირე გეგმას გაკვეთილის გასახსნელად ან დასაგეგმად.</p>
    </section>
  );
}
