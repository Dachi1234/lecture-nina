"use client";

import { useState } from "react";
import Link from "next/link";
import { Button, Field, Input } from "@nina/ui";

export function ForgotForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    await fetch("/v1/auth/forget-password", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, redirectTo: `${window.location.origin}/reset` }),
    });
    setLoading(false);
    setSent(true);
  }

  if (sent) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-lg leading-relaxed">თუ ანგარიში არსებობს, ბმულს გამოგიგზავნით.</p>
        <Link href="/login" className="font-semibold text-teal-deep">
          შესვლაზე დაბრუნება
        </Link>
      </div>
    );
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={onSubmit}>
      <Field id="email" label="ელ-ფოსტა">
        <Input id="email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
      </Field>
      <Button type="submit" size="l" loading={loading} className="w-full">
        ბმულის გაგზავნა
      </Button>
      <Link href="/login" className="text-sm font-semibold text-teal-deep">
        შესვლაზე დაბრუნება
      </Link>
    </form>
  );
}
