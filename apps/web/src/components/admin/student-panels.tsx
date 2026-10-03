"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Button, ChoiceChip, Icon } from "@nina/ui";
import { send } from "@/lib/client";
import { shortDate } from "@/lib/dates";

const field = "rounded-xl border-[1.5px] border-sand bg-card px-3 text-[15px] outline-none focus:border-teal-deep focus:ring-4 focus:ring-teal-soft";

function useCall() {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  async function call<T>(key: string, method: "POST" | "PATCH" | "PUT" | "DELETE", path: string, body?: unknown) {
    setBusy(key);
    setError("");
    const result = await send<T>(method, path, body);
    setBusy(null);
    if (!result.ok) {
      setError(result.message);
      return null;
    }
    router.refresh();
    return result.data;
  }
  return { busy, error, call };
}

function Panel({ title, hint, children, error }: { title: string; hint?: string; children: ReactNode; error?: string }) {
  return (
    <section className="flex flex-col gap-3 rounded-2xl border-[1.5px] border-line bg-card p-5">
      <div>
        <h2 className="text-lg font-bold">{title}</h2>
        {hint ? <p className="text-sm text-ink-muted">{hint}</p> : null}
      </div>
      {children}
      {error ? <p className="text-sm font-medium text-burgundy">{error}</p> : null}
    </section>
  );
}

function RemoveButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" aria-label={label} onClick={onClick} className="flex size-11 shrink-0 items-center justify-center rounded-xl text-ink-muted hover:bg-line-soft hover:text-burgundy">
      <Icon name="close" width={16} height={16} />
    </button>
  );
}

export function InviteButton({ studentId, accepted }: { studentId: string; accepted: boolean }) {
  const [url, setUrl] = useState("");
  const { busy, error, call } = useCall();
  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        variant="outline"
        loading={busy === "invite"}
        onClick={async () => {
          const data = await call<{ url: string }>("invite", "POST", `/v1/admin/students/${studentId}/invite`);
          if (data) {
            setUrl(data.url);
            void navigator.clipboard?.writeText(data.url).catch(() => undefined);
          }
        }}
      >
        {accepted ? "პაროლის აღდგენის ბმული" : "მოწვევის ბმული"}
      </Button>
      {url ? <p className="max-w-sm text-right text-[13px] break-all text-teal-deep">დაკოპირდა: {url}</p> : null}
      {error ? <p className="text-[13px] text-burgundy">{error}</p> : null}
    </div>
  );
}

export function NotesPanel({ studentId, notes }: { studentId: string; notes: { id: string; body: string; visibleToStudent: boolean; createdAt: string }[] }) {
  const [body, setBody] = useState("");
  const [visible, setVisible] = useState(true);
  const { busy, error, call } = useCall();

  async function add(event: FormEvent) {
    event.preventDefault();
    if (await call("add", "POST", `/v1/admin/students/${studentId}/notes`, { body, visibleToStudent: visible })) setBody("");
  }

  return (
    <Panel title="შენიშვნები" hint="ხილული შენიშვნა მოსწავლის მთავარ გვერდზე ჩანს (ბოლო ერთი)." error={error}>
      <form onSubmit={(event) => void add(event)} className="flex flex-col gap-2">
        <textarea aria-label="შენიშვნა" value={body} onChange={(event) => setBody(event.target.value)} rows={3} className={`${field} py-2`} />
        <div className="flex flex-wrap items-center gap-2">
          <ChoiceChip pressed={visible} onClick={() => setVisible(true)}>
            მოსწავლისთვის
          </ChoiceChip>
          <ChoiceChip pressed={!visible} onClick={() => setVisible(false)}>
            მხოლოდ ჩემთვის
          </ChoiceChip>
          <Button type="submit" size="s" className="ml-auto" loading={busy === "add"} disabled={!body.trim()}>
            დამატება
          </Button>
        </div>
      </form>
      <ul className="flex flex-col gap-2">
        {notes.map((note) => (
          <li key={note.id} className={`flex items-start gap-2 rounded-xl px-3 py-2 ${note.visibleToStudent ? "bg-teal-soft" : "bg-paper-deep"}`}>
            <div className="min-w-0 flex-1">
              <p className="text-[15px] leading-relaxed whitespace-pre-line">{note.body}</p>
              <p className="text-[13px] text-ink-muted">
                {note.visibleToStudent ? "მოსწავლე ხედავს" : "პირადი"} · {shortDate(note.createdAt)}
              </p>
            </div>
            <RemoveButton label="წაშლა" onClick={() => void call("del", "DELETE", `/v1/admin/students/${studentId}/notes/${note.id}`)} />
          </li>
        ))}
      </ul>
    </Panel>
  );
}

