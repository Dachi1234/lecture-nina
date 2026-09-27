import Link from "next/link";
import { MarkDone } from "@/components/cabinet/mark-done";
import { MaterialRow, StatusChip } from "@nina/ui";
import { apiGet, redirectAdminHome } from "@/lib/api";
import { lessonOverline } from "@/lib/dates";
import { materialIcon, materialLabel, progressLabel, ringFor } from "@/lib/materials";

type Item = {
  materialId: string;
  title: string;
  type: string;
  groupLabel: string | null;
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
  date: string;
  note: string | null;
  status: "NEW" | "IN_PROGRESS" | "DONE";
  counter: { completed: number; total: number };
  topics: { id: string; number: number; titleKa: string }[];
  items: Item[];
};

const chip = { NEW: "new", IN_PROGRESS: "progress", DONE: "done" } as const;

function groups(items: Item[]) {
  const rows: { label: string | null; items: Item[] }[] = [];
  for (const item of items) {
    const last = rows.at(-1);
    if (!last || last.label !== item.groupLabel) rows.push({ label: item.groupLabel, items: [item] });
    else last.items.push(item);
  }
  return rows;
}

export default async function LessonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await redirectAdminHome();
  const lesson = await apiGet<Lesson>(`/v1/me/lessons/${id}`);
  const ratio = lesson.counter.total > 0 ? Math.round((lesson.counter.completed / lesson.counter.total) * 100) : 0;
  const next = lesson.items.find((item) => item.status !== "COMPLETED");

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
            {lesson.topics.map((topic) => (
              <span key={topic.id} className="rounded-lg bg-sand-soft px-3 py-1.5 text-sm">
                თემა {topic.number} · {topic.titleKa}
              </span>
            ))}
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
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-[22px] font-bold">მასალები</h2>
            <span className="text-sm text-ink-muted">
              {lesson.counter.completed} / {lesson.counter.total} დასრულებული · ნინას თანმიმდევრობით
            </span>
          </div>
          <div className="overflow-hidden rounded-2xl border-[1.5px] border-line bg-card">
            {groups(lesson.items).map((group) => (
              <div key={group.label ?? "ungrouped"}>
                {group.label ? <p className="bg-paper-deep px-5 py-2.5 text-[13px] font-semibold text-ink-muted">{group.label}</p> : null}
                {group.items.map((item) => {
                  const markable = item.canMarkDone && item.status !== "COMPLETED";
                  const resumable = !item.canMarkDone && item.status === "OPENED";
                  return (
                  <div key={item.materialId} className={`relative ${next?.materialId === item.materialId ? "bg-paper-deep" : ""}`}>
                    <Link href={`/app/m/${item.materialId}?lessonId=${lesson.id}`} className="block">
                      <MaterialRow
                        icon={materialIcon(item.type)}
                        title={item.title}
                        meta={item.steps ? `სავარჯიშო · ${item.steps} ნაბიჯი${item.lastStep ? ` · ${Math.min(item.lastStep, item.steps)}/${item.steps}` : ""}` : materialLabel(item.type, item.estMinutes)}
                        ring={ringFor(item.status)}
                        action={
                          markable || resumable ? (
                            <span aria-hidden className={`hidden sm:block ${markable ? "w-52" : "w-28"}`} />
                          ) : (
                            <span className={`hidden text-[13px] font-semibold sm:inline ${item.status === "COMPLETED" ? "text-sage-ink" : "text-ink-muted"}`}>{progressLabel(item.status)}</span>
                          )
                        }
                      />
                    </Link>
                    {markable ? (
                      <div className="absolute top-1/2 right-14 hidden -translate-y-1/2 sm:block">
                        <MarkDone materialId={item.materialId} />
                      </div>
                    ) : null}
                    {resumable ? (
                      <div className="absolute top-1/2 right-14 hidden -translate-y-1/2 sm:block">
                        <Link href={`/app/m/${item.materialId}?lessonId=${lesson.id}`} className="inline-flex h-10 items-center rounded-[10px] bg-teal-deep px-4 text-sm font-semibold text-on-dark">
                          გაგრძელება
                        </Link>
                      </div>
                    ) : null}
                  </div>
                  );
                })}
              </div>
            ))}
          </div>
        </section>
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
        </div>
      </aside>
    </div>
  );
}
