import Link from "next/link";
import { StatusChip } from "@nina/ui";
import { apiGet, redirectAdminHome } from "@/lib/api";
import { lessonOverline, lessonWhen, shortDate } from "@/lib/dates";
import { materialLabel, withLesson } from "@/lib/materials";

type LessonCard = {
  id: string;
  number: number;
  title: string;
  date: string;
  status: "NEW" | "IN_PROGRESS" | "DONE";
  counter: { completed: number; total: number };
  unit: { titleKa: string } | null;
  group: { name: string } | null;
};

type Home = {
  name: string;
  nameLatin: string | null;
  greetingForm: string;
  nextLessonAt: string | null;
  empty: boolean;
  continueLearning: (LessonCard & { nextMaterial: { id: string; title: string; type: string } | null }) | null;
  recent: LessonCard[];
  homework: { lessonId: string; lessonNumber: number; materialId: string; title: string; type: string; dueAt: string | null; status: "NOT_STARTED" | "OPENED" | "COMPLETED" }[];
  note: { body: string; createdAt: string } | null;
  syllabus: {
    course: { title: string };
    done: number;
    total: number;
    units: { id: string; titleKa: string; titleEs: string | null; state: "done" | "current" | "upcoming"; done: number; total: number }[];
  } | null;
};

const chip = { NEW: "new", IN_PROGRESS: "progress", DONE: "done" } as const;

