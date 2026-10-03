import Link from "next/link";
import { LessonRow, type AdminLessonRow } from "@/components/admin/lesson-row";
import { apiGet } from "@/lib/api";
import { nowMs } from "@/lib/time";

const scopes = [
  { id: "upcoming", label: "მომავალი" },
  { id: "past", label: "გასული" },
  { id: "all", label: "ყველა" },
] as const;

export default async function AdminLessonsPage({ searchParams }: { searchParams: Promise<{ scope?: string }> }) {
  const { scope: raw } = await searchParams;
  const scope = scopes.some((item) => item.id === raw) ? raw! : "upcoming";
  const { items } = await apiGet<{ items: (AdminLessonRow & { held: boolean })[] }>(`/v1/admin/lessons?scope=${scope}`);
  const now = nowMs();
  const unsentPast = items.filter((lesson) => !lesson.published && new Date(lesson.date).getTime() < now).length;
  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">გაკვეთილები</h1>
          <p className="mt-2 max-w-2xl text-base leading-relaxed text-ink-muted">
            ყველა გაკვეთილი — ინდივიდუალური და ჯგუფური. გაკვეთილს მოსწავლე ხედავს მხოლოდ მას შემდეგ, რაც „გაგზავნი“.
          </p>
        </div>
        <Link href="/admin/lessons/new" className="inline-flex h-12 items-center rounded-xl bg-teal-deep px-6 font-semibold whitespace-nowrap text-on-dark transition hover:-translate-y-0.5 hover:bg-teal-hover">
          + გაკვეთილის დაგეგმვა
        </Link>
      </div>
      <nav className="flex flex-wrap gap-2" aria-label="პერიოდი">
        {scopes.map((item) => (
          <Link
            key={item.id}
            href={`/admin/lessons?scope=${item.id}`}
            aria-current={scope === item.id ? "page" : undefined}
            className={`inline-flex h-11 items-center rounded-xl border-[1.5px] px-4 text-[15px] font-semibold ${scope === item.id ? "border-teal-deep bg-teal-deep text-on-dark" : "border-sand bg-card"}`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      {unsentPast ? <p className="rounded-xl bg-burgundy-soft px-4 py-3 text-sm font-medium text-burgundy">{unsentPast} გასული გაკვეთილი არ გაგზავნილა — მოსწავლე მას ვერ ხედავს.</p> : null}
      <div className="overflow-hidden rounded-2xl border-[1.5px] border-line bg-card">
        {items.length === 0 ? <p className="p-5 text-ink-muted">აქ ჯერ არაფერია.</p> : null}
        {items.map((lesson) => (
          <LessonRow key={lesson.id} lesson={lesson} now={now} />
        ))}
      </div>
    </section>
  );
}
