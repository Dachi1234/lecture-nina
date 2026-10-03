"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button, ChoiceChip, Field, Input } from "@nina/ui";
import { Dialog } from "@/components/admin/dialog";
import { send } from "@/lib/client";

export function GroupCreate({ courses, students }: { courses: { id: string; title: string }[]; students: { id: string; name: string }[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [courseId, setCourseId] = useState(courses[0]?.id ?? "");
  const [members, setMembers] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const result = await send<{ id: string }>("POST", "/v1/admin/groups", { name, courseId: courseId || null, studentIds: members });
    setBusy(false);
    if (!result.ok) return setError(result.message);
    router.push(`/admin/groups/${result.data.id}`);
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>+ ახალი ჯგუფი</Button>
      <Dialog open={open} onClose={() => setOpen(false)} title="ახალი ჯგუფი">
        <form onSubmit={(event) => void submit(event)} className="flex flex-col gap-4">
          <Field id="group-name" label="სახელი">
            <Input id="group-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="მაგ. საღამოს ჯგუფი" />
          </Field>
          <label className="flex flex-col gap-1.5 text-sm font-semibold">
            კურსი
            <select className="h-[52px] rounded-xl border-[1.5px] border-sand bg-card px-3 font-normal" value={courseId} onChange={(event) => setCourseId(event.target.value)}>
              <option value="">კურსის გარეშე</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
          </label>
          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold">წევრები · {members.length}</p>
            <div className="flex flex-wrap gap-2">
              {students.map((student) => {
                const on = members.includes(student.id);
                return (
                  <ChoiceChip key={student.id} pressed={on} onClick={() => setMembers(on ? members.filter((id) => id !== student.id) : [...members, student.id])}>
                    {student.name}
                  </ChoiceChip>
                );
              })}
            </div>
          </div>
          {error ? <p className="text-sm font-medium text-burgundy">{error}</p> : null}
          <Button type="submit" loading={busy} disabled={!name.trim()}>
            შექმნა
          </Button>
        </form>
      </Dialog>
    </>
  );
}
