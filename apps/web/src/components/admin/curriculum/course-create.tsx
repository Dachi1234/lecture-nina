"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button, Field, Input, Textarea } from "@nina/ui";
import { Dialog } from "@/components/admin/dialog";
import { send } from "@/lib/client";

export function CourseCreate() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [level, setLevel] = useState("");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const result = await send<{ id: string }>("POST", "/v1/admin/courses", { title, level, descriptionKa: description });
    setBusy(false);
    if (!result.ok) return setError(result.message);
    router.push(`/admin/curriculum/${result.data.id}`);
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>+ ახალი კურსი</Button>
      <Dialog open={open} onClose={() => setOpen(false)} title="ახალი კურსი">
        <form onSubmit={(event) => void submit(event)} className="flex flex-col gap-4">
          <Field id="course-title" label="სახელი">
            <Input id="course-title" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="მაგ. ესპანური A2" required />
          </Field>
          <Field id="course-level" label="დონე" hint="(არასავალდებულო)">
            <Input id="course-level" value={level} onChange={(event) => setLevel(event.target.value)} placeholder="A2" />
          </Field>
          <Field id="course-description" label="მოკლე აღწერა" hint="(არასავალდებულო)">
            <Textarea id="course-description" value={description} onChange={(event) => setDescription(event.target.value)} />
          </Field>
          {error ? <p className="text-sm font-medium text-burgundy">{error}</p> : null}
          <Button type="submit" loading={busy} disabled={!title.trim()}>
            შექმნა
          </Button>
        </form>
      </Dialog>
    </>
  );
}