export function ChecklistPanel({ studentId, items }: { studentId: string; items: { id: string; text: string; done: boolean }[] }) {
  const [text, setText] = useState("");
  const { busy, error, call } = useCall();

  async function add(event: FormEvent) {
    event.preventDefault();
    if (await call("add", "POST", `/v1/admin/students/${studentId}/checklist`, { text })) setText("");
  }

  return (
    <Panel title="სამუშაო სია" hint="რაზე უნდა იმუშაოს — მხოლოდ შენ ხედავ." error={error}>
      <form onSubmit={(event) => void add(event)} className="flex gap-2">
        <input aria-label="ახალი პუნქტი" value={text} onChange={(event) => setText(event.target.value)} className={`${field} h-11 flex-1`} placeholder="მაგ. ser / estar განსხვავება" />
        <Button type="submit" size="s" className="h-11" loading={busy === "add"} disabled={!text.trim()}>
          დამატება
        </Button>
      </form>
      <ul className="flex flex-col">
        {items.map((item) => (
          <li key={item.id} className="flex items-center gap-2 border-b border-line-soft py-1 last:border-b-0">
            <button
              type="button"
              aria-pressed={item.done}
              onClick={() => void call("toggle", "PATCH", `/v1/admin/students/${studentId}/checklist/${item.id}`, { done: !item.done })}
              className="flex min-h-11 flex-1 items-center gap-3 text-left text-[15px]"
            >
              <span className={`flex size-6 shrink-0 items-center justify-center rounded-md border-2 ${item.done ? "border-sage bg-sage text-on-dark" : "border-sand"}`} aria-hidden>
                {item.done ? <Icon name="check" width={14} height={14} /> : null}
              </span>
              <span className={item.done ? "text-ink-muted line-through" : ""}>{item.text}</span>
            </button>
            <RemoveButton label="წაშლა" onClick={() => void call("del", "DELETE", `/v1/admin/students/${studentId}/checklist/${item.id}`)} />
          </li>
        ))}
      </ul>
    </Panel>
  );
}

