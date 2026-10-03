import Link from "next/link";
import { NewMaterialWizard, type AttachTarget } from "@/components/admin/studio/wizard";
import { ApiError, apiGet } from "@/lib/api";
import { shortDate } from "@/lib/dates";

type Plan = { id: string; titleKa: string; unit: { titleKa: string } | null };
type Lesson = { id: string; displayTitle: string; date: string; audience: { name: string } | null };

async function optional<T>(path: string) {
  try {
    return await apiGet<T>(path);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

export default async function NewMaterialPage({ searchParams }: { searchParams: Promise<{ planId?: string; lessonId?: string; section?: string }> }) {
  const { planId, lessonId, section = "CLASS" } = await searchParams;
  let target: AttachTarget | null = null;
  if (planId) {
    const plan = await optional<Plan>(`/v1/admin/plans/${planId}`);
    if (plan) target = { kind: "plan", id: plan.id, label: `გეგმა · ${plan.titleKa}`, section, returnTo: `/admin/plans/${plan.id}` };
  } else if (lessonId) {
    const lesson = await optional<Lesson>(`/v1/admin/lessons/${lessonId}`);
    if (lesson) {
      target = {
        kind: "lesson",
        id: lesson.id,
        label: `${lesson.audience?.name ?? ""} · ${shortDate(lesson.date)} · ${lesson.displayTitle}`,
        section,
        returnTo: `/admin/lessons/${lesson.id}`,
      };
    }
  }
  return (
    <div className="flex flex-col gap-4">
      <Link href={target?.returnTo ?? "/admin/library"} className="text-sm font-semibold text-teal-deep">
        ← {target ? (target.kind === "plan" ? "გეგმა" : "გაკვეთილი") : "ბიბლიოთეკა"}
      </Link>
      <NewMaterialWizard target={target} />
    </div>
  );
}
