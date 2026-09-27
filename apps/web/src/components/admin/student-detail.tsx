"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { lessonWhen, shortDate } from "@/lib/dates";

type Lesson = { id: string; number: number; title: string; date: string; readyForStudent: boolean };
type Note = { id: string; body: string; visibleToStudent: boolean; createdAt: string };
type Check = { id: string; text: string; done: boolean; lessonId: string | null };
type Student = {
  id: string;
  name: string;
  nameLatin: string | null;
  email: string;
  phone: string | null;
  channel: string | null;
  goal: string | null;
  goalNote: string | null;
  greetingForm: string;
  giftLessonsLeft: number;
  nextLessonAt: string | null;
  lessons: Lesson[];
  progress: { materialId: string; title: string; type: string; status: string; bestScore: number | null }[];
  attempts: { id: string; title: string; score: number | null; correct: number | null; total: number | null }[];
  notes: Note[];
  checklist: Check[];
  personalVocab: { id: string; es: string; ka: string; en: string | null; personalLabel: string | null }[];
  personalMaterials: { id: string; title: string; type: string }[];
};

const tabs = [
  ["overview", "მიმოხილვა"],
  ["lessons", "გაკვეთილები"],
  ["progress", "პროგრესი"],
  ["notes", "შენიშვნები"],
  ["checklist", "სია"],
  ["personal", "პირადი"],
] as const;

export function StudentDetail({ student, tab }: { student: Student; tab: string }) {
  const current = tabs.some(([id]) => id === tab) ? tab : "overview";
  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">{student.name}</h1>
          <p className="text-ink-muted">{student.email}</p>
        </div>
        <Link href={`/admin/students/${student.id}?tab=overview`} className="text-sm font-semibold text-teal-deep">გადახედვა ქვემოთ, მხოლოდ მზა მასალებით</Link>
      </div>
      <div className="flex flex-wrap gap-2">
        {tabs.map(([id, label]) => (
          <Link key={id} href={`/admin/students/${student.id}?tab=${id}`} className={`rounded-xl px-3 py-2 text-sm font-semibold ${current === id ? "bg-teal-deep text-on-dark" : "bg-card text-ink"}`}>
            {label}
          </Link>
        ))}
      </div>
      {current === "overview" ? <Overview student={student} /> : null}
      {current === "lessons" ? <Lessons student={student} /> : null}
      {current === "progress" ? <Progress student={student} /> : null}
      {current === "notes" ? <Notes student={student} /> : null}
      {current === "checklist" ? <Checklist student={student} /> : null}
      {current === "personal" ? <Personal student={student} /> : null}
    </section>
  );
}

function toLocal(iso: string) {
  const date = new Date(iso);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
}

