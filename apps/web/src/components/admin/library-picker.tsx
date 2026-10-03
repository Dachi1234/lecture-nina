"use client";

import { useEffect, useState } from "react";
import { MATERIAL_CATALOG } from "@nina/contracts";
import { Button, IconTile } from "@nina/ui";
import { Dialog } from "@/components/admin/dialog";
import { load } from "@/lib/client";
import { groupTone, materialIcon, materialLabel } from "@/lib/materials";

export type PickedMaterial = { id: string; title: string; type: string; status: string; estMinutes: number | null };

type Row = PickedMaterial & { level: string | null; readiness: { ready: boolean; summaryKa: string }; plans: { id: string }[] };

export function LibraryPicker({ open, onClose, onPick, exclude, sectionLabel }: { open: boolean; onClose: () => void; onPick: (items: PickedMaterial[]) => void; exclude: string[]; sectionLabel: string }) {
  const [q, setQ] = useState("");
  const [type, setType] = useState("");
  const [rows, setRows] = useState<Row[] | null>(null);
  const [picked, setPicked] = useState<Map<string, Row>>(new Map());

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => {
      const params = new URLSearchParams();
      if (q.trim()) params.set("q", q.trim());
      if (type) params.set("type", type);
      void load<{ items: Row[] }>(`/v1/admin/materials${params.size ? `?${params}` : ""}`).then((data) => setRows(data?.items ?? []));
    }, 200);
    return () => clearTimeout(timer);
  }, [open, q, type]);

  const [wasOpen, setWasOpen] = useState(open);
  if (wasOpen !== open) {
    setWasOpen(open);
    if (open) setPicked(new Map());
  }

  function toggle(row: Row) {
    setPicked((current) => {
      const next = new Map(current);
      if (next.has(row.id)) next.delete(row.id);
      else next.set(row.id, row);
      return next;
    });
  }

  const excluded = new Set(exclude);
  const types = Object.values(MATERIAL_CATALOG).filter((item) => item.type !== "HTML_EMBED");

  return (
    <Dialog open={open} onClose={onClose} title={`ბიბლიოთეკიდან · ${sectionLabel}`} wide>
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          <input
            type="search"
            aria-label="ძებნა"
            placeholder="ძებნა სათაურით ან თეგით"
            value={q}
            onChange={(event) => setQ(event.target.value)}
            className="h-11 min-w-60 flex-1 rounded-xl border-[1.5px] border-sand bg-card px-3 outline-none focus:border-teal-deep focus:ring-4 focus:ring-teal-soft"
          />
          <select aria-label="ტიპი" value={type} onChange={(event) => setType(event.target.value)} className="h-11 rounded-xl border-[1.5px] border-sand bg-card px-3">
            <option value="">ყველა ტიპი</option>
            {types.map((item) => (
              <option key={item.type} value={item.type}>
                {item.labelKa}
              </option>
            ))}
          </select>
        </div>
        <ul className="flex max-h-[52vh] flex-col overflow-y-auto rounded-2xl border-[1.5px] border-line bg-card">
          {rows === null ? <li className="p-4 text-ink-muted">იტვირთება…</li> : null}
          {rows?.length === 0 ? <li className="p-4 text-ink-muted">ვერაფერი მოიძებნა.</li> : null}
          {rows?.map((row) => {
            const already = excluded.has(row.id);
            const on = picked.has(row.id);
            const tone = groupTone(row.type);
            return (
              <li key={row.id} className="border-b border-line-soft last:border-b-0">
                <button
                  type="button"
                  disabled={already}
                  aria-pressed={on}
                  onClick={() => toggle(row)}
                  className={`flex w-full items-center gap-3 px-3 py-2.5 text-left ${on ? "bg-teal-softer" : "hover:bg-paper-deep"} disabled:opacity-50`}
                >
                  <span className={`flex size-6 shrink-0 items-center justify-center rounded-md border-2 ${on ? "border-teal-deep bg-teal-deep text-on-dark" : "border-sand"}`} aria-hidden>
                    {on ? "✓" : ""}
                  </span>
                  <IconTile name={materialIcon(row.type)} className={`size-10 ${tone.tile} ${tone.ink}`} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">{row.title}</span>
                    <span className="block text-[13px] text-ink-muted">
                      {materialLabel(row.type, row.estMinutes)}
                      {row.level ? ` · ${row.level}` : ""}
                      {already ? " · უკვე დამატებულია" : ""}
                    </span>
                  </span>
                  {row.status !== "PUBLISHED" ? <span className="rounded-lg bg-mustard-soft px-2 py-1 text-xs font-semibold text-mustard-ink">მონახაზი</span> : null}
                </button>
              </li>
            );
          })}
        </ul>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-ink-muted">მონახაზს მოსწავლე ვერ დაინახავს, სანამ ბიბლიოთეკაში არ გამოაქვეყნებ.</p>
          <Button
            disabled={picked.size === 0}
            onClick={() => {
              onPick([...picked.values()].map(({ id, title, type: kind, status, estMinutes }) => ({ id, title, type: kind, status, estMinutes })));
              onClose();
            }}
          >
            დამატება{picked.size ? ` · ${picked.size}` : ""}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
