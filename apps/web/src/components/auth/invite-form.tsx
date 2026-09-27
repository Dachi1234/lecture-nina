"use client";

import { useState } from "react";
import Link from "next/link";
import { Button, Field, Input } from "@nina/ui";

export function InviteForm({ token }: { token: string }) {
  const [password, setPassword] = useState("");
  const [again, setAgain] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (password.length < 8) {
      setError("პაროლი მინიმუმ 8 სიმბოლოა.");
      return;
    }
    if (password !== again) {
      setError("პაროლები არ ემთხვევა.");
      return;
    }
    setLoading(true);
    setError("");
    const response = await fetch("/v1/auth/invite/accept", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    setLoading(false);
    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: { messageKa?: string } } | null;
      setError(body?.error?.messageKa ?? "მოწვევის ბმული აღარ მოქმედებს.");
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-lg leading-relaxed">პაროლი შეინახა. ახლა შედი კაბინეტში.</p>
        <Link href="/login" className="font-semibold text-teal-deep">
          შესვლა
        </Link>
      </div>
    );
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={onSubmit}>
      <Field id="password" label="პაროლი">
        <Input id="password" type="password" autoComplete="new-password" required value={password} onChange={(event) => setPassword(event.target.value)} />
      </Field>
      <Field id="again" label="გაიმეორე პაროლი">
        <Input id="again" type="password" autoComplete="new-password" required value={again} onChange={(event) => setAgain(event.target.value)} />
      </Field>
      <Button type="submit" size="l" loading={loading} className="w-full">
        ანგარიშის გახსნა
      </Button>
      {error ? <p className="text-[13px] font-medium text-burgundy">{error}</p> : null}
    </form>
  );
}
