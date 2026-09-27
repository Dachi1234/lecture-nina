"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

type Word = {
  id: string;
  es: string;
  ka: string;
  en: string | null;
  pronunciation: string | null;
  category: string | null;
  personalLabel: string | null;
  personal: boolean;
  topic: { number: number; titleKa: string } | null;
  duplicate: boolean;
};

export function VocabTable({ items }: { items: Word[] }) {
  const router = useRouter();
  const [es, setEs] = useState("");
  const [ka, setKa] = useState("");
  const [en, setEn] = useState("");
  const [paste, setPaste] = useState("");
  const [error, setError] = useState("");

  async function add(event: FormEvent) {
    event.preventDefault();
    const response = await fetch("/v1/admin/vocabulary", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ es, ka, en }),
    });
    if (!response.ok) {
      setError("ვერ დაემატა.");
      return;
    }
    setEs("");
    setKa("");
    setEn("");
    router.refresh();
  }

  async function importRows() {
    const rows = paste
      .split(/\r?\n/)
      .map((line) => line.split("\t").map((cell) => cell.trim()))
      .filter((cells) => cells[0] && cells[1])
      .map((cells) => ({ es: cells[0], ka: cells[1], en: cells[2] || undefined, category: cells[3] || undefined }));
    const response = await fetch("/v1/admin/vocabulary/import", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rows }),
    });
    if (!response.ok) {
      setError("იმპორტი ვერ შესრულდა.");
      return;
    }
    setPaste("");
    router.refresh();
  }

  function download() {
    const lines = ["es\tka\ten\tcategory", ...items.map((item) => [item.es, item.ka, item.en ?? "", item.category ?? ""].join("\t"))];
    const blob = new Blob([lines.join("\n")], { type: "text/tab-separated-values" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "vocabulary.tsv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={(event) => void add(event)} className="flex flex-wrap items-end gap-2">
        <label className="text-sm font-semibold">ესპანური<input value={es} onChange={(event) => setEs(event.target.value)} required className="mt-1 h-11 rounded-xl border-[1.5px] border-sand bg-card px-3 font-medium" /></label>
        <label className="text-sm font-semibold">ქართული<input value={ka} onChange={(event) => setKa(event.target.value)} required className="mt-1 h-11 rounded-xl border-[1.5px] border-sand bg-card px-3 font-medium" /></label>
        <label className="text-sm font-semibold">ინგლისური<input value={en} onChange={(event) => setEn(event.target.value)} className="mt-1 h-11 rounded-xl border-[1.5px] border-sand bg-card px-3 font-medium" /></label>
        <button type="submit" className="h-11 rounded-xl bg-teal-deep px-4 font-semibold text-on-dark">დამატება</button>
        <button type="button" className="h-11 rounded-xl border-[1.5px] border-teal-deep px-4 font-semibold text-teal-deep" onClick={download}>გადმოწერა</button>
      </form>
      <div className="flex flex-col gap-2">
        <textarea value={paste} onChange={(event) => setPaste(event.target.value)} rows={3} placeholder="es	ka	en" className="rounded-xl border-[1.5px] border-sand bg-card px-3 py-2" />
        <button type="button" className="h-11 w-fit rounded-xl border-[1.5px] border-teal-deep px-4 font-semibold text-teal-deep" onClick={() => void importRows()}>იმპორტი</button>
      </div>
      {error ? <p className="text-sm text-burgundy">{error}</p> : null}
      <div className="overflow-x-auto rounded-2xl border-[1.5px] border-line bg-card">
        <table className="w-full text-left text-sm">
          <thead className="bg-paper-deep text-ink-muted">
            <tr>
              <th className="px-3 py-2">ესპანური</th>
              <th className="px-3 py-2">ქართული</th>
              <th className="px-3 py-2">ინგლისური</th>
              <th className="px-3 py-2">თემა</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <WordRow key={item.id} item={item} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function WordRow({ item }: { item: Word }) {
  const router = useRouter();
  const [es, setEs] = useState(item.es);
  const [ka, setKa] = useState(item.ka);
  const [en, setEn] = useState(item.en ?? "");

  async function save() {
    await fetch(`/v1/admin/vocabulary/${item.id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ es, ka, en }),
    });
    router.refresh();
  }

  async function remove() {
    await fetch(`/v1/admin/vocabulary/${item.id}`, { method: "DELETE", credentials: "include" });
    router.refresh();
  }

  return (
    <tr className="border-t border-line-soft">
      <td className="px-3 py-2"><input value={es} onChange={(event) => setEs(event.target.value)} className="h-10 w-full rounded-lg border border-sand px-2" /></td>
      <td className="px-3 py-2"><input value={ka} onChange={(event) => setKa(event.target.value)} className="h-10 w-full rounded-lg border border-sand px-2" /></td>
      <td className="px-3 py-2"><input value={en} onChange={(event) => setEn(event.target.value)} className="h-10 w-full rounded-lg border border-sand px-2" /></td>
      <td className="px-3 py-2 text-ink-muted">
        {item.topic ? `${item.topic.number}. ${item.topic.titleKa}` : item.personal ? item.personalLabel ?? "პირადი" : "—"}
        {item.duplicate ? <span className="ml-2 text-burgundy">დუბლიკატი</span> : null}
      </td>
      <td className="px-3 py-2">
        <button type="button" className="mr-2 font-semibold text-teal-deep" onClick={() => void save()}>შენახვა</button>
        <button type="button" className="text-burgundy" onClick={() => void remove()}>წაშლა</button>
      </td>
    </tr>
  );
}
