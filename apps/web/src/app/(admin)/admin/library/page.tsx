import Link from "next/link";
import { MATERIAL_CATALOG, MATERIAL_GROUPS } from "@nina/contracts";
import { IconTile } from "@nina/ui";
import { apiGet } from "@/lib/api";
import { shortDate } from "@/lib/dates";
import { groupTone, materialIcon, materialLabel, templateLabel } from "@/lib/materials";

type Item = {
  id: string;
  type: string;
  title: string;
  subtitle: string | null;
  status: string;
  estMinutes: number | null;
  templateId: string | null;
  hasDraft: boolean;
  level: string | null;
  fromLegacy: boolean;
  readiness: { ready: boolean; empty: boolean; requiredDone: number; requiredTotal: number; summaryKa: string };
  updatedAt: string;
  plans: { id: string; titleKa: string }[];
  extraLessons: number;
};
type Counts = { all: number; empty: number; partial: number; ready: number; changes: number };

const states = [
  { id: "", label: "ყველა", count: (counts: Counts) => counts.all },
  { id: "empty", label: "ცარიელი", count: (counts: Counts) => counts.empty },
  { id: "partial", label: "შესავსები", count: (counts: Counts) => counts.partial },
  { id: "ready", label: "მზად", count: (counts: Counts) => counts.ready },
  { id: "changes", label: "გამოუქვეყნებელი ცვლილებები", count: (counts: Counts) => counts.changes },
] as const;

function href(params: { q?: string; type?: string; state?: string; status?: string }) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) if (value) search.set(key, value);
  return `/admin/library${search.size ? `?${search}` : ""}`;
}

