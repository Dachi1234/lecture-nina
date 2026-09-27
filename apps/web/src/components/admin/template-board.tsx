"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

type Template = { id: string; title: string; note: string | null };
type Student = { id: string; name: string };

export function TemplateBoard({ templates, students }: { templates: Template[]; students: Student[] }) {
  const router = useRouter();
  const [studentId, setStudentId] = useState(students[0]?.id ?? "");
  const [templateId, setTemplateId] = useState(templates[0]?.id ?? "");
  const [date, setDate] = useState("");
  const [error, setError] = useState("");

  async function create(event: FormEvent) {
    event.preventDefault();
    const response = await fetch("/v1/admin/lessons/from-template", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId, templateId, date: new Date(date).toISOString() }),
    });
    const body = (await response.json().catch(() => null)) as { id?: string; error?: { messageKa?: string } } | null;
    if (!response.ok || !body?.id) {
      setError(body?.error?.messageKa ?? "ვერ შეიქმნა.");
      return;
    }
    router.push(`/admin/students/${studentId}/lessons/${body.id}`);
  }

  return (
    <div className="flex flex-col gap-4">
      <ul className="flex flex-col gap-2">
        {templates.map((template) => (
          <li key={template.id} className="rounded-2xl border-[1.5px] border-line bg-card px-4 py-3">
            <p className="font-semibold">{template.title}</p>
            {template.note ? <p className="text-sm text-ink-muted">{template.note}</p> : null}
          </li>
        ))}
        {templates.length === 0 ? <li className="text-ink-muted">შაბლონი ჯერ არ არის. გაკვეთილის რედაქტორიდან შეგიძლია შეინახო.</li> : null}
      </ul>
      {templates.length > 0 && students.length > 0 ? (
        <form onSubmit={(event) => void create(event)} className="flex flex-wrap items-end gap-2 rounded-2xl border-[1.5px] border-line bg-card p-4">
          <label className="text-sm font-semibold">მოსწავლე
            <select value={studentId} onChange={(event) => setStudentId(event.target.value)} className="mt-1 h-11 rounded-xl border-[1.5px] border-sand bg-paper px-3">
              {students.map((student) => <option key={student.id} value={student.id}>{student.name}</option>)}
            </select>
          </label>
          <label className="text-sm font-semibold">შაბლონი
            <select value={templateId} onChange={(event) => setTemplateId(event.target.value)} className="mt-1 h-11 rounded-xl border-[1.5px] border-sand bg-paper px-3">
              {templates.map((template) => <option key={template.id} value={template.id}>{template.title}</option>)}
            </select>
          </label>
          <label className="text-sm font-semibold">თარიღი
            <input type="datetime-local" value={date} onChange={(event) => setDate(event.target.value)} required className="mt-1 h-11 rounded-xl border-[1.5px] border-sand px-3" />
          </label>
          <button type="submit" className="h-11 rounded-xl bg-teal-deep px-4 font-semibold text-on-dark">გაკვეთილის შექმნა</button>
          {error ? <p className="w-full text-sm text-burgundy">{error}</p> : null}
        </form>
      ) : null}
    </div>
  );
}
