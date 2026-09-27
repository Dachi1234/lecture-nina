"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export function StudentCreate() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [invite, setInvite] = useState("");
  const [error, setError] = useState("");

  async function create(event: FormEvent) {
    event.preventDefault();
    setError("");
    const response = await fetch("/v1/admin/students", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, phone }),
    });
    const body = (await response.json().catch(() => null)) as { url?: string; error?: { messageKa?: string } } | null;
    if (!response.ok) {
      setError(body?.error?.messageKa ?? "ვერ შეიქმნა.");
      return;
    }
    setInvite(body?.url ?? "");
    setName("");
    setEmail("");
    setPhone("");
    router.refresh();
  }

  return (
    <form onSubmit={(event) => void create(event)} className="flex flex-wrap items-end gap-2 rounded-2xl border-[1.5px] border-line bg-card p-4">
      <label className="flex flex-col gap-1 text-sm font-semibold">სახელი<input value={name} onChange={(event) => setName(event.target.value)} required className="h-11 rounded-xl border-[1.5px] border-sand px-3 font-medium" /></label>
      <label className="flex flex-col gap-1 text-sm font-semibold">ელ-ფოსტა<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required className="h-11 rounded-xl border-[1.5px] border-sand px-3 font-medium" /></label>
      <label className="flex flex-col gap-1 text-sm font-semibold">ტელეფონი<input value={phone} onChange={(event) => setPhone(event.target.value)} className="h-11 rounded-xl border-[1.5px] border-sand px-3 font-medium" /></label>
      <button type="submit" className="h-11 rounded-xl bg-teal-deep px-4 font-semibold text-on-dark">მოსწავლის დამატება</button>
      {invite ? <p className="w-full break-all text-sm text-teal-deep">მოწვევა: {invite}</p> : null}
      {error ? <p className="w-full text-sm text-burgundy">{error}</p> : null}
    </form>
  );
}
