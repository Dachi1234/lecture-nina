"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, Field, Input } from "@nina/ui";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(false);
    const response = await fetch("/v1/auth/sign-in/email", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    setLoading(false);
    if (!response.ok) {
      setError(true);
      return;
    }
    const me = await fetch("/v1/me", { credentials: "include" });
    const body = me.ok ? ((await me.json()) as { role?: string }) : null;
    const next = params.get("next");
    if (body?.role === "ADMIN") router.push(next?.startsWith("/admin") ? next : "/admin");
    else router.push(next?.startsWith("/app") ? next : "/app");
    router.refresh();
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={onSubmit}>
      <Field id="email" label="ელ-ფოსტა">
        <Input
          id="email"
          type="email"
          autoComplete="email"
          required
          invalid={error}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </Field>
      <Field id="password" label="პაროლი">
        <div className="relative">
          <Input
            id="password"
            type={show ? "text" : "password"}
            autoComplete="current-password"
            required
            invalid={error}
            value={password}
            className="pr-14"
            onChange={(event) => setPassword(event.target.value)}
          />
          <button
            type="button"
            className="absolute top-1 right-1 flex size-11 items-center justify-center rounded-lg text-sm font-semibold text-ink-muted"
            aria-label={show ? "პაროლის დამალვა" : "პაროლის ჩვენება"}
            onClick={() => setShow((value) => !value)}
          >
            {show ? "დამალე" : "აჩვენე"}
          </button>
        </div>
      </Field>
      <Link href="/forgot" className="self-end text-sm font-semibold text-teal-deep">
        დაგავიწყდა პაროლი?
      </Link>
      <Button type="submit" size="l" loading={loading} className="w-full">
        შესვლა
      </Button>
      {error ? <p className="text-[13px] font-medium text-burgundy">ელ-ფოსტა ან პაროლი არასწორია</p> : null}
      <div className="flex gap-3 rounded-xl bg-teal-soft p-4 text-sm leading-relaxed">
        <p>
          ანგარიშს ნინა გიქმნის — რეგისტრაცია საჭირო არ არის. ჯერ არ გაქვს?{" "}
          <Link href="/?book=1&source=menu" className="font-semibold text-teal-deep">
            დაჯავშნე საცდელი გაკვეთილი
          </Link>
        </p>
      </div>
    </form>
  );
}
