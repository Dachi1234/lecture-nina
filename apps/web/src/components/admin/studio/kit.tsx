"use client";

import { createContext, useContext, useId, useRef, useState, type DragEvent, type ReactNode } from "react";
import { Field, Icon, Input, Textarea } from "@nina/ui";

export type Rec = Record<string, unknown>;
export type AssetRef = { assetId: string };

export function rec(value: unknown): Rec {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Rec) : {};
}

export function arr(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

export function recs(value: unknown): Rec[] {
  return arr(value).map(rec);
}

export function str(value: unknown) {
  return typeof value === "string" ? value : "";
}

export function assetRef(value: unknown): AssetRef | undefined {
  const record = rec(value);
  return typeof record.assetId === "string" ? { assetId: record.assetId } : undefined;
}

export function move<T>(list: T[], index: number, direction: -1 | 1) {
  const target = index + direction;
  if (target < 0 || target >= list.length) return list;
  const copy = [...list];
  const current = copy[index] as T;
  copy[index] = copy[target] as T;
  copy[target] = current;
  return copy;
}

export function replaceAt<T>(list: T[], index: number, value: T) {
  return list.map((item, itemIndex) => (itemIndex === index ? value : item));
}

export function removeAt<T>(list: T[], index: number) {
  return list.filter((_, itemIndex) => itemIndex !== index);
}

type AssetsValue = { assets: Record<string, string>; register: (assetId: string, path: string) => void };

export const AssetsContext = createContext<AssetsValue>({ assets: {}, register: () => undefined });

export function useAssets() {
  return useContext(AssetsContext);
}

export function Section({ title, hint, children, action }: { title: string; hint?: string; children: ReactNode; action?: ReactNode }) {
  return (
    <section className="flex flex-col gap-4 rounded-2xl border-[1.5px] border-line bg-card p-5 sm:p-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold">{title}</h2>
          {hint ? <p className="mt-1 text-sm leading-relaxed text-ink-muted">{hint}</p> : null}
        </div>
        {action}
      </header>
      {children}
    </section>
  );
}

export function TextField({
  label,
  value,
  onChange,
  placeholder,
  hint,
  lang,
  rows,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  hint?: string;
  lang?: string;
  rows?: number;
}) {
  const id = useId();
  return (
    <Field id={id} label={label} hint={hint}>
      {rows ? (
        <Textarea id={id} value={value} rows={rows} lang={lang} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} className="font-medium" />
      ) : (
        <Input id={id} value={value} lang={lang} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} className="font-medium" />
      )}
    </Field>
  );
}

export const miniField =
  "h-11 min-w-0 rounded-lg border-[1.5px] border-sand bg-card px-3 text-[15px] text-ink outline-none transition placeholder:text-ink-muted focus:border-teal-deep focus:ring-4 focus:ring-teal-soft";

export const miniInput = `w-full ${miniField}`;

export function MiniInput({
  value,
  onChange,
  label,
  placeholder,
  lang,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder?: string;
  lang?: string;
  className?: string;
}) {
  return (
    <input
      value={value}
      aria-label={label}
      placeholder={placeholder ?? label}
      lang={lang}
      onChange={(event) => onChange(event.target.value)}
      className={`${miniInput} ${className ?? ""}`}
    />
  );
}

const toolButton = "flex size-11 shrink-0 items-center justify-center rounded-lg text-ink-muted transition hover:bg-paper-deep hover:text-ink disabled:opacity-30";