export function WordsPanel({ studentId, words }: { studentId: string; words: { id: string; es: string; ka: string | null; en: string | null; noteKa: string | null }[] }) {
  const [form, setForm] = useState({ es: "", ka: "", en: "", noteKa: "" });
  const { busy, error, call } = useCall();

  async function add(event: FormEvent) {
    event.preventDefault();
    if (await call("add", "POST", `/v1/admin/students/${studentId}/words`, form)) setForm({ es: "", ka: "", en: "", noteKa: "" });
  }

  return (
    <Panel title="პირადი სიტყვები" hint="ჩანს მოსწავლის „ლექსიკა“ გვერდზე, ბლოკში „ნინამ შენთვის დაამატა“." error={error}>
      <form onSubmit={(event) => void add(event)} className="grid gap-2 sm:grid-cols-[1fr_1fr_1fr_auto]">
        <input aria-label="ესპანურად" placeholder="ესპანურად" lang="es" value={form.es} onChange={(event) => setForm({ ...form, es: event.target.value })} className={`${field} h-11`} />
        <input aria-label="ქართულად" placeholder="ქართულად" value={form.ka} onChange={(event) => setForm({ ...form, ka: event.target.value })} className={`${field} h-11`} />
        <input aria-label="ინგლისურად" placeholder="ინგლისურად (არასავალდ.)" lang="en" value={form.en} onChange={(event) => setForm({ ...form, en: event.target.value })} className={`${field} h-11`} />
        <Button type="submit" size="s" className="h-11" loading={busy === "add"} disabled={!form.es.trim() || !form.ka.trim()}>
          დამატება
        </Button>
        <input aria-label="შენიშვნა" placeholder="შენიშვნა (არასავალდებულო)" value={form.noteKa} onChange={(event) => setForm({ ...form, noteKa: event.target.value })} className={`${field} h-11 sm:col-span-3`} />
      </form>
      <ul className="flex flex-col">
        {words.length === 0 ? <li className="text-sm text-ink-muted">ჯერ არ არის.</li> : null}
        {words.map((word) => (
          <li key={word.id} className="flex items-center gap-3 border-b border-line-soft py-1.5 last:border-b-0">
            <span className="min-w-0 flex-1">
              <span className="font-bold" lang="es">
                {word.es}
              </span>
              <span className="text-ink"> · {[word.ka, word.en].filter(Boolean).join(" · ")}</span>
              {word.noteKa ? <span className="block text-[13px] text-ink-muted">{word.noteKa}</span> : null}
            </span>
            <RemoveButton label="წაშლა" onClick={() => void call("del", "DELETE", `/v1/admin/students/${studentId}/words/${word.id}`)} />
          </li>
        ))}
      </ul>
    </Panel>
  );
}

export function ProfilePanel({
  student,
}: {
  student: { id: string; name: string; nameLatin: string | null; phone: string | null; greetingForm: string; giftLessonsLeft: number; isActive: boolean; goal: string | null; goalNote: string | null };
}) {
  const [form, setForm] = useState({
    name: student.name,
    nameLatin: student.nameLatin ?? "",
    phone: student.phone ?? "",
    greetingForm: student.greetingForm,
    giftLessonsLeft: String(student.giftLessonsLeft),
  });
  const [saved, setSaved] = useState(false);
  const { busy, error, call } = useCall();

  async function save(event: FormEvent) {
    event.preventDefault();
    setSaved(false);
    const ok = await call("save", "PATCH", `/v1/admin/students/${student.id}`, {
      name: form.name,
      nameLatin: form.nameLatin || null,
      phone: form.phone || null,
      greetingForm: form.greetingForm,
      giftLessonsLeft: Number(form.giftLessonsLeft) || 0,
    });
    if (ok) setSaved(true);
  }

  return (
    <Panel title="პროფილი" error={error}>
      {student.goal || student.goalNote ? (
        <p className="rounded-xl bg-paper-deep px-3 py-2 text-sm">
          მიზანი: {student.goal ?? "—"}
          {student.goalNote ? ` · ${student.goalNote}` : ""}
        </p>
      ) : null}
      <form onSubmit={(event) => void save(event)} className="flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-sm font-semibold">
          სახელი
          <input className={`${field} h-11 font-normal`} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
        </label>
        <label className="flex flex-col gap-1 text-sm font-semibold">
          სახელი ლათინურად <span className="font-normal text-ink-muted">(¡Hola, …!)</span>
          <input className={`${field} h-11 font-normal`} value={form.nameLatin} onChange={(event) => setForm({ ...form, nameLatin: event.target.value })} />
        </label>
        <label className="flex flex-col gap-1 text-sm font-semibold">
          ტელეფონი
          <input className={`${field} h-11 font-normal`} value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
        </label>
        <div className="flex flex-col gap-1 text-sm font-semibold">
          მიმართვა
          <div className="flex gap-2">
            <ChoiceChip pressed={form.greetingForm === "feminine"} onClick={() => setForm({ ...form, greetingForm: "feminine" })}>
              ¡Bienvenida!
            </ChoiceChip>
            <ChoiceChip pressed={form.greetingForm === "masculine"} onClick={() => setForm({ ...form, greetingForm: "masculine" })}>
              ¡Bienvenido!
            </ChoiceChip>
          </div>
        </div>
        <label className="flex flex-col gap-1 text-sm font-semibold">
          დარჩენილი საჩუქარი გაკვეთილი
          <input type="number" min={0} className={`${field} h-11 w-32 font-normal`} value={form.giftLessonsLeft} onChange={(event) => setForm({ ...form, giftLessonsLeft: event.target.value })} />
        </label>
        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" size="s" loading={busy === "save"}>
            შენახვა
          </Button>
          {saved ? <span className="text-sm text-sage-ink">შენახულია</span> : null}
          <Button size="s" variant="text" className="ml-auto" loading={busy === "active"} onClick={() => void call("active", "PATCH", `/v1/admin/students/${student.id}`, { isActive: !student.isActive })}>
            {student.isActive ? "ანგარიშის შეჩერება" : "ანგარიშის აღდგენა"}
          </Button>
        </div>
      </form>
    </Panel>
  );
}

