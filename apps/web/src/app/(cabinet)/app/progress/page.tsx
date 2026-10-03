import Link from "next/link";
import { apiGet, redirectAdminHome } from "@/lib/api";
import { shortDate } from "@/lib/dates";
import { withLesson } from "@/lib/materials";

type State = "done" | "current" | "upcoming";

type Progress = {
  syllabus: {
    course: { id: string; title: string; level: string | null };
    done: number;
    total: number;
    units: { id: string; order: number; titleKa: string; titleEs: string | null; state: State; done: number; total: number; plans: { id: string; titleKa: string; titleEs: string | null; state: "done" | "scheduled" | "upcoming" }[] }[];
  }[];
  stats: { lessons: number; lessonsDone: number; items: number; itemsDone: number; exercises: number; averageScore: number | null };
  attempts: { id: string; materialId: string; lessonId: string | null; title: string; score: number | null; correct: number | null; total: number | null; finishedAt: string }[];
};

const dot: Record<State, string> = {
  done: "bg-sage border-sage",
  current: "bg-mustard border-mustard",
  upcoming: "bg-card border-sand",
};

export default async function ProgressPage() {
  await redirectAdminHome();
  const data = await apiGet<Progress>("/v1/me/progress");
  const stats = [
    { label: "გავლილი გაკვეთილი", value: `${data.stats.lessonsDone} / ${data.stats.lessons}` },
    { label: "დასრულებული მასალა", value: `${data.stats.itemsDone} / ${data.stats.items}` },
    { label: "სავარჯიშოს საშუალო", value: data.stats.averageScore === null ? "—" : `${Math.round(data.stats.averageScore * 100)}%` },
  ];

  return (
    <div className="flex flex-col gap-7">
      <div>
        <p className="font-hand text-[32px] leading-none text-burgundy">Poco a Poco</p>
        <h1 className="text-[34px] font-bold">პროგრესი</h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-2xl border-[1.5px] border-line bg-card p-5">
            <p className="text-sm text-ink-muted">{stat.label}</p>
            <p className="mt-1 text-3xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      {data.syllabus.map((course) => (
        <section key={course.course.id} className="flex flex-col gap-4 rounded-2xl border-[1.5px] border-line bg-card p-6 lg:p-7">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h2 className="text-2xl font-bold">{course.course.title}</h2>
            <span className="text-sm text-ink-muted">
              {course.done} / {course.total} თემა
            </span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-line">
            <div className="h-full rounded-full bg-sage" style={{ width: `${course.total ? Math.round((course.done / course.total) * 100) : 0}%` }} />
          </div>
          <ol className="flex flex-col">
            {course.units.map((unit) => (
              <li key={unit.id} className="relative flex gap-4 pb-6 last:pb-0">
                <span aria-hidden className="absolute top-7 bottom-0 left-[13px] w-0.5 bg-line" />
                <span aria-hidden className={`relative mt-1 size-7 shrink-0 rounded-full border-[2.5px] ${dot[unit.state]}`} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-x-3">
                    <h3 className={`text-lg font-bold ${unit.state === "upcoming" ? "text-ink-muted" : ""}`}>{unit.titleKa}</h3>
                    {unit.titleEs ? <span className="text-sm text-ink-muted">{unit.titleEs}</span> : null}
                    <span className="text-sm text-ink-muted">
                      {unit.done} / {unit.total}
                    </span>
                    {unit.state === "current" ? <span className="rounded-lg bg-mustard-soft px-2 py-0.5 text-[13px] font-semibold text-mustard-ink">ახლა აქ ხარ</span> : null}
                  </div>
                  {unit.state !== "upcoming" ? (
                    <ul className="mt-2 flex flex-wrap gap-2">
                      {unit.plans.map((plan) => (
                        <li key={plan.id} className={`rounded-lg px-2.5 py-1 text-[13px] ${plan.state === "done" ? "bg-sage-soft text-sage-ink" : "bg-paper-deep text-ink-muted"}`}>
                          {plan.state === "done" ? "✓ " : ""}
                          {plan.titleKa}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </li>
            ))}
          </ol>
        </section>
      ))}

      {data.attempts.length > 0 ? (
        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-bold">ბოლო სავარჯიშოები</h2>
          <ul className="overflow-hidden rounded-2xl border-[1.5px] border-line bg-card">
            {data.attempts.map((attempt) => (
              <li key={attempt.id} className="border-b border-line-soft last:border-b-0">
                <Link href={withLesson(`/app/m/${attempt.materialId}`, attempt.lessonId)} className="flex items-center justify-between gap-3 px-5 py-3.5 hover:bg-paper-deep">
                  <span className="min-w-0 flex-1 truncate font-semibold">{attempt.title}</span>
                  <span className="text-sm text-ink-muted">{shortDate(attempt.finishedAt)}</span>
                  <span className="w-16 text-right font-bold text-teal-deep">
                    {attempt.correct !== null && attempt.total ? `${attempt.correct}/${attempt.total}` : attempt.score !== null ? `${Math.round(attempt.score * 100)}%` : "✓"}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
