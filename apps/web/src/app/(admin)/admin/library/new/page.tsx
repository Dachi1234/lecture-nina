import Link from "next/link";
import { NewMaterialWizard } from "@/components/admin/studio/wizard";
import { ApiError, apiGet } from "@/lib/api";
import { loadTopics } from "@/lib/topics";

type Lesson = { id: string; studentId: string; studentName: string; number: number; title: string; items: { groupLabel: string | null }[] };

export default async function NewMaterialPage({ searchParams }: { searchParams: Promise<{ lessonId?: string }> }) {
  const { lessonId } = await searchParams;
  const topics = await loadTopics();
  let lesson: Lesson | null = null;
  if (lessonId) {
    try {
      lesson = await apiGet<Lesson>(`/v1/admin/lessons/${lessonId}`);
    } catch (error) {
      if (!(error instanceof ApiError && error.status === 404)) throw error;
    }
  }
  const returnTo = lesson ? `/admin/students/${lesson.studentId}/lessons/${lesson.id}` : null;
  return (
    <div className="flex flex-col gap-4">
      <Link href={returnTo ?? "/admin/library"} className="text-sm font-semibold text-teal-deep">
        ← {lesson ? `გაკვეთილი ${lesson.number}` : "ბიბლიოთეკა"}
      </Link>
      <NewMaterialWizard
        topics={topics}
        lesson={
          lesson && returnTo
            ? {
                id: lesson.id,
                number: lesson.number,
                title: lesson.title,
                studentName: lesson.studentName,
                groups: [...new Set(lesson.items.map((item) => item.groupLabel).filter((label): label is string => Boolean(label)))],
                returnTo,
              }
            : null
        }
      />
    </div>
  );
}
