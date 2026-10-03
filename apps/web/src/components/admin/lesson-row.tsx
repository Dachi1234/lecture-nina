import Link from "next/link";
import { lessonWhen } from "@/lib/dates";

export type AdminLessonRow = {
  id: string;
  title: string;
  date: string;
  published: boolean;
  held?: boolean;
  audience: { kind: "group" | "student"; id: string; name: string } | null;
  plan?: { titleKa: string; unitTitle: string | null } | null;
  items?: number;
  problems?: number;
};

export function LessonStateChip({ published, held, past }: { published: boolean; held?: boolean; past: boolean }) {
  if (held) return <span className="rounded-lg bg-sage-soft px-2.5 py-1 text-[13px] font-semibold text-sage-ink">ჩატარდა</span>;
  if (published) return <span className="rounded-lg bg-teal-soft px-2.5 py-1 text-[13px] font-semibold text-teal-deep">გაგზავნილი</span>;
  return <span className={`rounded-lg px-2.5 py-1 text-[13px] font-semibold ${past ? "bg-burgundy-soft text-burgundy" : "bg-mustard-soft text-mustard-ink"}`}>{past ? "არ გაგზავნილა" : "მონახაზი"}</span>;
}

export function LessonRow({ lesson, showAudience = true, now }: { lesson: AdminLessonRow; showAudience?: boolean; now: number }) {
  const past = new Date(lesson.date).getTime() < now;
  return (
    <Link href={`/admin/lessons/${lesson.id}`} className="flex flex-wrap items-center gap-x-4 gap-y-1.5 border-b border-line-soft px-4 py-3 last:border-b-0 hover:bg-paper-deep">
      <span className="w-44 shrink-0 text-sm font-semibold">{lessonWhen(lesson.date)}</span>
      <span className="min-w-48 flex-1">
        <span className="block font-bold">{lesson.title}</span>
        <span className="block text-[13px] text-ink-muted">
          {[showAudience ? lesson.audience?.name : null, lesson.plan?.unitTitle, lesson.items !== undefined ? `${lesson.items} მასალა` : null].filter(Boolean).join(" · ")}
        </span>
      </span>
      {lesson.problems ? <span className="rounded-lg bg-burgundy-soft px-2.5 py-1 text-[13px] font-semibold text-burgundy">{lesson.problems} გამოუქვეყნებელი მასალა</span> : null}
      <LessonStateChip published={lesson.published} held={lesson.held} past={past} />
    </Link>
  );
}
