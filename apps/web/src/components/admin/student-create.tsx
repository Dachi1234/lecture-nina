"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Field, Input } from "@nina/ui";
import { Dialog } from "@/components/admin/dialog";
import { send } from "@/lib/client";

export function StudentCreate({ courses, groups }: { courses: { id: string; title: string }[]; groups: { id: string; name: string }[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", nameLatin: "", email: "", phone: "", courseId: courses[0]?.id ?? "", groupId: "" });
  const [created, setCreated] = useState<{ id: string; url: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const result = await send<{ id: string; url: string }>("POST", "/v1/admin/students", { ...form, groupId: form.groupId || undefined });
    setBusy(false);
    if (!result.ok) return setError(result.message);
    setCreated(result.data);
    router.refresh();
  }

  function close() {
    setOpen(false);
    setCreated(null);
    setForm({ name: "", nameLatin: "", email: "", phone: "", courseId: courses[0]?.id ?? "", groupId: "" });
  }

  const select = "h-[52px] rounded-xl border-[1.5px] border-sand bg-card px-3 font-normal";

  return (
    <>
      <Button onClick={() => setOpen(true)}>+ მოსწავლის დამატება</Button>
      <Dialog open={open} onClose={close} title="ახალი მოსწავლე">
        {created ? (
          <div className="flex flex-col gap-4">
            <p>მოსწავლე დაემატა. გაუგზავნე ეს ბმული — მასზე თვითონ დააყენებს პაროლს (მოქმედებს 7 დღე):</p>
            <p className="rounded-xl bg-teal-soft p-3 text-sm break-all text-teal-deep">{created.url}</p>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => void navigator.clipboard.writeText(created.url)}>ბმულის კოპირება</Button>
              <Link href={`/admin/students/${created.id}`} className="inline-flex h-12 items-center rounded-xl border-[1.5px] border-teal-deep px-6 text-[15px] font-semibold text-teal-deep">
                მოსწავლის გვერდი →
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={(event) => void submit(event)} className="flex flex-col gap-4">
            <Field id="student-name" label="სახელი და გვარი">
              <Input id="student-name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
            </Field>
            <Field id="student-latin" label="სახელი ლათინურად" hint="(მისალმებისთვის: ¡Hola, Mariam!)">
              <Input id="student-latin" value={form.nameLatin} onChange={(event) => setForm({ ...form, nameLatin: event.target.value })} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="student-email" label="ელ-ფოსტა">
                <Input id="student-email" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required />
              </Field>
              <Field id="student-phone" label="ტელეფონი" hint="(არასავალდებულო)">
                <Input id="student-phone" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5 text-sm font-semibold">
                კურსი
                <select className={select} value={form.courseId} onChange={(event) => setForm({ ...form, courseId: event.target.value })}>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.title}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1.5 text-sm font-semibold">
                ჯგუფი
                <select className={select} value={form.groupId} onChange={(event) => setForm({ ...form, groupId: event.target.value })}>
                  <option value="">ინდივიდუალური</option>
                  {groups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            {error ? <p className="text-sm font-medium text-burgundy">{error}</p> : null}
            <Button type="submit" loading={busy} disabled={!form.name.trim() || !form.email.includes("@")}>
              დამატება და მოწვევის ბმული
            </Button>
          </form>
        )}
      </Dialog>
    </>
  );
}