export default async function LibraryPage({ searchParams }: { searchParams: Promise<{ q?: string; type?: string; state?: string; status?: string }> }) {
  const { q = "", type = "", state = "", status = "" } = await searchParams;
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (type) params.set("type", type);
  if (state) params.set("state", state);
  if (status) params.set("status", status);
  const data = await apiGet<{ items: Item[]; counts: Counts }>(`/v1/admin/materials${params.size ? `?${params}` : ""}`);
  const typeGroups = MATERIAL_GROUPS.map((group) => ({
    ...group,
    types: Object.values(MATERIAL_CATALOG).filter((item) => item.group === group.id && item.type !== "HTML_EMBED"),
  }));

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">ბიბლიოთეკა</h1>
          <p className="mt-2 max-w-2xl text-base leading-relaxed text-ink-muted">
            ყველა მასალა ერთ ადგილას. ერთხელ ქმნი — ბევრ გაკვეთილში იყენებ. გამოქვეყნებულის შეცვლა ჯერ მონახაზად ინახება.
          </p>
        </div>
        <Link href="/admin/library/new" className="inline-flex h-12 items-center rounded-xl bg-teal-deep px-6 font-semibold whitespace-nowrap text-on-dark transition hover:-translate-y-0.5 hover:bg-teal-hover">
          + ახალი მასალა
        </Link>
      </div>

      <nav aria-label="მზადყოფნა" className="flex flex-wrap gap-2">
        {states.map((item) => {
          const active = state === item.id;
          const count = item.count(data.counts);
          return (
            <Link
              key={item.id || "all"}
              href={href({ q, type, state: item.id, status })}
              aria-current={active ? "page" : undefined}
              className={`inline-flex h-11 items-center gap-2 rounded-xl border-[1.5px] px-4 text-[15px] font-semibold ${active ? "border-teal-deep bg-teal-deep text-on-dark" : "border-sand bg-card"}`}
            >
              {item.label}
              <span className={`rounded-full px-2 text-sm ${active ? "bg-teal-hover" : item.id === "empty" && count ? "bg-burgundy-soft text-burgundy" : "bg-paper-deep text-ink-muted"}`}>{count}</span>
            </Link>
          );
        })}
      </nav>

      <div className="flex flex-col gap-3 rounded-2xl border-[1.5px] border-line bg-card p-4">
        <form className="flex flex-wrap gap-3" action="/admin/library">
          {type ? <input type="hidden" name="type" value={type} /> : null}
          {state ? <input type="hidden" name="state" value={state} /> : null}
          <input name="q" defaultValue={q} placeholder="ძებნა სათაურით ან თეგით" className="h-12 w-full max-w-md rounded-xl border-[1.5px] border-sand bg-paper px-4" aria-label="ძებნა" />
          <button type="submit" className="h-12 rounded-xl border-[1.5px] border-teal-deep px-5 font-semibold text-teal-deep">ძებნა</button>
          <Link href={href({ q, type, state, status: status === "ARCHIVED" ? "" : "ARCHIVED" })} className="inline-flex h-12 items-center px-2 text-sm font-semibold text-ink-muted underline decoration-line underline-offset-4">
            {status === "ARCHIVED" ? "არქივის დამალვა" : "არქივი"}
          </Link>
        </form>
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          <Link href={href({ q, state, status })} aria-current={!type ? "page" : undefined} className={`inline-flex h-10 items-center rounded-lg px-3 text-sm font-semibold ${!type ? "bg-teal-soft text-teal-deep" : "text-ink-muted"}`}>ყველა ტიპი</Link>
          {typeGroups.map((group) => (
            <div key={group.id} className="flex flex-wrap items-center gap-1">
              {group.types.map((item) => (
                <Link
                  key={item.type}
                  href={href({ q, type: type === item.type ? "" : item.type, state, status })}
                  aria-current={type === item.type ? "page" : undefined}
                  className={`inline-flex h-10 items-center rounded-lg px-3 text-sm font-semibold ${type === item.type ? `${groupTone(item.type).tile} ${groupTone(item.type).ink}` : "text-ink-muted hover:text-ink"}`}
                >
                  {item.labelKa}
                </Link>
              ))}
              <span className="mx-1 h-5 w-px bg-line" aria-hidden />
            </div>
          ))}
        </div>
      </div>

      {data.items.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border-[1.5px] border-dashed border-sand bg-card px-6 py-12 text-center">
          <img src="/illustrations/spots/spot-notebook.webp" alt="" className="h-28" loading="lazy" />
          <p className="text-lg font-semibold">ასეთი მასალა არ არის</p>
          <Link href="/admin/library/new" className="font-semibold text-teal-deep">შექმენი ახალი →</Link>
        </div>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
          {data.items.map((item) => (
            <li key={item.id}>
              <MaterialCard item={item} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function MaterialCard({ item }: { item: Item }) {
  const tone = groupTone(item.type);
  const { readiness } = item;
  const percent = readiness.requiredTotal ? Math.round((readiness.requiredDone / readiness.requiredTotal) * 100) : 0;
  const usage = [
    item.plans.length ? `${item.plans.length} გეგმაში` : null,
    item.extraLessons ? `${item.extraLessons} გაკვეთილში დამატებით` : null,
  ].filter(Boolean);
  const kindLine = [materialLabel(item.type, item.estMinutes), templateLabel(item.templateId)].filter(Boolean).join(" · ");
  return (
    <Link
      href={`/admin/library/${item.id}${readiness.ready ? "?tab=publish" : ""}`}
      className="flex h-full flex-col gap-3 rounded-2xl border-[1.5px] border-line bg-card p-4 transition duration-200 hover:-translate-y-1 hover:border-sand hover:shadow-md"
    >
      <div className="flex items-start gap-3">
        <IconTile name={materialIcon(item.type)} className={`${tone.tile} ${tone.ink}`} />
        <div className="min-w-0 flex-1">
          <p className={`text-sm font-semibold ${tone.ink}`}>{kindLine}</p>
          <p className="mt-0.5 font-bold leading-snug break-words">{item.title}</p>
          {item.subtitle ? <p className="mt-0.5 truncate text-sm text-ink-muted">{item.subtitle}</p> : null}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-line-soft" aria-hidden>
          <div className={`h-full rounded-full ${readiness.ready ? "bg-sage" : readiness.empty ? "bg-burgundy" : "bg-mustard"}`} style={{ width: `${Math.max(percent, readiness.empty ? 4 : 0)}%` }} />
        </div>
        <span className={`text-sm font-semibold ${readiness.ready ? "text-sage-ink" : readiness.empty ? "text-burgundy" : "text-mustard-ink"}`}>{readiness.summaryKa}</span>
      </div>
      <div className="mt-auto flex flex-wrap items-center gap-2 text-xs font-semibold">
        {item.status === "ARCHIVED" ? <span className="rounded-full bg-sand-soft px-2.5 py-1">არქივი</span> : null}
        {item.status === "DRAFT" ? <span className="rounded-full bg-teal-soft px-2.5 py-1 text-teal-deep">მონახაზი</span> : null}
        {item.hasDraft ? <span className="rounded-full bg-mustard-soft px-2.5 py-1 text-mustard-ink">გამოუქვეყნებელი ცვლილებები</span> : null}
        {item.level ? <span className="rounded-full bg-paper-deep px-2.5 py-1 text-ink">{item.level}</span> : null}
        {item.fromLegacy ? <span className="rounded-full bg-sand-soft px-2.5 py-1 text-ink">ძველიდან</span> : null}
        <span className="ml-auto font-medium text-ink-muted">
          {usage.length ? usage.join(" · ") : "ჯერ არსად"} · {shortDate(item.updatedAt)}
        </span>
      </div>
    </Link>
  );
}