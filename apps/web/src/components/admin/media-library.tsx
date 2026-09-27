"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

type Asset = {
  id: string;
  kind: string;
  originalName: string;
  mime: string;
  sizeBytes: number;
  status: string;
};

export function MediaLibrary({ items }: { items: Asset[] }) {
  const router = useRouter();
  const [error, setError] = useState("");

  async function upload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const response = await fetch("/v1/admin/media", { method: "POST", credentials: "include", body: data });
    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: { messageKa?: string } } | null;
      setError(body?.error?.messageKa ?? "ატვირთვა ვერ შესრულდა.");
      return;
    }
    form.reset();
    router.refresh();
  }

  async function retry(id: string) {
    await fetch(`/v1/admin/media/${id}/retry`, { method: "POST", credentials: "include" });
    router.refresh();
  }

  async function remove(id: string) {
    const response = await fetch(`/v1/admin/media/${id}`, { method: "DELETE", credentials: "include" });
    if (response.status === 409) {
      setError("ეს ფაილი მასალაში გამოიყენება.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={(event) => void upload(event)} className="flex flex-wrap items-center gap-2">
        <input name="file" type="file" required className="text-sm" />
        <button type="submit" className="h-11 rounded-xl bg-teal-deep px-4 font-semibold text-on-dark">ატვირთვა</button>
      </form>
      {error ? <p className="text-sm text-burgundy">{error}</p> : null}
      <ul className="flex flex-col gap-2">
        {items.map((item) => (
          <li key={item.id} className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border-[1.5px] border-line bg-card px-4 py-3 text-sm">
            <div>
              <p className="font-semibold">{item.originalName}</p>
              <p className="text-ink-muted">{item.kind} · {item.status} · {Math.ceil(item.sizeBytes / 1024)} კბ</p>
            </div>
            <div className="flex gap-2">
              {item.status === "FAILED" ? (
                <button type="button" className="h-10 rounded-xl px-3 font-semibold text-teal-deep" onClick={() => void retry(item.id)}>თავიდან</button>
              ) : null}
              <button type="button" className="h-10 rounded-xl px-3 text-burgundy" onClick={() => void remove(item.id)}>წაშლა</button>
            </div>
          </li>
        ))}
        {items.length === 0 ? <li className="text-ink-muted">ფაილები ჯერ არ არის.</li> : null}
      </ul>
    </div>
  );
}
