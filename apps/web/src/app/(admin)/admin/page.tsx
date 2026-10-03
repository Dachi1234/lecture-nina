import Link from "next/link";
import type { ReactNode } from "react";
import { LessonRow, type AdminLessonRow } from "@/components/admin/lesson-row";
import { apiGet } from "@/lib/api";
import { shortDate } from "@/lib/dates";
import { nowMs } from "@/lib/time";

type Dashboard = {
  newLeads: number;
  counts: { students: number; groups: number; plans: number; materials: number };
  upcoming: AdminLessonRow[];
  overdue: { lessonId: string; lessonTitle: string; studentId: string; studentName: string; open: number; dueAt: string }[];
  recent: { studentId: string; studentName: string; lessonId: string; title: string; completedAt: string | null }[];
};

export default async function AdminHomePage() {
  const data = await apiGet<Dashboard>("/v1/admin/dashboard");
  const now = nowMs();
  const unsent = data.upcoming.filter((lesson) => !lesson.published && new Date(lesson.date).getTime() < now + 1000 * 60 * 60 * 48);
  const stats = [
    { href: "/admin/leads", value: data.newLeads, label: "ახალი ლიდი" },
    { href: "/admin/students", value: data.counts.students, label: "მოსწავლე" },
    { href: "/admin/groups", value: data.counts.groups, label: "ჯგუფი" },
    { href: "/admin/curriculum", value: data.counts.plans, label: "გაკვეთილის გეგმა" },
    { href: "/admin/library", value: data.counts.materials, label: "მასალა ბიბლიოთეკაში" },
  ];
  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold">მთავარი</h1>
          <p className="mt-2 max-w-2xl text-lg leading-relaxed text-ink-muted">რა გელოდება ამ ორ კვირაში და ვის რა დარჩა.</p>
        </div>
        <Link href="/admin/lessons/new" className="inline-flex h-12 items-center rounded-xl bg-teal-deep px-6 font-semibold whitespace-nowrap text-on-dark transition hover:-translate-y-0.5 hover:bg-teal-hover">
          + გაკვეთილის დაგეგმვა
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {stats.map((stat) => (
          <Link key={stat.href} href={stat.href} className="rounded-2xl border-[1.5px] border-line bg-card p-4 transition hover:-translate-y-1">
            <p className="text-3xl font-bold">{stat.value}</p>
            <p className="mt-1 text-sm text-ink-muted">{stat.label}</p>
          </Link>
        ))}
      </div>
      {unsent.length > 0 ? (
        <p className="rounded-xl bg-mustard-soft px-4 py-3 text-[15px] text-mustard-ink">
          {unsent.length} უახლოესი გაკვეთილი ჯერ არ გაგზავნილა მოსწავლისთვის. გახსენი და დააჭირე „გაგზავნა“.
        </p>
      ) : null}
      <Panel title="უახლოესი გაკვეთილები" action={<Link href="/admin/lessons" className="text-sm font-semibold text-teal-deep">ყველა →</Link>}>
        {data.upcoming.length === 0 ? <Empty text="ორი კვირის განმავლობაში გაკვეთილი არ არის დაგეგმილი." /> : data.upcoming.map((lesson) => <LessonRow key={lesson.id} lesson={lesson} now={now} />)}
      </Panel>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="ვადაგადაცილებული საშინაო">
          {data.overdue.length === 0 ? (
            <Empty text="ყველამ დროზე შეასრულა." />
          ) : (
            data.overdue.map((item) => (
              <Link key={`${item.lessonId}:${item.studentId}`} href={`/admin/students/${item.studentId}`} className="flex items-center justify-between gap-3 border-b border-line-soft px-4 py-3 last:border-b-0 hover:bg-paper-deep">
                <span>
                  <span className="block font-semibold">{item.studentName}</span>
                  <span className="block text-[13px] text-ink-muted">
                    {item.lessonTitle} · {item.open} დაუსრულებელი
                  </span>
                </span>
                <span className="text-sm font-semibold text-burgundy">{shortDate(item.dueAt)}</span>
              </Link>
            ))
          )}
        </Panel>
        <Panel title="ბოლოს დასრულებული">
          {data.recent.length === 0 ? (
            <Empty text="ჯერ არაფერია." />
          ) : (
            data.recent.map((item, index) => (
              <Link key={`${item.studentId}:${item.title}:${index}`} href={`/admin/students/${item.studentId}`} className="flex items-center justify-between gap-3 border-b border-line-soft px-4 py-3 last:border-b-0 hover:bg-paper-deep">
                <span className="min-w-0">
                  <span className="block font-semibold">{item.studentName}</span>
                  <span className="block truncate text-[13px] text-ink-muted">{item.title}</span>
                </span>
                {item.completedAt ? <span className="text-sm text-ink-muted">{shortDate(item.completedAt)}</span> : null}
              </Link>
            ))
          )}
        </Panel>
      </div>
    </section>
  );
}

function Panel({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="overflow-hidden rounded-2xl border-[1.5px] border-line bg-card">
      <div className="flex items-center justify-between gap-3 border-b border-line-soft px-4 py-3">
        <h2 className="font-bold">{title}</h2>
        {action}
      </div>
      <div className="flex flex-col">{children}</div>
    </section>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="px-4 py-4 text-sm text-ink-muted">{text}</p>;
}
