import Link from "next/link";
import { StatusChip } from "@nina/ui";
import { apiGet, redirectAdminHome } from "@/lib/api";
import { shortDate } from "@/lib/dates";

type Lesson = {
  id: string;
  number: number;
  title: string;
  date: string;
  status: "NEW" | "IN_PROGRESS" | "DONE";
  counter: { completed: number; total: number };
  topics: { id: string; number: number; titleKa: string }[];
};

const chip = { NEW: "new", IN_PROGRESS: "progress", DONE: "done" } as const;
const tile = {
  NEW: "bg-mustard text-navy",
  IN_PROGRESS: "bg-teal-soft text-teal-deep",
  DONE: "bg-sage-soft text-sage-ink",
} as const;

export default async function LessonsPage({ searchParams }: { searchParams: Promise<{ filter?: string }> }) {
  const { filter } = await searchParams;
  const selected = filter === "current" || filter === "done" ? filter : "all";
  await redirectAdminHome();
  const { items } = await apiGet<{ items: Lesson[] }>("/v1/me/lessons");
  const current = items.filter((lesson) => lesson.status !== "DONE").length;
  const done = items.filter((lesson) => lesson.status === "DONE").length;
  const visible = items.filter((lesson) => {
    if (selected === "current") return lesson.status !== "DONE";
    if (selected === "done") return lesson.status === "DONE";
    return true;
  });

  const tabs = [
    { id: "all", label: `ყველა · ${items.length}`, href: "/app/lessons" },
    { id: "current", label: `მიმდინარე · ${current}`, href: "/app/lessons?filter=current" },
    { id: "done", label: `დასრულებული · ${done}`, href: "/app/lessons?filter=done" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="font-hand text-[32px] leading-none text-burgundy">Mis lecciones</p>
          <h1 className="text-[34px] font-bold">ჩემი გაკვეთილები</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <Link
              key={tab.id}
              href={tab.href}
              aria-current={selected === tab.id ? "page" : undefined}
              className={`inline-flex h-10 items-center rounded-[10px] px-4 text-sm ${selected === tab.id ? "bg-teal-deep font-semibold text-on-dark" : "border-[1.5px] border-sand"}`}
            >
              {tab.label}
            </Link>
          ))}
        </div>
      </div>
      <div className="overflow-hidden rounded-2xl border-[1.5px] border-line bg-card">
        {visible.length === 0 ? <p className="p-6 text-ink-muted">ამ ფილტრში გაკვეთილი არ არის.</p> : null}
        {visible.map((lesson) => (
          <Link
            key={lesson.id}
            href={`/app/lessons/${lesson.id}`}
            className={`flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-line-soft px-4 py-3.5 last:border-b-0 ${lesson.status === "DONE" ? "" : "bg-paper-deep"}`}
          >
            <span className={`flex size-11 items-center justify-center rounded-xl text-lg font-bold ${tile[lesson.status]}`}>{lesson.number}</span>
            <span className="w-16 text-sm">{shortDate(lesson.date)}</span>
            <span className="min-w-40 flex-1 font-bold">{lesson.title}</span>
            <span className="flex flex-wrap gap-1.5">
              {lesson.topics.slice(0, 3).map((topic) => (
                <span key={topic.id} className="rounded-lg bg-sand-soft px-2.5 py-1 text-[13px]">
                  {topic.titleKa}
                </span>
              ))}
            </span>
            <StatusChip status={chip[lesson.status]}>{lesson.status === "DONE" ? "✓ დასრულებული" : undefined}</StatusChip>
            <span className="text-sm text-ink-muted">
              {lesson.counter.completed} / {lesson.counter.total}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
