import Link from "next/link";
import { CourseCreate } from "@/components/admin/curriculum/course-create";
import { apiGet } from "@/lib/api";

type Course = { id: string; title: string; level: string | null; descriptionKa: string | null; isArchived: boolean; units: number; plans: number; students: number; groups: number };
type Plan = { id: string; titleKa: string; items: number; courseId: string | null };

export default async function CurriculumPage() {
  const [{ items }, plans] = await Promise.all([apiGet<{ items: Course[] }>("/v1/admin/courses"), apiGet<{ items: Plan[] }>("/v1/admin/plans")]);
  const standalone = plans.items.filter((plan) => plan.courseId === null);
  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">კურიკულუმი</h1>
          <p className="mt-2 max-w-3xl text-base leading-relaxed text-ink-muted">
            კურსი → თავები → გაკვეთილის გეგმები. გეგმა არის „რეცეპტი“: რა მასალები, რა თანმიმდევრობით და რა არის საშინაო. გაკვეთილს მოსწავლესთან ან ჯგუფთან გეგმიდან ქმნი — გეგმის შეცვლა ყველა მომავალ გაკვეთილზე აისახება.
          </p>
        </div>
        <CourseCreate />
      </div>
      <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((course) => (
          <li key={course.id}>
            <Link href={`/admin/curriculum/${course.id}`} className={`flex h-full flex-col gap-3 rounded-2xl border-[1.5px] border-line bg-card p-5 transition hover:-translate-y-1 ${course.isArchived ? "opacity-70" : ""}`}>
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-xl font-bold">{course.title}</h2>
                {course.level ? <span className="rounded-full bg-teal-soft px-3 py-1 text-sm font-semibold text-teal-deep">{course.level}</span> : null}
              </div>
              {course.descriptionKa ? <p className="text-[15px] leading-relaxed text-ink-muted">{course.descriptionKa}</p> : null}
              <p className="mt-auto text-sm text-ink-muted">
                {course.units} თავი · {course.plans} გეგმა · {course.students} მოსწავლე · {course.groups} ჯგუფი
                {course.isArchived ? " · არქივი" : ""}
              </p>
            </Link>
          </li>
        ))}
      </ul>
      {standalone.length > 0 ? (
        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-bold">ცალკე გეგმები</h2>
          <p className="text-sm text-ink-muted">გეგმები, რომლებიც არცერთ თავს არ ეკუთვნის (მაგ. ერთჯერადი თემატური გაკვეთილი).</p>
          <ul className="overflow-hidden rounded-2xl border-[1.5px] border-line bg-card">
            {standalone.map((plan) => (
              <li key={plan.id} className="border-b border-line-soft last:border-b-0">
                <Link href={`/admin/plans/${plan.id}`} className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-paper-deep">
                  <span className="font-semibold">{plan.titleKa}</span>
                  <span className="text-sm text-ink-muted">{plan.items} მასალა</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </section>
  );
}