function Overview({ student }: { student: Student }) {
  const router = useRouter();
  const [phone, setPhone] = useState(student.phone ?? "");
  const [next, setNext] = useState(student.nextLessonAt ? toLocal(student.nextLessonAt) : "");
  const [gift, setGift] = useState(String(student.giftLessonsLeft));
  const [error, setError] = useState("");

  async function save(event: FormEvent) {
    event.preventDefault();
    const response = await fetch(`/v1/admin/students/${student.id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, giftLessonsLeft: Number(gift), nextLessonAt: next ? new Date(next).toISOString() : null }),
    });
    if (!response.ok) setError("ვერ შეინახა.");
    else router.refresh();
  }

  const readyLessons = student.lessons.filter((lesson) => lesson.readyForStudent);
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <form onSubmit={(event) => void save(event)} className="flex flex-col gap-3 rounded-2xl border-[1.5px] border-line bg-card p-4">
        <p className="text-sm text-ink-muted">{student.goal ?? "მიზანი არ არის"} · {student.channel ?? "არხი არ არის"}</p>
        {student.goalNote ? <p>{student.goalNote}</p> : null}
        <label className="text-sm font-semibold">ტელეფონი<input value={phone} onChange={(event) => setPhone(event.target.value)} className="mt-1 h-11 w-full rounded-xl border-[1.5px] border-sand px-3 font-medium" /></label>
        <label className="text-sm font-semibold">შემდეგი გაკვეთილი<input type="datetime-local" value={next} onChange={(event) => setNext(event.target.value)} className="mt-1 h-11 w-full rounded-xl border-[1.5px] border-sand px-3 font-medium" /></label>
        <label className="text-sm font-semibold">დარჩენილი საჩუქარი<input value={gift} onChange={(event) => setGift(event.target.value)} className="mt-1 h-11 w-full rounded-xl border-[1.5px] border-sand px-3 font-medium" /></label>
        <button type="submit" className="h-11 w-fit rounded-xl bg-teal-deep px-4 font-semibold text-on-dark">შენახვა</button>
        {error ? <p className="text-sm text-burgundy">{error}</p> : null}
      </form>
      <div className="rounded-2xl border-[1.5px] border-mustard bg-mustard-soft p-4">
        <p className="text-sm font-semibold text-mustard-ink">როგორც მოსწავლე ხედავს · მხოლოდ მზა გაკვეთილები</p>
        <ul className="mt-3 flex flex-col gap-2 text-sm">
          {readyLessons.map((lesson) => (
            <li key={lesson.id}>{lesson.number} · {lesson.title} · {shortDate(lesson.date)}</li>
          ))}
          {readyLessons.length === 0 ? <li>მზა გაკვეთილი ჯერ არ აქვს.</li> : null}
        </ul>
      </div>
    </div>
  );
}

function Lessons({ student }: { student: Student }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [error, setError] = useState("");

  async function create(event: FormEvent) {
    event.preventDefault();
    const response = await fetch(`/v1/admin/students/${student.id}/lessons`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, date: new Date(date).toISOString() }),
    });
    const body = (await response.json().catch(() => null)) as { id?: string; error?: { messageKa?: string } } | null;
    if (!response.ok || !body?.id) {
      setError(body?.error?.messageKa ?? "ვერ შეიქმნა.");
      return;
    }
    router.push(`/admin/students/${student.id}/lessons/${body.id}`);
  }

  return (
    <div className="flex flex-col gap-3">
      <form onSubmit={(event) => void create(event)} className="flex flex-wrap items-end gap-2">
        <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="სათაური" required className="h-11 rounded-xl border-[1.5px] border-sand bg-card px-3" />
        <input type="datetime-local" value={date} onChange={(event) => setDate(event.target.value)} required className="h-11 rounded-xl border-[1.5px] border-sand bg-card px-3" />
        <button type="submit" className="h-11 rounded-xl bg-teal-deep px-4 font-semibold text-on-dark">ახალი გაკვეთილი</button>
      </form>
      {error ? <p className="text-sm text-burgundy">{error}</p> : null}
      <ul className="flex flex-col gap-2">
        {student.lessons.map((lesson) => (
          <li key={lesson.id}>
            <Link href={`/admin/students/${student.id}/lessons/${lesson.id}`} className="font-semibold text-teal-deep">
              {lesson.number} · {lesson.title}
            </Link>
            <span className="text-sm text-ink-muted"> · {lessonWhen(lesson.date)} · {lesson.readyForStudent ? "მოსწავლეს უჩანს" : "დამალულია"}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Progress({ student }: { student: Student }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <ul className="flex flex-col gap-2 text-sm">
        {student.progress.map((row) => (
          <li key={row.materialId}>{row.title} · {row.status}{row.bestScore !== null ? ` · ${Math.round(row.bestScore * 100)}%` : ""}</li>
        ))}
      </ul>
      <ul className="flex flex-col gap-2 text-sm">
        {student.attempts.map((attempt) => (
          <li key={attempt.id}>{attempt.title} · {attempt.correct ?? "—"}/{attempt.total ?? "—"}</li>
        ))}
      </ul>
    </div>
  );
}

function Notes({ student }: { student: Student }) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [visible, setVisible] = useState(true);

  async function add(event: FormEvent) {
    event.preventDefault();
    await fetch(`/v1/admin/students/${student.id}/notes`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body, visibleToStudent: visible }),
    });
    setBody("");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-3">
      <form onSubmit={(event) => void add(event)} className="flex flex-col gap-2">
        <textarea value={body} onChange={(event) => setBody(event.target.value)} required rows={3} className="rounded-xl border-[1.5px] border-sand bg-card px-3 py-2" />
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={visible} onChange={(event) => setVisible(event.target.checked)} /> მოსწავლეს უჩანს</label>
        <button type="submit" className="h-11 w-fit rounded-xl bg-teal-deep px-4 font-semibold text-on-dark">შენიშვნის დამატება</button>
      </form>
      <ul className="flex flex-col gap-2">
        {student.notes.map((note) => (
          <li key={note.id} className="rounded-xl bg-card px-3 py-2 text-sm">
            {note.body}
            <span className="text-ink-muted"> · {note.visibleToStudent ? "ხილული" : "პირადი"} · {shortDate(note.createdAt)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Checklist({ student }: { student: Student }) {
  const router = useRouter();
  const [text, setText] = useState("");

  async function add(event: FormEvent) {
    event.preventDefault();
    await fetch(`/v1/admin/students/${student.id}/checklist`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    setText("");
    router.refresh();
  }

  async function toggle(item: Check) {
    await fetch(`/v1/admin/students/${student.id}/checklist/${item.id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ done: !item.done }),
    });
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-3">
      <form onSubmit={(event) => void add(event)} className="flex gap-2">
        <input value={text} onChange={(event) => setText(event.target.value)} required className="h-11 flex-1 rounded-xl border-[1.5px] border-sand bg-card px-3" />
        <button type="submit" className="h-11 rounded-xl bg-teal-deep px-4 font-semibold text-on-dark">დამატება</button>
      </form>
      <ul className="flex flex-col gap-2">
        {student.checklist.map((item) => (
          <li key={item.id}>
            <button type="button" onClick={() => void toggle(item)} className="text-left text-sm">
              {item.done ? "✓ " : "○ "}{item.text}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Personal({ student }: { student: Student }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <ul className="text-sm">
        {student.personalVocab.map((word) => (
          <li key={word.id}>{word.es} · {word.ka}{word.personalLabel ? ` · ${word.personalLabel}` : ""}</li>
        ))}
        {student.personalVocab.length === 0 ? <li className="text-ink-muted">პირადი სიტყვები არ არის.</li> : null}
      </ul>
      <ul className="text-sm">
        {student.personalMaterials.map((item) => (
          <li key={item.id}><Link href={`/admin/library/${item.id}`} className="text-teal-deep">{item.title}</Link></li>
        ))}
        {student.personalMaterials.length === 0 ? <li className="text-ink-muted">პირადი მასალა არ არის.</li> : null}
      </ul>
    </div>
  );
}
