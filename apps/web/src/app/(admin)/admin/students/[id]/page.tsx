import Link from "next/link";
import { notFound } from "next/navigation";
import { StatusChip } from "@nina/ui";
import { LessonStateChip } from "@/components/admin/lesson-row";
import { ChecklistPanel, EnrollmentPanel, InviteButton, NotesPanel, ProfilePanel, WordsPanel } from "@/components/admin/student-panels";
import { SyllabusMap, type Syllabus } from "@/components/admin/syllabus-map";
import { ApiError, apiGet } from "@/lib/api";
import { lessonWhen, shortDate } from "@/lib/dates";
import { nowMs } from "@/lib/time";

export type StudentDetail = {
  id: string;
  name: string;
  nameLatin: string | null;
  email: string;
  isActive: boolean;
  phone: string | null;
  channel: string | null;
  goal: string | null;
  goalNote: string | null;
  greetingForm: string;
  giftLessonsLeft: number;
  invite: "none" | "sent" | "accepted";
  groups: { id: string; name: string }[];
  syllabus: { enrollmentId: string; course: { id: string; title: string; level: string | null }; status: string; progress: Syllabus }[];
  lessons: { id: string; number: number; title: string; date: string; published: boolean; held: boolean; group: { id: string; name: string } | null; status: "NEW" | "IN_PROGRESS" | "DONE"; counter: { completed: number; total: number } }[];
  attempts: { id: string; materialId: string; lessonId: string | null; title: string; score: number | null; correct: number | null; total: number | null; finishedAt: string | null }[];
  notes: { id: string; body: string; visibleToStudent: boolean; createdAt: string }[];
  checklist: { id: string; text: string; done: boolean }[];
  words: { id: string; es: string; ka: string | null; en: string | null; noteKa: string | null }[];
};

const tabs = [
  ["overview", "მიმოხილვა"],
  ["progress", "პროგრესი"],
  ["notes", "შენიშვნები"],
  ["words", "ლექსიკა"],
  ["profile", "პროფილი"],
] as const;

const chip = { NEW: "new", IN_PROGRESS: "progress", DONE: "done" } as const;
const inviteKa = { none: "მოწვევა არ არის", sent: "მოწვევა გაგზავნილია, ჯერ არ შესულა", accepted: "კაბინეტში შესულია" };