export function RowTools({
  index,
  count,
  label,
  onMove,
  onRemove,
  onDuplicate,
}: {
  index: number;
  count: number;
  label: string;
  onMove: (direction: -1 | 1) => void;
  onRemove: () => void;
  onDuplicate?: () => void;
}) {
  return (
    <div className="flex shrink-0 items-center">
      <button type="button" className={toolButton} disabled={index === 0} aria-label={`${label}: ზემოთ`} onClick={() => onMove(-1)}>
        <Icon name="chevron" width={18} height={18} className="-rotate-90" />
      </button>
      <button type="button" className={toolButton} disabled={index === count - 1} aria-label={`${label}: ქვემოთ`} onClick={() => onMove(1)}>
        <Icon name="chevron" width={18} height={18} className="rotate-90" />
      </button>
      {onDuplicate ? (
        <button type="button" className={`${toolButton} w-auto px-2 text-sm font-semibold`} onClick={onDuplicate}>
          ასლი
        </button>
      ) : null}
      <button type="button" className={`${toolButton} hover:text-burgundy`} aria-label={`${label}: წაშლა`} onClick={onRemove}>
        <Icon name="close" width={18} height={18} />
      </button>
    </div>
  );
}

export function AddButton({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border-[1.5px] border-dashed border-teal-deep text-[15px] font-semibold text-teal-deep transition hover:bg-teal-softer"
    >
      + {children}
    </button>
  );
}

