import Link from "next/link";
import { MarkDone } from "@/components/cabinet/mark-done";
import { MaterialRow, StatusChip } from "@nina/ui";
import { apiGet, redirectAdminHome } from "@/lib/api";
import { lessonOverline, shortDate } from "@/lib/dates";
import { SECTION_LABELS, SECTION_ORDER, materialIcon, materialLabel, progressLabel, ringFor, withLesson } from "@/lib/materials";

type Item = {
  materialId: string;
  title: string;
  type: string;
  section: string;
  noteKa: string | null;
  estMinutes: number | null;
  steps: number | null;
  lastStep: number | null;
  status: "NOT_STARTED" | "OPENED" | "COMPLETED";
  canMarkDone: boolean;
};

type Lesson = {
  id: string;
  number: number;
  title: string;
  titleEs: string | null;
  date: string;
  note: string | null;
  goalsKa: string[];
  homeworkDueAt: string | null;
  status: "NEW" | "IN_PROGRESS" | "DONE";
  counter: { completed: number; total: number };
  unit: { titleKa: string } | null;
  group: { name: string } | null;
  items: Item[];
};

const chip = { NEW: "new", IN_PROGRESS: "progress", DONE: "done" } as const;

export default async function LessonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await redirectAdminHome();
  const lesson = await apiGet<Lesson>(`/v1/me/lessons/${id}`);
  const ratio = lesson.counter.total > 0 ? Math.round((lesson.counter.completed / lesson.counter.total) * 100) : 0;
  const next = lesson.items.find((item) => item.status !== "COMPLETED");
  const sections = SECTION_ORDER.map((section) => ({ section, items: lesson.items.filter((item) => item.section === section) })).filter((group) => group.items.length > 0);

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_280px]">
      <div className="flex flex-col gap-6">
        <nav className="text-sm text-ink-muted">
          <Link href="/app/lessons" className="font-semibold text-teal-deep">
            გაკვეთილები
          </Link>
          {" / "}გაკვეთილი {lesson.number}
        </nav>
        <div className="flex flex-col gap-2.5">
          <p className="text-sm font-semibold tracking-wide text-teal-deep">{lessonOverline(lesson.number, lesson.date)}</p>
          <h1 className="text-4xl leading-tight font-bold">{lesson.title}</h1>
          <div className="flex flex-wrap gap-2">
            {lesson.unit ? <span className="rounded-lg bg-sand-soft px-3 py-1.5 text-sm">{lesson.unit.titleKa}</span> : null}
            {lesson.group ? <span className="rounded-lg bg-sand-soft px-3 py-1.5 text-sm">{lesson.group.name}</span> : null}
          </div>
        </div>
        {lesson.note ? (
          <div className="flex gap-4 rounded-2xl bg-teal-soft p-5">
            <img src="/illustrations/spots/spot-portrait.webp" alt="" className="size-14 shrink-0 rounded-full object-cover object-top" />
            <div>
              <p className="font-bold">ნინას შენიშვნა</p>
              <p className="mt-1.5 text-base leading-relaxed">{lesson.note}</p>
            </div>
          </div>
        ) : null}
        {lesson.items.length === 0 ? <p className="rounded-2xl border-[1.5px] border-line bg-card p-6 text-ink-muted">მასალები ჯერ არ არის.</p> : null}
        {sections.map((group) => (
          <section key={group.section} className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-[22px] font-bold">{SECTION_LABELS[group.section]}</h2>
              {group.section === "HOMEWORK" && lesson.homeworkDueAt ? (
                <span className="rounded-lg bg-burgundy-soft px-2.5 py-1 text-[13px] font-semibold text-burgundy">ვადა: {shortDate(lesson.homeworkDueAt)}</span>
              ) : null}
            </div>
            <div className="overflow-hidden rounded-2xl border-[1.5px] border-line bg-card">
              {group.items.map((item) => {
                const markable = item.canMarkDone && item.status !== "COMPLETED";
                const href = withLesson(`/app/m/${item.materialId}`, lesson.id);
                return (
                  <div key={item.materialId} className={`relative ${next?.materialId === item.materialId ? "bg-paper-deep" : ""}`}>
                    <Link href={href} className="block">
                      <MaterialRow
                        icon={materialIcon(item.type)}
                        title={item.title}
                        meta={[
                          item.steps ? `სავარჯიშო · ${item.steps} ნაბიჯი${item.lastStep ? ` · ${Math.min(item.lastStep, item.steps)}/${item.steps}` : ""}` : materialLabel(item.type, item.estMinutes),
                          item.noteKa,
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                        ring={ringFor(item.status)}
                        action={
                          markable ? (
                            <span aria-hidden className="hidden w-52 sm:block" />
                          ) : (
                            <span className={`hidden text-[13px] font-semibold sm:inline ${item.status === "COMPLETED" ? "text-sage-ink" : "text-ink-muted"}`}>{progressLabel(item.status)}</span>
                          )
                        }
                      />
                    </Link>
                    {markable ? (
                      <div className="absolute top-1/2 right-14 hidden -translate-y-1/2 sm:block">
                        <MarkDone materialId={item.materialId} lessonId={lesson.id} />
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
      <aside className="flex flex-col gap-5 xl:pt-11">
        <div className="flex flex-col gap-3 rounded-2xl border-[1.5px] border-line bg-card p-5">
          <p className="font-bold">პროგრესი</p>
          <StatusChip status={chip[lesson.status]} />
          <div className="h-2.5 overflow-hidden rounded-full bg-line">
            <div className="h-full rounded-full bg-sage" style={{ width: `${ratio}%` }} />
          </div>
          <p className="text-sm text-ink-muted">
            {lesson.counter.completed} / {lesson.counter.total} მასალა · {ratio}%
          </p>
          {next ? (
            <Link href={withLesson(`/app/m/${next.materialId}`, lesson.id)} className="inline-flex h-11 items-center justify-center rounded-xl bg-teal-deep px-4 text-sm font-semibold text-on-dark">
              {lesson.counter.completed === 0 ? "დაწყება" : "გაგრძელება"}
            </Link>
          ) : null}
        </div>
        {lesson.goalsKa.length > 0 ? (
          <div className="flex flex-col gap-2 rounded-2xl border-[1.5px] border-line bg-card p-5">
            <p className="font-bold">ამ გაკვეთილზე</p>
            <ul className="flex list-disc flex-col gap-1.5 pl-5 text-[15px] leading-relaxed">
              {lesson.goalsKa.map((goal) => (
                <li key={goal}>{goal}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </aside>
    </div>
  );
}