export default async function StudentPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ tab?: string }> }) {
  const { id } = await params;
  const { tab } = await searchParams;
  const current = tabs.some(([key]) => key === tab) ? tab! : "overview";
  let student: StudentDetail;
  try {
    student = await apiGet<StudentDetail>(`/v1/admin/students/${id}`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }
  const now = nowMs();
  const upcoming = student.lessons.filter((lesson) => new Date(lesson.date).getTime() >= now).reverse();
  const past = student.lessons.filter((lesson) => new Date(lesson.date).getTime() < now);

  return (
    <section className="flex flex-col gap-5">
      <Link href="/admin/students" className="text-sm font-semibold text-teal-deep">
        ← მოსწავლეები
      </Link>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{student.name}</h1>
          <p className="mt-1 text-ink-muted">
            {student.email} · {student.isActive ? inviteKa[student.invite] : "შეჩერებული"}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {student.syllabus.map((row) => (
              <Link key={row.enrollmentId} href={`/admin/curriculum/${row.course.id}`} className="rounded-lg bg-teal-soft px-2.5 py-1 text-sm font-semibold text-teal-deep">
                {row.course.title}
              </Link>
            ))}
            {student.groups.map((group) => (
              <Link key={group.id} href={`/admin/groups/${group.id}`} className="rounded-lg bg-sand-soft px-2.5 py-1 text-sm font-semibold">
                ჯგუფი · {group.name}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <InviteButton studentId={student.id} accepted={student.invite === "accepted"} />
          <Link href={`/admin/lessons/new?studentId=${student.id}`} className="inline-flex h-12 items-center rounded-xl bg-teal-deep px-6 font-semibold whitespace-nowrap text-on-dark transition hover:-translate-y-0.5 hover:bg-teal-hover">
            + გაკვეთილის დაგეგმვა
          </Link>
        </div>
      </div>

      <nav className="flex flex-wrap gap-2" aria-label="განყოფილებები">
        {tabs.map(([key, label]) => (
          <Link
            key={key}
            href={`/admin/students/${student.id}?tab=${key}`}
            aria-current={current === key ? "page" : undefined}
            className={`inline-flex h-11 items-center rounded-xl border-[1.5px] px-4 text-[15px] font-semibold ${current === key ? "border-teal-deep bg-teal-deep text-on-dark" : "border-sand bg-card"}`}
          >
            {label}
          </Link>
        ))}
      </nav>

      {current === "overview" ? (
        <div className="flex flex-col gap-5">
          {student.syllabus.map((row) => (
            <SyllabusMap key={row.enrollmentId} title={`სილაბუსი · ${row.course.title}`} syllabus={row.progress} scheduleHref={(planId) => `/admin/lessons/new?studentId=${student.id}&planId=${planId}`} />
          ))}
          {student.syllabus.length === 0 ? <p className="rounded-2xl border-[1.5px] border-dashed border-sand bg-card p-5 text-ink-muted">კურსზე არ არის ჩარიცხული — „პროფილი“ ჩანართში დაამატე.</p> : null}
          <LessonTable title="მომავალი გაკვეთილები" lessons={upcoming} now={now} />
          <LessonTable title="გასული გაკვეთილები" lessons={past} now={now} />
        </div>
      ) : null}

      {current === "progress" ? (
        <div className="grid gap-5 lg:grid-cols-2">
          <section className="overflow-hidden rounded-2xl border-[1.5px] border-line bg-card">
            <h2 className="border-b border-line-soft px-4 py-3 font-bold">გაკვეთილების მიხედვით</h2>
            {student.lessons.filter((lesson) => lesson.published).map((lesson) => (
              <Link key={lesson.id} href={`/admin/lessons/${lesson.id}`} className="flex items-center gap-3 border-b border-line-soft px-4 py-2.5 last:border-b-0 hover:bg-paper-deep">
                <span className="w-8 text-sm font-bold text-ink-muted">{lesson.number}</span>
                <span className="min-w-0 flex-1 truncate font-semibold">{lesson.title}</span>
                <span className="text-sm text-ink-muted">
                  {lesson.counter.completed}/{lesson.counter.total}
                </span>
                <StatusChip status={chip[lesson.status]} />
              </Link>
            ))}
          </section>
          <section className="overflow-hidden rounded-2xl border-[1.5px] border-line bg-card">
            <h2 className="border-b border-line-soft px-4 py-3 font-bold">სავარჯიშოები</h2>
            {student.attempts.length === 0 ? <p className="px-4 py-3 text-sm text-ink-muted">ჯერ არ გაუკეთებია.</p> : null}
            {student.attempts.map((attempt) => (
              <div key={attempt.id} className="flex items-center gap-3 border-b border-line-soft px-4 py-2.5 last:border-b-0">
                <span className="min-w-0 flex-1 truncate">{attempt.title}</span>
                {attempt.finishedAt ? <span className="text-sm text-ink-muted">{shortDate(attempt.finishedAt)}</span> : null}
                <span className="w-14 text-right font-bold text-teal-deep">
                  {attempt.correct !== null && attempt.total ? `${attempt.correct}/${attempt.total}` : attempt.score !== null ? `${Math.round(attempt.score * 100)}%` : "—"}
                </span>
              </div>
            ))}
          </section>
        </div>
      ) : null}

      {current === "notes" ? (
        <div className="grid items-start gap-5 lg:grid-cols-2">
          <NotesPanel studentId={student.id} notes={student.notes} />
          <ChecklistPanel studentId={student.id} items={student.checklist} />
        </div>
      ) : null}

      {current === "words" ? <WordsPanel studentId={student.id} words={student.words} /> : null}

      {current === "profile" ? (
        <div className="grid items-start gap-5 lg:grid-cols-2">
          <ProfilePanel student={student} />
          <EnrollmentPanel studentId={student.id} enrollments={student.syllabus.map((row) => ({ courseId: row.course.id, status: row.status }))} courses={(await apiGet<{ items: { id: string; title: string; isArchived: boolean }[] }>("/v1/admin/courses")).items} />
        </div>
      ) : null}
    </section>
  );
}

function LessonTable({ title, lessons, now }: { title: string; lessons: StudentDetail["lessons"]; now: number }) {
  return (
    <section className="overflow-hidden rounded-2xl border-[1.5px] border-line bg-card">
      <h2 className="border-b border-line-soft px-4 py-3 font-bold">
        {title} · {lessons.length}
      </h2>
      {lessons.length === 0 ? <p className="px-4 py-3 text-sm text-ink-muted">არ არის.</p> : null}
      {lessons.map((lesson) => (
        <Link key={lesson.id} href={`/admin/lessons/${lesson.id}`} className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-line-soft px-4 py-3 last:border-b-0 hover:bg-paper-deep">
          <span className="w-44 shrink-0 text-sm font-semibold">{lessonWhen(lesson.date)}</span>
          <span className="min-w-48 flex-1">
            <span className="block font-bold">{lesson.title}</span>
            <span className="block text-[13px] text-ink-muted">
              {lesson.group ? `ჯგუფი · ${lesson.group.name} · ` : ""}
              {lesson.published ? `${lesson.counter.completed}/${lesson.counter.total} დასრულებული` : "ჯერ არ გაგზავნილა"}
            </span>
          </span>
          {lesson.published ? <StatusChip status={chip[lesson.status]} /> : null}
          <LessonStateChip published={lesson.published} held={lesson.held} past={new Date(lesson.date).getTime() < now} />
        </Link>
      ))}
    </section>
  );
}
