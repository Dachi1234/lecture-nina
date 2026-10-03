import Link from "next/link";
import { LessonCreate } from "@/components/admin/lessons/lesson-create";
import { apiGet } from "@/lib/api";

type Student = { id: string; name: string; isActive: boolean };
type Group = { id: string; name: string; isArchived: boolean; members: { id: string }[] };
type Plan = { id: string; titleKa: string; items: number; courseTitle: string | null; unitTitle: string | null };

export default async function NewLessonPage({ searchParams }: { searchParams: Promise<{ planId?: string; studentId?: string; groupId?: string }> }) {
  const query = await searchParams;
  const [students, groups, plans] = await Promise.all([
    apiGet<{ items: Student[] }>("/v1/admin/students"),
    apiGet<{ items: Group[] }>("/v1/admin/groups"),
    apiGet<{ items: Plan[] }>("/v1/admin/plans"),
  ]);
  return (
    <section className="flex max-w-3xl flex-col gap-5">
      <Link href="/admin/lessons" className="text-sm font-semibold text-teal-deep">
        ← გაკვეთილები
      </Link>
      <div>
        <h1 className="text-3xl font-bold">გაკვეთილის დაგეგმვა</h1>
        <p className="mt-2 text-ink-muted">ვისთვის, როდის და რომელი გეგმით. მასალებს გეგმიდან ავტომატურად მიიღებს — შემდეგ ამ კონკრეტულ გაკვეთილში შეგიძლია შეცვალო.</p>
      </div>
      <LessonCreate
        students={students.items.filter((student) => student.isActive).map(({ id, name }) => ({ id, name }))}
        groups={groups.items.filter((group) => !group.isArchived).map((group) => ({ id: group.id, name: group.name, size: group.members.length }))}
        plans={plans.items}
        initial={query}
      />
    </section>
  );
}
