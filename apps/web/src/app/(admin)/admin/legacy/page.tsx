import Link from "next/link";
import { MATERIAL_CATALOG, type MaterialTypeId } from "@nina/contracts";
import { IconTile } from "@nina/ui";
import { LegacyCopyButton } from "@/components/admin/legacy-copy";
import { apiGet } from "@/lib/api";
import { groupTone, materialIcon } from "@/lib/materials";

type Item = { id: string; type: string; title: string; subtitle: string | null; unitLabel: string | null; topicLabel: string | null; topicOrder: number | null; copiedTo: string | null };
type Word = { id: string; es: string; ka: string | null; en: string | null; topicLabel: string | null };

function href(params: { q?: string; type?: string; tab?: string }) {
  const search = new URLSearchParams(Object.entries(params).filter((entry): entry is [string, string] => Boolean(entry[1])));
  return `/admin/legacy${search.size ? `?${search}` : ""}`;
}

export default async function LegacyPage({ searchParams }: { searchParams: Promise<{ q?: string; type?: string; tab?: string }> }) {
  const { q = "", type = "", tab = "" } = await searchParams;
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (type) params.set("type", type);
  const data = await apiGet<{ items: Item[]; counts: Record<string, number>; words: number }>(`/v1/admin/legacy${params.size ? `?${params}` : ""}`);
  const words = tab === "words" ? (await apiGet<{ items: Word[] }>("/v1/admin/legacy/words")).items : [];
  const total = Object.values(data.counts).reduce((sum, value) => sum + value, 0);
  const copied = data.items.filter((item) => item.copiedTo).length;

  const groups: { label: string; items: Item[] }[] = [];
  for (const item of data.items) {
    const label = [item.unitLabel, item.topicLabel].filter(Boolean).join(" · ") || "თემის გარეშე";
    const last = groups.at(-1);
    if (last?.label === label) last.items.push(item);
    else groups.push({ label, items: [item] });
  }

  return (
    <section className="flex flex-col gap-5">
      <div>
        <h1 className="text-3xl font-bold">ძველი ბიბლიოთეკა</h1>
        <p className="mt-2 max-w-3xl text-base leading-relaxed text-ink-muted">
          ყველაფერი, რაც ძველ სისტემაში იყო — მხოლოდ სანახავად. მოსწავლეები ამას ვერ ხედავენ. რაც გამოგადგება, დააკოპირე ახალ ბიბლიოთეკაში — იქ შეასწორებ, გამოაქვეყნებ და გეგმაში ჩასვამ. ფაილები არ დუბლირდება.
        </p>
      </div>
      <nav className="flex flex-wrap gap-2" aria-label="ჩანართები">
        <Link href={href({ q, type })} aria-current={tab !== "words" ? "page" : undefined} className={`inline-flex h-11 items-center rounded-xl border-[1.5px] px-4 text-[15px] font-semibold ${tab !== "words" ? "border-teal-deep bg-teal-deep text-on-dark" : "border-sand bg-card"}`}>
          მასალები · {total}
        </Link>
        <Link href={href({ tab: "words" })} aria-current={tab === "words" ? "page" : undefined} className={`inline-flex h-11 items-center rounded-xl border-[1.5px] px-4 text-[15px] font-semibold ${tab === "words" ? "border-teal-deep bg-teal-deep text-on-dark" : "border-sand bg-card"}`}>
          სიტყვები · {data.words}
        </Link>
      </nav>

      {tab === "words" ? (
        <div className="overflow-x-auto rounded-2xl border-[1.5px] border-line bg-card">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="bg-paper-deep text-ink-muted">
              <tr>
                <th className="px-4 py-2.5 font-semibold">ესპანური</th>
                <th className="px-4 py-2.5 font-semibold">ქართული</th>
                <th className="px-4 py-2.5 font-semibold">ინგლისური</th>
                <th className="px-4 py-2.5 font-semibold">თემა</th>
              </tr>
            </thead>
            <tbody>
              {words.map((word) => (
                <tr key={word.id} className="border-t border-line-soft">
                  <td className="px-4 py-2 font-semibold" lang="es">
                    {word.es}
                  </td>
                  <td className="px-4 py-2">{word.ka ?? "—"}</td>
                  <td className="px-4 py-2" lang="en">
                    {word.en ?? "—"}
                  </td>
                  <td className="px-4 py-2 text-ink-muted">{word.topicLabel ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <>
          <form action="/admin/legacy" className="flex flex-wrap gap-2 rounded-2xl border-[1.5px] border-line bg-card p-4">
            <input name="q" defaultValue={q} aria-label="ძებნა" placeholder="ძებნა სათაურით ან თემით" className="h-11 min-w-60 flex-1 rounded-xl border-[1.5px] border-sand bg-paper px-3" />
            <select name="type" defaultValue={type} aria-label="ტიპი" className="h-11 rounded-xl border-[1.5px] border-sand bg-paper px-3">
              <option value="">ყველა ტიპი</option>
              {Object.entries(data.counts).map(([key, count]) => (
                <option key={key} value={key}>
                  {MATERIAL_CATALOG[key as MaterialTypeId]?.labelKa ?? key} · {count}
                </option>
              ))}
            </select>
            <button type="submit" className="h-11 rounded-xl border-[1.5px] border-teal-deep px-5 font-semibold text-teal-deep">
              ძებნა
            </button>
          </form>
          <p className="text-sm text-ink-muted">
            ნაჩვენებია {data.items.length} · ახალ ბიბლიოთეკაში უკვე გადატანილია {copied}
          </p>
          {groups.map((group) => (
            <section key={group.label} className="overflow-hidden rounded-2xl border-[1.5px] border-line bg-card">
              <h2 className="border-b border-line-soft bg-paper-deep px-4 py-2.5 text-sm font-semibold">{group.label}</h2>
              <ul>
                {group.items.map((item) => {
                  const tone = groupTone(item.type);
                  return (
                    <li key={item.id} className="flex flex-wrap items-center gap-3 border-b border-line-soft px-4 py-2.5 last:border-b-0">
                      <IconTile name={materialIcon(item.type)} className={`size-10 ${tone.tile} ${tone.ink}`} />
                      <Link href={`/admin/legacy/${item.id}`} className="min-w-48 flex-1 hover:text-teal-deep">
                        <span className="block font-semibold">{item.title}</span>
                        <span className="block text-[13px] text-ink-muted">
                          {MATERIAL_CATALOG[item.type as MaterialTypeId]?.labelKa ?? item.type}
                          {item.subtitle ? ` · ${item.subtitle}` : ""}
                        </span>
                      </Link>
                      <LegacyCopyButton legacyId={item.id} copiedTo={item.copiedTo} size="s" />
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </>
      )}
    </section>
  );
}