export default async function HomePage() {
  await redirectAdminHome();
  const home = await apiGet<Home>("/v1/me/home");
  const hello = home.nameLatin ?? home.name;
  if (home.empty) {
    const welcome = home.greetingForm === "masculine" ? "¡Bienvenido!" : "¡Bienvenida!";
    return (
      <section className="mx-auto flex max-w-lg flex-col items-start gap-4 py-6">
        <img src="/illustrations/spots/spot-crosslegged.webp" alt="" className="h-52" />
        <p className="font-hand text-5xl leading-none text-burgundy">{welcome}</p>
        <h1 className="text-[21px] leading-snug font-bold">შენი პირველი გაკვეთილი ნინასთან მალე დაიწყება</h1>
        <p className="text-[15px] leading-relaxed text-ink-muted">გაკვეთილის შემდეგ მასალები აქ გამოჩნდება.</p>
        {home.nextLessonAt ? <p className="text-sm font-semibold text-teal-deep">{lessonWhen(home.nextLessonAt)}</p> : null}
      </section>
    );
  }

  const current = home.continueLearning;
  const ratio = current && current.counter.total > 0 ? Math.round((current.counter.completed / current.counter.total) * 100) : 0;
  const syllabus = home.syllabus;

  return (
    <div className="flex flex-col gap-7">
      <header className="flex items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold text-ink-muted">ჩემი ესპანური</p>
          <h1 className="font-hand text-5xl leading-none text-burgundy md:text-[60px]">¡Hola, {hello}!</h1>
          {home.nextLessonAt ? <p className="text-[17px] text-ink-muted">შემდეგი გაკვეთილი: {lessonWhen(home.nextLessonAt)}</p> : null}
        </div>
        <img src="/illustrations/spots/spot-crosslegged.webp" alt="" className="hidden h-[150px] md:block" />
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.45fr_1fr] [&>*]:min-w-0">
        <section className="flex flex-col gap-4 rounded-2xl border-[1.5px] border-line bg-card p-7">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">გააგრძელე სწავლა</h2>
            {current ? <StatusChip status={chip[current.status]} /> : null}
          </div>
          {current ? (
            <>
              <div className="flex items-center gap-5">
                <span className="flex size-24 shrink-0 items-center justify-center rounded-2xl bg-teal-soft text-4xl font-bold text-teal-deep">{current.number}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-semibold tracking-wide text-teal-deep">{lessonOverline(current.number, current.date)}</p>
                  <p className="text-2xl font-bold">{current.title}</p>
                  {current.unit || current.group ? (
                    <p className="text-sm text-ink-muted">{[current.unit?.titleKa, current.group?.name].filter(Boolean).join(" · ")}</p>
                  ) : null}
                  <div className="mt-2 flex items-center gap-3">
                    <div className="h-2 flex-1 overflow-hidden rounded bg-line">
                      <div className="h-full rounded bg-sage" style={{ width: `${ratio}%` }} />
                    </div>
                    <span className="text-sm text-ink-muted">
                      {current.counter.completed} / {current.counter.total} მასალა
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3.5 rounded-xl bg-paper-deep p-4">
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] text-ink-muted">შემდეგი მასალა</p>
                  <p className="font-bold">{current.nextMaterial?.title ?? current.title}</p>
                </div>
                <Link
                  href={current.nextMaterial ? withLesson(`/app/m/${current.nextMaterial.id}`, current.id) : `/app/lessons/${current.id}`}
                  className="inline-flex h-12 items-center rounded-xl bg-teal-deep px-6 text-[15px] font-semibold text-on-dark transition hover:-translate-y-0.5 hover:bg-teal-hover"
                >
                  გაგრძელება
                </Link>
              </div>
            </>
          ) : (
            <p className="text-lg text-ink-muted">ყველა გაკვეთილი დასრულებულია. ¡Muy bien!</p>
          )}
        </section>

        <section className="flex flex-col gap-3.5 rounded-2xl border-[1.5px] border-line bg-card p-7">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">საშინაო დავალება</h2>
            <span className="text-sm text-ink-muted">{home.homework.length} დარჩა</span>
          </div>
          {home.homework.length === 0 ? <p className="text-ink-muted">ყველაფერი შესრულებულია.</p> : null}
          {home.homework.slice(0, 5).map((item) => (
            <Link
              key={`${item.lessonId}:${item.materialId}`}
              href={withLesson(`/app/m/${item.materialId}`, item.lessonId)}
              className={`rounded-xl p-3.5 ${item.status === "NOT_STARTED" ? "bg-burgundy-soft" : "border border-line bg-card"}`}
            >
              <p className="font-bold">{item.title}</p>
              <p className={`text-[13px] font-semibold ${item.status === "NOT_STARTED" ? "text-burgundy" : "text-ink-muted"}`}>
                გაკვეთილი {item.lessonNumber} · {materialLabel(item.type, null)}
                {item.dueAt ? ` · ვადა: ${shortDate(item.dueAt)}` : ""}
              </p>
            </Link>
          ))}
          {home.homework.length > 5 ? (
            <Link href="/app/materials?section=HOMEWORK" className="text-sm font-semibold text-teal-deep">
              ყველა საშინაო →
            </Link>
          ) : null}
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.45fr] [&>*]:min-w-0">
        {home.note ? (
          <section className="flex flex-col gap-3.5 rounded-2xl border-[1.5px] border-teal-soft bg-teal-soft p-7">
            <div className="flex items-center gap-3">
              <img src="/illustrations/spots/spot-portrait.webp" alt="" className="size-14 rounded-full object-cover object-top" />
              <div>
                <h2 className="text-xl font-bold">ნინასგან</h2>
                <p className="text-[13px] text-ink-muted">{shortDate(home.note.createdAt)}</p>
              </div>
            </div>
            <p className="text-base leading-relaxed">„{home.note.body}“</p>
          </section>
        ) : (
          <section className="flex flex-col gap-3 rounded-2xl border-[1.5px] border-line bg-card p-7">
            <h2 className="text-xl font-bold">ბოლო გაკვეთილები</h2>
            {home.recent.map((lesson) => (
              <Link key={lesson.id} href={`/app/lessons/${lesson.id}`} className="flex items-center justify-between gap-3 rounded-xl px-1 py-1.5 hover:bg-paper-deep">
                <span className="font-semibold">
                  {lesson.number}. {lesson.title}
                </span>
                <span className="text-sm text-ink-muted">{shortDate(lesson.date)}</span>
              </Link>
            ))}
          </section>
        )}
        {syllabus ? (
          <section className="flex flex-col gap-4 rounded-2xl border-[1.5px] border-line bg-card p-7">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="text-xl font-bold">
                <span className="font-hand text-3xl text-burgundy">Poco a Poco</span> · {syllabus.course.title}
              </h2>
              <Link href="/app/progress" className="text-sm font-semibold text-teal-deep">
                სრულად →
              </Link>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-line">
              <div className="h-full rounded-full bg-sage" style={{ width: `${syllabus.total ? Math.round((syllabus.done / syllabus.total) * 100) : 0}%` }} />
            </div>
            <ol className="flex gap-2 overflow-x-auto pb-1">
              {syllabus.units.map((unit) => (
                <li
                  key={unit.id}
                  className={`shrink-0 rounded-xl px-3 py-2 text-sm ${unit.state === "done" ? "bg-sage-soft text-sage-ink" : unit.state === "current" ? "bg-teal-deep font-semibold text-on-dark" : "bg-paper-deep text-ink-muted"}`}
                >
                  {unit.titleKa}
                  {unit.state === "done" ? " ✓" : ""}
                </li>
              ))}
            </ol>
          </section>
        ) : null}
      </div>
    </div>
  );
}
