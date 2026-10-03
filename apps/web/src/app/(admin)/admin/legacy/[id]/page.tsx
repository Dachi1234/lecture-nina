import Link from "next/link";
import { notFound } from "next/navigation";
import { LegacyCopyButton } from "@/components/admin/legacy-copy";
import { MaterialStage } from "@/components/cabinet/viewers";
import { ApiError, apiGet } from "@/lib/api";

type Legacy = {
  id: string;
  type: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  content: unknown;
  tags: string[];
  estMinutes: number | null;
  unitLabel: string | null;
  topicLabel: string | null;
  copiedTo: string | null;
  assets: Record<string, string>;
};

export default async function LegacyItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let item: Legacy;
  try {
    item = await apiGet<Legacy>(`/v1/admin/legacy/${id}`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }
  return (
    <section className="flex flex-col gap-5">
      <Link href="/admin/legacy" className="text-sm font-semibold text-teal-deep">
        ← ძველი ბიბლიოთეკა
      </Link>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border-[1.5px] border-line bg-paper-deep px-5 py-4">
        <div>
          <p className="text-sm text-ink-muted">მხოლოდ სანახავად · {[item.unitLabel, item.topicLabel].filter(Boolean).join(" · ") || "თემის გარეშე"}</p>
          {item.tags.length ? <p className="text-sm text-ink-muted">თეგები: {item.tags.join(", ")}</p> : null}
        </div>
        <LegacyCopyButton legacyId={item.id} copiedTo={item.copiedTo} />
      </div>
      <div className="rounded-3xl border-[1.5px] border-line bg-paper p-4 sm:p-8">
        <MaterialStage
          material={{
            id: item.id,
            title: item.title,
            subtitle: item.subtitle,
            description: item.description,
            type: item.type,
            content: item.content,
            status: "NOT_STARTED",
            lastStep: null,
            canMarkDone: false,
            lessonId: null,
            preview: true,
            assets: item.assets,
            prev: null,
            next: null,
          }}
        />
      </div>
    </section>
  );
}
