"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, ChoiceChip } from "@nina/ui";
import { send } from "@/lib/client";

type GroupState = { id: string; name: string; noteKa: string | null; isArchived: boolean; courseId: string; memberIds: string[] };

const field = "rounded-xl border-[1.5px] border-sand bg-card px-3 text-[15px] outline-none focus:border-teal-deep focus:ring-4 focus:ring-teal-soft";

export function GroupSettings({ group, courses, students }: { group: GroupState; courses: { id: string; title: string }[]; students: { id: string; name: string }[] }) {
  const router = useRouter();
  const [name, setName] = useState(group.name);
  const [courseId, setCourseId] = useState(group.courseId);
  const [noteKa, setNoteKa] = useState(group.noteKa ?? "");
  const [members, setMembers] = useState(group.memberIds);
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const membersDirty = members.length !== group.memberIds.length || members.some((id) => !group.memberIds.includes(id));
  const metaDirty = name !== group.name || courseId !== group.courseId || noteKa !== (group.noteKa ?? "");

  async function call(key: string, method: "PATCH" | "PUT", path: string, body: unknown) {
    setBusy(key);
    setError("");
    setMessage("");
    const result = await send(method, path, body);
    setBusy(null);
    if (!result.ok) return setError(result.message);
    setMessage("შენახულია");
    router.refresh();
  }

  return (
    <aside className="flex flex-col gap-4 xl:sticky xl:top-6">
      <div className="flex flex-col gap-3 rounded-2xl border-[1.5px] border-line bg-card p-5">
        <p className="font-bold">წევრები · {members.length}</p>
        <div className="flex flex-wrap gap-2">
          {students.map((student) => {
            const on = members.includes(student.id);
            return (
              <ChoiceChip key={student.id} pressed={on} className="h-10 text-sm" onClick={() => setMembers(on ? members.filter((id) => id !== student.id) : [...members, student.id])}>
                {student.name}
              </ChoiceChip>
            );
          })}
        </div>
        <div className="flex flex-col gap-1">
          {group.memberIds.map((id) => {
            const student = students.find((row) => row.id === id);
            return student ? (
              <Link key={id} href={`/admin/students/${id}`} className="text-sm font-semibold text-teal-deep">
                {student.name} →
              </Link>
            ) : null;
          })}
        </div>
        <Button size="s" disabled={!membersDirty} loading={busy === "members"} onClick={() => void call("members", "PUT", `/v1/admin/groups/${group.id}/members`, { studentIds: members })}>
          წევრების შენახვა
        </Button>
        <p className="text-[13px] text-ink-muted">ახალი წევრი ჯგუფის ყველა გაგზავნილ გაკვეთილს დაინახავს.</p>
      </div>
      <div className="flex flex-col gap-3 rounded-2xl border-[1.5px] border-line bg-card p-5">
        <p className="font-bold">პარამეტრები</p>
        <label className="flex flex-col gap-1 text-sm font-semibold">
          სახელი
          <input className={`${field} h-11 font-normal`} value={name} onChange={(event) => setName(event.target.value)} />
        </label>
        <label className="flex flex-col gap-1 text-sm font-semibold">
          კურსი
          <select className={`${field} h-11 font-normal`} value={courseId} onChange={(event) => setCourseId(event.target.value)}>
            <option value="">კურსის გარეშე</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm font-semibold">
          შენიშვნა <span className="font-normal text-ink-muted">(მხოლოდ შენ)</span>
          <textarea className={`${field} min-h-20 py-2 font-normal`} value={noteKa} onChange={(event) => setNoteKa(event.target.value)} />
        </label>
        <div className="flex flex-wrap gap-2">
          <Button size="s" disabled={!metaDirty} loading={busy === "meta"} onClick={() => void call("meta", "PATCH", `/v1/admin/groups/${group.id}`, { name, courseId: courseId || null, noteKa })}>
            შენახვა
          </Button>
          <Button size="s" variant="text" loading={busy === "archive"} onClick={() => void call("archive", "PATCH", `/v1/admin/groups/${group.id}`, { isArchived: !group.isArchived })}>
            {group.isArchived ? "არქივიდან დაბრუნება" : "არქივში"}
          </Button>
        </div>
      </div>
      {message ? <p className="px-1 text-sm text-sage-ink">{message}</p> : null}
      {error ? <p className="rounded-xl bg-burgundy-soft px-4 py-3 text-sm font-medium text-burgundy">{error}</p> : null}
    </aside>
  );
}
