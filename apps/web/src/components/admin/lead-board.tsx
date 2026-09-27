"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { shortDate } from "@/lib/dates";

type Lead = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  channel: string;
  goal: string | null;
  days: string[];
  timeOfDay: string | null;
  note: string | null;
  adminNote: string | null;
  source: string | null;
  status: string;
  createdAt: string;
};

const statuses = ["NEW", "CONTACTED", "TRIAL_SCHEDULED", "TRIAL_DONE", "CONVERTED", "LOST"] as const;
const statusKa: Record<string, string> = {
  NEW: "ახალი",
  CONTACTED: "დაკავშირებული",
  TRIAL_SCHEDULED: "საცდელი დაგეგმილია",
  TRIAL_DONE: "საცდელი გაიარა",
  CONVERTED: "მოსწავლეა",
  LOST: "დაიკარგა",
};

export function LeadBoard({ leads }: { leads: Lead[] }) {
  return (
    <div className="flex flex-col gap-3">
      {leads.map((lead) => (
        <LeadCard key={lead.id} lead={lead} />
      ))}
      {leads.length === 0 ? <p className="text-ink-muted">ლიდები ჯერ არ არის.</p> : null}
    </div>
  );
}

function LeadCard({ lead }: { lead: Lead }) {
  const router = useRouter();
  const [status, setStatus] = useState(lead.status);
  const [note, setNote] = useState(lead.adminNote ?? "");
  const [email, setEmail] = useState(lead.email ?? "");
  const [invite, setInvite] = useState("");
  const [error, setError] = useState("");

  async function save(nextStatus = status, adminNote = note) {
    setError("");
    const response = await fetch(`/v1/admin/leads/${lead.id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus, adminNote }),
    });
    if (!response.ok) setError("ვერ შეინახა.");
    else router.refresh();
  }

  async function convert() {
    setError("");
    const response = await fetch(`/v1/admin/leads/${lead.id}/convert`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const body = (await response.json().catch(() => null)) as { url?: string; error?: { messageKa?: string } } | null;
    if (!response.ok) {
      setError(body?.error?.messageKa ?? "ვერ გადავიყვანე.");
      return;
    }
    setInvite(body?.url ?? "");
    router.refresh();
  }

  const phone = lead.phone.replace(/\D/g, "");
  return (
    <article className="rounded-2xl border-[1.5px] border-line bg-card p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">{lead.name}</h2>
          <p className="text-sm text-ink-muted">{shortDate(lead.createdAt)}{lead.source ? ` · ${lead.source}` : ""}</p>
        </div>
        <select
          value={status}
          onChange={(event) => {
            setStatus(event.target.value);
            void save(event.target.value, note);
          }}
          className="h-11 rounded-xl border-[1.5px] border-sand bg-paper px-3"
        >
          {statuses.map((item) => (
            <option key={item} value={item}>{statusKa[item]}</option>
          ))}
        </select>
      </div>
      <p className="mt-3 text-sm leading-relaxed">
        <a className="font-semibold text-teal-deep" href={`tel:${phone}`}>{lead.phone}</a>
        {" · "}
        <a className="text-teal-deep" href={`https://wa.me/${phone}`}>WhatsApp</a>
        {" · "}
        <a className="text-teal-deep" href={`https://t.me/+${phone}`}>Telegram</a>
        {lead.email ? ` · ${lead.email}` : ""}
      </p>
      <p className="mt-1 text-sm text-ink-muted">
        {lead.channel}{lead.goal ? ` · ${lead.goal}` : ""}{lead.days.length ? ` · ${lead.days.join(" ")}` : ""}{lead.timeOfDay ? ` · ${lead.timeOfDay}` : ""}
      </p>
      {lead.note ? <p className="mt-2 text-sm">{lead.note}</p> : null}
      <label className="mt-3 flex flex-col gap-1 text-sm font-semibold">
        შენიშვნა
        <textarea value={note} onChange={(event) => setNote(event.target.value)} onBlur={() => void save(status, note)} rows={2} className="rounded-xl border-[1.5px] border-sand px-3 py-2 font-medium" />
      </label>
      {lead.status !== "CONVERTED" ? (
        <div className="mt-3 flex flex-wrap items-end gap-2">
          <label className="flex flex-col gap-1 text-sm font-semibold">
            ელ-ფოსტა მოსწავლისთვის
            <input value={email} onChange={(event) => setEmail(event.target.value)} className="h-11 rounded-xl border-[1.5px] border-sand px-3 font-medium" />
          </label>
          <button type="button" className="h-11 rounded-xl bg-burgundy px-4 font-semibold text-on-dark" onClick={() => void convert()}>
            მოსწავლედ გადაყვანა
          </button>
        </div>
      ) : null}
      {invite ? <p className="mt-2 break-all text-sm text-teal-deep">მოწვევა: {invite}</p> : null}
      {error ? <p className="mt-2 text-sm text-burgundy">{error}</p> : null}
    </article>
  );
}
