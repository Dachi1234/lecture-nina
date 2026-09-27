import Link from "next/link";
import { StatusChip } from "@nina/ui";
import { apiGet, redirectAdminHome } from "@/lib/api";
import { lessonOverline, lessonWhen, shortDate } from "@/lib/dates";

type Home = {
  name: string;
  nameLatin: string | null;
  greetingForm: string;
  nextLessonAt: string | null;
  empty: boolean;
  continueLearning: {
    lessonId: string;
    number: number;
    title: string;
    date: string;
    counter: { completed: number; total: number };
    nextMaterial: { id: string; title: string } | null;
  } | null;
  homework: { materialId: string; title: string; dueAt: string | null; status: "NOT_STARTED" | "OPENED" | "COMPLETED" }[];
  note: { body: string; createdAt: string; material: { id: string; title: string } | null } | null;
  path: { id: string; titleKa: string; titleEs: string; done: number; total: number; state: "done" | "current" | "upcoming" }[];
};

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

  const left = home.homework.filter((item) => item.status !== "COMPLETED").length;
  const current = home.continueLearning;
  const ratio = current && current.counter.total > 0 ? Math.round((current.counter.completed / current.counter.total) * 100) : 0;

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

      <div className="grid gap-6 lg:grid-cols-[1.45fr_1fr]">
        <section className="flex flex-col gap-4 rounded-2xl border-[1.5px] border-line bg-card p-7">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">გააგრძელე სწავლა</h2>
            {current ? <StatusChip status={current.counter.completed === 0 ? "new" : "progress"} /> : null}
          </div>
          {current ? (
            <>
              <div className="flex items-center gap-5">
                <span className="flex size-24 shrink-0 items-center justify-center rounded-2xl bg-teal-soft text-4xl font-bold text-teal-deep">{current.number}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-semibold tracking-wide text-teal-deep">{lessonOverline(current.number, current.date)}</p>
                  <p className="text-2xl font-bold">{current.title}</p>
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
                  href={current.nextMaterial ? `/app/m/${current.nextMaterial.id}?lessonId=${current.lessonId}` : `/app/lessons/${current.lessonId}`}
                  className="inline-flex h-12 items-center rounded-xl bg-teal-deep px-6 text-[15px] font-semibold text-on-dark"
                >
                  გაგრძელება
                </Link>
              </div>
            </>
          ) : (
            <p className="text-lg text-ink-muted">ყველა გაკვეთილი დასრულებულია.</p>
          )}
        </section>

        <section className="flex flex-col gap-3.5 rounded-2xl border-[1.5px] border-line bg-card p-7">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">საშინაო დავალება</h2>
            <span className="text-sm text-ink-muted">{left} დარჩა</span>
          </div>
          {home.homework.length === 0 ? <p className="text-ink-muted">საშინაო ჯერ არ გაქვს.</p> : null}
          {home.homework.map((item) => (
            <Link
              key={item.materialId}
              href={`/app/m/${item.materialId}`}
              className={`rounded-xl p-3.5 ${item.status === "COMPLETED" ? "bg-sage-soft" : item.status === "NOT_STARTED" ? "bg-burgundy-soft" : "border border-line bg-card"}`}
            >
              <p className={`font-bold ${item.status === "COMPLETED" ? "text-sage-ink line-through" : ""}`}>{item.title}</p>
              <p className={`text-[13px] font-semibold ${item.status === "COMPLETED" ? "text-sage-ink" : item.status === "NOT_STARTED" ? "text-burgundy" : "text-ink-muted"}`}>
                {item.status === "COMPLETED" ? "შესრულებული" : item.dueAt ? `ვადა: ${shortDate(item.dueAt)}` : "ვადის გარეშე"}
              </p>
            </Link>
          ))}
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.45fr]">
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
            {home.note.material ? (
              <Link href={`/app/m/${home.note.material.id}`} className="flex items-center gap-3 rounded-xl bg-card px-3.5 py-3">
                <StatusChip status="personal" />
                <span className="font-bold">{home.note.material.title}</span>
              </Link>
            ) : null}
          </section>
        ) : null}
        {home.path.length > 0 ? (
          <section className="flex flex-col gap-3.5 rounded-2xl border-[1.5px] border-line bg-card p-7">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="text-xl font-bold">
                <span className="font-hand text-3xl text-burgundy">Poco a Poco</span> · შენი გზა
              </h2>
              <Link href="/app/progress" className="text-sm font-semibold text-teal-deep">
                სრულად →
              </Link>
            </div>
            <ol className="flex gap-3 overflow-x-auto pb-1 text-sm text-ink-muted">
              {home.path.map((block) => (
                <li key={block.id} className={`shrink-0 ${block.state === "current" ? "font-bold text-ink" : ""}`}>
                  {block.titleEs || block.titleKa}
                  {block.state === "done" ? " ✓" : ""}
                  {block.state === "current" ? " · ახლა" : ""}
                </li>
              ))}
            </ol>
          </section>
        ) : null}
      </div>
    </div>
  );
}
