"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button, Field, Input } from "@nina/ui";

export function ResetForm() {
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [again, setAgain] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!token) {
      setError("ბმული არასწორია ან ვადა გაუვიდა.");
      return;
    }
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
    const response = await fetch("/v1/auth/reset-password", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newPassword: password, token }),
    });
    setLoading(false);
    if (!response.ok) {
      setError("ბმული არასწორია ან ვადა გაუვიდა.");
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
      <Field id="password" label="ახალი პაროლი">
        <Input id="password" type="password" autoComplete="new-password" required value={password} onChange={(event) => setPassword(event.target.value)} />
      </Field>
      <Field id="again" label="გაიმეორე პაროლი">
        <Input id="again" type="password" autoComplete="new-password" required value={again} onChange={(event) => setAgain(event.target.value)} />
      </Field>
      <Button type="submit" size="l" loading={loading} className="w-full">
        შენახვა
      </Button>
      {error ? <p className="text-[13px] font-medium text-burgundy">{error}</p> : null}
    </form>
  );
}
