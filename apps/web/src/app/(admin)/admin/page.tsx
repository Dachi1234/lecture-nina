import Link from "next/link";
import type { ReactNode } from "react";
import { apiGet } from "@/lib/api";
import { lessonWhen, shortDate } from "@/lib/dates";

type Dashboard = {
  newLeads: number;
  upcoming: { name: string; at: string }[];
  overdue: { studentName: string; title: string; dueAt: string | null; lessonNumber: number | null }[];
  recent: { studentName: string; title: string; completedAt: string | null }[];
};

export default async function AdminHomePage() {
  const data = await apiGet<Dashboard>("/v1/admin/dashboard");
  return (
    <section className="flex flex-col gap-6">
      <div>
        <h1 className="text-4xl font-bold">მთავარი</h1>
        <p className="mt-2 max-w-2xl text-lg leading-relaxed text-ink-muted">ახალი ლიდები, უახლოესი გაკვეთილები და დავალებები, რომლებიც ვადას გასცდა.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <Link href="/admin/leads" className="rounded-2xl border-[1.5px] border-line bg-card p-4">
          <p className="text-3xl font-bold">{data.newLeads}</p>
          <p className="mt-1 text-sm text-ink-muted">ახალი ლიდი</p>
        </Link>
        <div className="rounded-2xl border-[1.5px] border-line bg-card p-4">
          <p className="text-3xl font-bold">{data.upcoming.length}</p>
          <p className="mt-1 text-sm text-ink-muted">დაგეგმილი გაკვეთილი</p>
        </div>
        <div className="rounded-2xl border-[1.5px] border-line bg-card p-4">
          <p className="text-3xl font-bold">{data.overdue.length}</p>
          <p className="mt-1 text-sm text-ink-muted">ვადაგადაცილებული საშინაო</p>
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="უახლოესი გაკვეთილები">
          {data.upcoming.length === 0 ? <Empty /> : data.upcoming.map((item) => (
            <p key={item.at + item.name}>{item.name} · {lessonWhen(item.at)}</p>
          ))}
        </Panel>
        <Panel title="ვადაგადაცილებული საშინაო">
          {data.overdue.length === 0 ? <Empty /> : data.overdue.map((item) => (
            <p key={item.title + item.studentName}>{item.studentName} · {item.title}{item.dueAt ? ` · ${shortDate(item.dueAt)}` : ""}</p>
          ))}
        </Panel>
        <Panel title="ბოლოს დასრულებული">
          {data.recent.length === 0 ? <Empty /> : data.recent.map((item) => (
            <p key={item.title + item.studentName}>{item.studentName} · {item.title}</p>
          ))}
        </Panel>
      </div>
    </section>
  );
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border-[1.5px] border-line bg-card p-4">
      <h2 className="mb-3 font-bold">{title}</h2>
      <div className="flex flex-col gap-2 text-sm leading-relaxed">{children}</div>
    </section>
  );
}

function Empty() {
  return <p className="text-ink-muted">ჯერ არაფერია.</p>;
}
