import { VocabularyBrowser, type VocabularyData } from "@/components/cabinet/vocabulary-browser";
import { apiGet, redirectAdminHome } from "@/lib/api";

export default async function VocabularyPage() {
  await redirectAdminHome();
  const data = await apiGet<VocabularyData>("/v1/me/vocabulary");
  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="font-hand text-[32px] leading-none text-burgundy">Mi vocabulario</p>
        <h1 className="text-[34px] font-bold">ლექსიკა</h1>
        <p className="mt-1 text-ink-muted">სიტყვები შენი გაკვეთილებიდან და ის, რაც ნინამ პირადად შენთვის დაამატა.</p>
      </div>
      <VocabularyBrowser data={data} />
    </div>
  );
}
