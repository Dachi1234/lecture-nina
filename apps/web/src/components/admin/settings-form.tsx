"use client";

import { useState, type FormEvent } from "react";

const fields = [
  ["price_gel", "ფასი (ლარი)", "number"],
  ["lesson_minutes", "გაკვეთილის ხანგრძლივობა (წუთი)", "number"],
  ["gift_lessons", "საჩუქარი გაკვეთილები", "number"],
  ["checkpoint_pass", "შემოწმების ზღვარი", "number"],
  ["contact_email", "ელ-ფოსტა", "email"],
  ["contact_phone", "ტელეფონი", "text"],
  ["telegram", "Telegram", "text"],
  ["instagram_url", "Instagram", "url"],
  ["facebook_url", "Facebook", "url"],
  ["tiktok_url", "TikTok", "url"],
  ["lesson_platform", "გაკვეთილის პლატფორმა", "text"],
  ["lead_notify_email", "ლიდის შეტყობინება, ელ-ფოსტა", "email"],
  ["lead_notify_telegram", "ლიდის შეტყობინება, Telegram", "text"],
] as const;

export function SettingsForm({ values }: { values: Record<string, string | number | null> }) {
  const [state, setState] = useState(values);
  const [message, setMessage] = useState("");

  async function save(event: FormEvent) {
    event.preventDefault();
    const body: Record<string, string | number | null> = {};
    for (const [key, , kind] of fields) {
      const value = state[key];
      body[key] = kind === "number" && value !== null && value !== "" ? Number(value) : value ?? null;
    }
    const response = await fetch("/v1/admin/settings", {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setMessage(response.ok ? "შენახულია." : "ვერ შეინახა.");
  }

  return (
    <form onSubmit={(event) => void save(event)} className="grid max-w-xl gap-3">
      {fields.map(([key, label, kind]) => (
        <label key={key} className="text-sm font-semibold">
          {label}
          <input
            type={kind === "number" ? "number" : "text"}
            step={key === "checkpoint_pass" ? "0.05" : undefined}
            value={state[key] ?? ""}
            onChange={(event) => setState({ ...state, [key]: event.target.value })}
            className="mt-1 h-11 w-full rounded-xl border-[1.5px] border-sand bg-card px-3 font-medium"
          />
        </label>
      ))}
      <button type="submit" className="h-11 w-fit rounded-xl bg-teal-deep px-4 font-semibold text-on-dark">შენახვა</button>
      {message ? <p className="text-sm">{message}</p> : null}
    </form>
  );
}
