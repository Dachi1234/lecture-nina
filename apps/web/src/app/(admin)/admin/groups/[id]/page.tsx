import Link from "next/link";
import { notFound } from "next/navigation";
import { GroupSettings } from "@/components/admin/groups/group-settings";
import { LessonRow } from "@/components/admin/lesson-row";
import { SyllabusMap, type Syllabus } from "@/components/admin/syllabus-map";
import { ApiError, apiGet } from "@/lib/api";
import { nowMs } from "@/lib/time";

type Group = {
  id: string;
  name: string;
  noteKa: string | null;
  isArchived: boolean;
  course: { id: string; title: string } | null;
  members: { id: string; name: string; email: string; joinedAt: string }[];
  lessons: { id: string; title: string; date: string; published: boolean; held: boolean }[];
  syllabus: Syllabus | null;
};

export default async function GroupPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let group: Group;
  try {
    group = await apiGet<Group>(`/v1/admin/groups/${id}`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }
  const [courses, students] = await Promise.all([
    apiGet<{ items: { id: string; title: string; isArchived: boolean }[] }>("/v1/admin/courses"),
    apiGet<{ items: { id: string; name: string; isActive: boolean }[] }>("/v1/admin/students"),
  ]);
  const now = nowMs();
  const upcoming = group.lessons.filter((lesson) => new Date(lesson.date).getTime() >= now).reverse();
  const past = group.lessons.filter((lesson) => new Date(lesson.date).getTime() < now);
  const row = (lesson: Group["lessons"][number]) => ({ ...lesson, audience: null });

  return (
    <section className="flex flex-col gap-5">
      <Link href="/admin/groups" className="text-sm font-semibold text-teal-deep">
        ← ჯგუფები
      </Link>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{group.name}</h1>
          <p className="mt-1 text-ink-muted">
            {group.course?.title ?? "კურსის გარეშე"} · {group.members.length} მოსწავლე{group.isArchived ? " · არქივი" : ""}
          </p>
        </div>
        <Link href={`/admin/lessons/new?groupId=${group.id}`} className="inline-flex h-12 items-center rounded-xl bg-teal-deep px-6 font-semibold whitespace-nowrap text-on-dark transition hover:-translate-y-0.5 hover:bg-teal-hover">
          + გაკვეთილის დაგეგმვა
        </Link>
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex flex-col gap-5">
          {group.syllabus && group.course ? (
            <SyllabusMap title={`სილაბუსი · ${group.course.title}`} syllabus={group.syllabus} scheduleHref={(planId) => `/admin/lessons/new?groupId=${group.id}&planId=${planId}`} />
          ) : (
            <p className="rounded-2xl border-[1.5px] border-dashed border-sand bg-card p-5 text-ink-muted">ჯგუფს კურსი არ აქვს მიბმული — მიაბი მარჯვნივ, რომ სილაბუსი გამოჩნდეს.</p>
          )}
          <section className="overflow-hidden rounded-2xl border-[1.5px] border-line bg-card">
            <h2 className="border-b border-line-soft px-4 py-3 font-bold">მომავალი გაკვეთილები · {upcoming.length}</h2>
            {upcoming.length === 0 ? <p className="px-4 py-3 text-sm text-ink-muted">არ არის დაგეგმილი.</p> : upcoming.map((lesson) => <LessonRow key={lesson.id} lesson={row(lesson)} showAudience={false} now={now} />)}
          </section>
          <section className="overflow-hidden rounded-2xl border-[1.5px] border-line bg-card">
            <h2 className="border-b border-line-soft px-4 py-3 font-bold">გასული გაკვეთილები · {past.length}</h2>
            {past.length === 0 ? <p className="px-4 py-3 text-sm text-ink-muted">ჯერ არ ყოფილა.</p> : past.map((lesson) => <LessonRow key={lesson.id} lesson={row(lesson)} showAudience={false} now={now} />)}
          </section>
        </div>
        <GroupSettings
          group={{ id: group.id, name: group.name, noteKa: group.noteKa, isArchived: group.isArchived, courseId: group.course?.id ?? "", memberIds: group.members.map((member) => member.id) }}
          courses={courses.items.filter((course) => !course.isArchived || course.id === group.course?.id)}
          students={students.items.filter((student) => student.isActive || group.members.some((member) => member.id === student.id))}
        />
      </div>
    </section>
  );
}
