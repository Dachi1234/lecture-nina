import { VocabTable } from "@/components/admin/vocab-table";
import { apiGet } from "@/lib/api";

type Word = Parameters<typeof VocabTable>[0]["items"][number];

export default async function AdminVocabularyPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const data = await apiGet<{ items: Word[] }>(`/v1/admin/vocabulary${q ? `?q=${encodeURIComponent(q)}` : ""}`);
  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">ლექსიკა</h1>
          <p className="mt-1 text-ink-muted">{data.items.length} სიტყვა</p>
        </div>
        <form className="flex gap-2">
          <input name="q" defaultValue={q ?? ""} placeholder="ძიება" className="h-11 rounded-xl border-[1.5px] border-sand bg-card px-3" />
          <button type="submit" className="h-11 rounded-xl bg-teal-deep px-4 font-semibold text-on-dark">ძიება</button>
        </form>
      </div>
      <VocabTable items={data.items} />
    </section>
  );
}