export function Segmented<T extends string>({ value, options, onChange, label }: { value: T; options: { id: T; label: string }[]; onChange: (value: T) => void; label: string }) {
  return (
    <div role="group" aria-label={label} className="inline-flex flex-wrap gap-1 rounded-xl bg-paper-deep p-1">
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          aria-pressed={value === option.id}
          onClick={() => onChange(option.id)}
          className={`h-10 rounded-lg px-3 text-sm font-semibold transition ${value === option.id ? "bg-card text-teal-deep shadow-sm" : "text-ink-muted hover:text-ink"}`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export type MediaKind = "image" | "audio" | "video" | "document";

const accept: Record<MediaKind, string> = {
  image: "image/jpeg,image/png,image/webp,image/gif",
  audio: "audio/mpeg,audio/wav,audio/ogg,audio/mp4,.m4a,.mp3,.wav,.ogg",
  video: "video/mp4,video/quicktime,video/webm",
  document: ".pdf,.doc,.docx,application/pdf",
};

const kindText: Record<MediaKind, { empty: string; formats: string }> = {
  image: { empty: "სურათის ატვირთვა", formats: "JPG, PNG, WEBP" },
  audio: { empty: "აუდიოს ატვირთვა", formats: "MP3, M4A, WAV, OGG" },
  video: { empty: "ვიდეოს ატვირთვა", formats: "MP4, MOV, WEBM · 1 GB-მდე" },
  document: { empty: "ფაილის ატვირთვა", formats: "PDF, DOC, DOCX" },
};

export function useUploader() {
  const { register } = useAssets();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function upload(file: File): Promise<AssetRef | null> {
    setBusy(true);
    setError("");
    const form = new FormData();
    form.append("file", file);
    try {
      const response = await fetch("/v1/admin/media", { method: "POST", credentials: "include", body: form });
      const body = (await response.json().catch(() => null)) as { id?: string; path?: string | null; error?: { messageKa?: string } } | null;
      if (!response.ok || !body?.id) {
        setError(body?.error?.messageKa ?? "ატვირთვა ვერ მოხერხდა.");
        return null;
      }
      if (body.path) register(body.id, body.path);
      return { assetId: body.id };
    } catch {
      setError("ატვირთვა ვერ მოხერხდა. შეამოწმე ინტერნეტი.");
      return null;
    } finally {
      setBusy(false);
    }
  }
  return { upload, busy, error };
}

function dropFiles(event: DragEvent) {
  event.preventDefault();
  return Array.from(event.dataTransfer.files);
}

export function MediaSlot({
  kind,
  value,
  onChange,
  label,
  compact,
}: {
  kind: MediaKind;
  value: unknown;
  onChange: (value: AssetRef | undefined) => void;
  label: string;
  compact?: boolean;
}) {
  const { assets } = useAssets();
  const input = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const { upload, busy, error } = useUploader();
  const current = assetRef(value);
  const src = current ? assets[current.assetId] : undefined;

  async function take(files: File[]) {
    const file = files[0];
    if (!file) return;
    const saved = await upload(file);
    if (saved) onChange(saved);
  }

  const picker = (
    <input
      ref={input}
      type="file"
      accept={accept[kind]}
      className="sr-only"
      tabIndex={-1}
      aria-hidden
      onChange={(event) => {
        void take(Array.from(event.target.files ?? []));
        event.target.value = "";
      }}
    />
  );

  if (compact) {
    if (current) {
      return (
        <div className="flex shrink-0 items-center gap-1">
          {kind === "image" && src ? <img src={src} alt="" className="size-11 rounded-lg object-cover" /> : null}
          {kind === "audio" && src ? (
            <button type="button" aria-label={`${label}: მოსმენა`} className="flex size-11 items-center justify-center rounded-lg bg-teal-soft text-teal-deep" onClick={() => void new Audio(src).play()}>
              <Icon name="audio" width={18} height={18} />
            </button>
          ) : null}
          {!src ? <span className="flex size-11 items-center justify-center rounded-lg bg-sage-soft text-sage-ink"><Icon name="check" width={18} height={18} /></span> : null}
          <button type="button" aria-label={`${label}: წაშლა`} className="flex size-11 items-center justify-center rounded-lg text-ink-muted hover:text-burgundy" onClick={() => onChange(undefined)}>
            <Icon name="close" width={16} height={16} />
          </button>
        </div>
      );
    }
    return (
      <>
        {picker}
        <button
          type="button"
          aria-label={label}
          title={error || label}
          onClick={() => input.current?.click()}
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => void take(dropFiles(event))}
          className={`flex size-11 shrink-0 items-center justify-center rounded-lg border-[1.5px] border-dashed ${error ? "border-burgundy text-burgundy" : "border-sand text-ink-muted"} hover:border-teal-deep hover:text-teal-deep`}
        >
          {busy ? <span className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent" /> : <Icon name={kind === "image" ? "card" : kind === "audio" ? "audio" : kind === "video" ? "video" : "document"} width={18} height={18} />}
        </button>
      </>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-semibold">{label}</p>
      {picker}
      {current ? (
        <div className="flex flex-col gap-3 rounded-xl border-[1.5px] border-line bg-paper p-3">
          {kind === "image" && src ? <img src={src} alt="" className="max-h-72 w-full rounded-lg object-contain" /> : null}
          {kind === "audio" && src ? <audio controls src={src} className="w-full" /> : null}
          {kind === "video" && src ? <video controls src={src} className="max-h-72 w-full rounded-lg bg-navy" /> : null}
          {kind === "document" || !src ? (
            <p className="flex items-center gap-2 text-sm font-semibold text-sage-ink">
              <Icon name="check" width={18} height={18} /> ფაილი ატვირთულია
              {src ? <a href={src} target="_blank" rel="noreferrer" className="text-teal-deep underline">გახსნა</a> : null}
            </p>
          ) : null}
          <div className="flex gap-2">
            <button type="button" className="h-10 rounded-lg border-[1.5px] border-sand px-3 text-sm font-semibold" onClick={() => input.current?.click()}>
              {busy ? "იტვირთება…" : "შეცვლა"}
            </button>
            <button type="button" className="h-10 rounded-lg px-3 text-sm font-semibold text-burgundy" onClick={() => onChange(undefined)}>
              წაშლა
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => input.current?.click()}
          onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => { setDragging(false); void take(dropFiles(event)); }}
          className={`flex min-h-32 flex-col items-center justify-center gap-2 rounded-xl border-[1.5px] border-dashed px-4 py-6 text-center transition ${dragging ? "border-teal-deep bg-teal-softer" : "border-sand bg-paper hover:border-teal-deep"}`}
        >
          {busy ? (
            <span className="size-6 animate-spin rounded-full border-2 border-teal-deep border-r-transparent" />
          ) : (
            <Icon name={kind === "image" ? "card" : kind === "audio" ? "audio" : kind === "video" ? "video" : "document"} width={28} height={28} className="text-teal-deep" />
          )}
          <span className="font-semibold text-teal-deep">{busy ? "იტვირთება…" : kindText[kind].empty}</span>
          <span className="text-sm text-ink-muted">გადმოიტანე აქ ან დააჭირე · {kindText[kind].formats}</span>
        </button>
      )}
      {error ? <p className="text-sm font-medium text-burgundy">{error}</p> : null}
    </div>
  );
}

export function ImageStrip({ value, onChange, label }: { value: unknown; onChange: (value: AssetRef[]) => void; label: string }) {
  const { assets } = useAssets();
  const input = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const { upload, busy, error } = useUploader();
  const pages = arr(value).map(assetRef).filter((item): item is AssetRef => Boolean(item));

  async function take(files: File[]) {
    const added: AssetRef[] = [];
    for (const file of files) {
      const saved = await upload(file);
      if (saved) added.push(saved);
    }
    if (added.length) onChange([...pages, ...added]);
  }

  return (
    <div className="flex flex-col gap-3">
      <input
        ref={input}
        type="file"
        multiple
        accept={accept.image}
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={(event) => {
          void take(Array.from(event.target.files ?? []));
          event.target.value = "";
        }}
      />
      {pages.length > 0 ? (
        <ol className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {pages.map((page, index) => (
            <li key={`${page.assetId}-${index}`} className="flex flex-col gap-1 rounded-xl border-[1.5px] border-line bg-paper p-2">
              <div className="relative aspect-[9/16] overflow-hidden rounded-lg bg-sand-soft">
                {assets[page.assetId] ? <img src={assets[page.assetId]} alt="" className="size-full object-cover" /> : null}
                <span className="absolute top-1 left-1 rounded-md bg-card px-2 py-0.5 text-xs font-bold">{index + 1}</span>
              </div>
              <div className="flex justify-between">
                <button type="button" className={toolButton} disabled={index === 0} aria-label={`${label} ${index + 1}: წინ`} onClick={() => onChange(move(pages, index, -1))}>
                  <Icon name="chevron" width={18} height={18} className="rotate-180" />
                </button>
                <button type="button" className={`${toolButton} hover:text-burgundy`} aria-label={`${label} ${index + 1}: წაშლა`} onClick={() => onChange(removeAt(pages, index))}>
                  <Icon name="close" width={18} height={18} />
                </button>
                <button type="button" className={toolButton} disabled={index === pages.length - 1} aria-label={`${label} ${index + 1}: უკან`} onClick={() => onChange(move(pages, index, 1))}>
                  <Icon name="chevron" width={18} height={18} />
                </button>
              </div>
            </li>
          ))}
        </ol>
      ) : null}
      <button
        type="button"
        onClick={() => input.current?.click()}
        onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => { setDragging(false); void take(dropFiles(event)); }}
        className={`flex min-h-28 flex-col items-center justify-center gap-2 rounded-xl border-[1.5px] border-dashed px-4 py-5 text-center transition ${dragging ? "border-teal-deep bg-teal-softer" : "border-sand bg-paper hover:border-teal-deep"}`}
      >
        {busy ? <span className="size-6 animate-spin rounded-full border-2 border-teal-deep border-r-transparent" /> : <Icon name="card" width={28} height={28} className="text-teal-deep" />}
        <span className="font-semibold text-teal-deep">{busy ? "იტვირთება…" : pages.length ? "კიდევ დამატება" : "ბარათების ატვირთვა"}</span>
        <span className="text-sm text-ink-muted">შეგიძლია ერთად რამდენიმე აირჩიო · 9:16 · JPG, PNG, WEBP</span>
      </button>
      {error ? <p className="text-sm font-medium text-burgundy">{error}</p> : null}
    </div>
  );
}
