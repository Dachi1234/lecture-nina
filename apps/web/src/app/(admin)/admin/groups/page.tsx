import Link from "next/link";
import { GroupCreate } from "@/components/admin/groups/group-create";
import { apiGet } from "@/lib/api";
import { lessonWhen } from "@/lib/dates";

type Group = { id: string; name: string; isArchived: boolean; course: { id: string; title: string } | null; members: { id: string; name: string }[]; nextLessonAt: string | null };

export default async function GroupsPage() {
  const [groups, courses, students] = await Promise.all([
    apiGet<{ items: Group[] }>("/v1/admin/groups"),
    apiGet<{ items: { id: string; title: string; isArchived: boolean }[] }>("/v1/admin/courses"),
    apiGet<{ items: { id: string; name: string; isActive: boolean }[] }>("/v1/admin/students"),
  ]);
  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">ჯგუფები</h1>
          <p className="mt-2 max-w-2xl text-base leading-relaxed text-ink-muted">ჯგუფის გაკვეთილი ერთხელ იქმნება და ყველა წევრი ხედავს. პროგრესი თითოეულს ცალკე ეთვლება.</p>
        </div>
        <GroupCreate courses={courses.items.filter((course) => !course.isArchived)} students={students.items.filter((student) => student.isActive)} />
      </div>
      {groups.items.length === 0 ? <p className="rounded-2xl border-[1.5px] border-dashed border-sand bg-card p-6 text-ink-muted">ჯგუფი ჯერ არ არის.</p> : null}
      <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {groups.items.map((group) => (
          <li key={group.id}>
            <Link href={`/admin/groups/${group.id}`} className={`flex h-full flex-col gap-2 rounded-2xl border-[1.5px] border-line bg-card p-5 transition hover:-translate-y-1 ${group.isArchived ? "opacity-60" : ""}`}>
              <h2 className="text-xl font-bold">{group.name}</h2>
              <p className="text-sm text-ink-muted">{group.course?.title ?? "კურსის გარეშე"}{group.isArchived ? " · არქივი" : ""}</p>
              <p className="text-[15px]">{group.members.length ? group.members.map((member) => member.name).join(", ") : "წევრები არ არის"}</p>
              <p className="mt-auto text-sm font-semibold text-teal-deep">{group.nextLessonAt ? `შემდეგი: ${lessonWhen(group.nextLessonAt)}` : "გაკვეთილი არ არის დაგეგმილი"}</p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