const enrollmentStatus = [
  { id: "ACTIVE", label: "აქტიური" },
  { id: "PAUSED", label: "პაუზა" },
  { id: "COMPLETED", label: "დასრულებული" },
];

export function EnrollmentPanel({ studentId, enrollments, courses }: { studentId: string; enrollments: { courseId: string; status: string }[]; courses: { id: string; title: string; isArchived: boolean }[] }) {
  const [rows, setRows] = useState(enrollments);
  const [adding, setAdding] = useState("");
  const { busy, error, call } = useCall();
  const available = courses.filter((course) => !course.isArchived && !rows.some((row) => row.courseId === course.id));
  const title = (courseId: string) => courses.find((course) => course.id === courseId)?.title ?? "კურსი";

  async function save(next: { courseId: string; status: string }[]) {
    setRows(next);
    await call("save", "PUT", `/v1/admin/students/${studentId}/enrollments`, { enrollments: next });
  }

  return (
    <Panel title="კურსები" hint="მოსწავლე ხედავს აქტიური კურსის სილაბუსს „პროგრესი“ გვერდზე." error={error}>
      <ul className="flex flex-col gap-2">
        {rows.length === 0 ? <li className="text-sm text-ink-muted">არცერთ კურსზე არ არის.</li> : null}
        {rows.map((row) => (
          <li key={row.courseId} className="flex flex-wrap items-center gap-2 rounded-xl bg-paper-deep px-3 py-2">
            <span className="min-w-0 flex-1 font-semibold">{title(row.courseId)}</span>
            <select aria-label="სტატუსი" value={row.status} onChange={(event) => void save(rows.map((item) => (item.courseId === row.courseId ? { ...item, status: event.target.value } : item)))} className="h-11 rounded-xl border-[1.5px] border-sand bg-card px-2 text-sm">
              {enrollmentStatus.map((status) => (
                <option key={status.id} value={status.id}>
                  {status.label}
                </option>
              ))}
            </select>
            <RemoveButton label="კურსიდან ამოღება" onClick={() => void save(rows.filter((item) => item.courseId !== row.courseId))} />
          </li>
        ))}
      </ul>
      {available.length ? (
        <div className="flex gap-2">
          <select aria-label="კურსის დამატება" value={adding} onChange={(event) => setAdding(event.target.value)} className={`${field} h-11 flex-1`}>
            <option value="">აირჩიე კურსი</option>
            {available.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </select>
          <Button
            size="s"
            className="h-11"
            disabled={!adding}
            loading={busy === "save"}
            onClick={() => {
              void save([...rows, { courseId: adding, status: "ACTIVE" }]);
              setAdding("");
            }}
          >
            დამატება
          </Button>
        </div>
      ) : null}
    </Panel>
  );
}
