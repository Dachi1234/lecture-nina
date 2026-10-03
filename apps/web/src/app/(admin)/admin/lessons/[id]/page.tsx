import { notFound } from "next/navigation";
import { LessonEditor, type LessonDetail } from "@/components/admin/lessons/lesson-editor";
import { ApiError, apiGet } from "@/lib/api";

type Plan = { id: string; titleKa: string; courseTitle: string | null; unitTitle: string | null };

export default async function AdminLessonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let lesson: LessonDetail;
  try {
    lesson = await apiGet<LessonDetail>(`/v1/admin/lessons/${id}`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }
  const { items: plans } = await apiGet<{ items: Plan[] }>("/v1/admin/plans");
  return <LessonEditor key={lesson.id} lesson={lesson} plans={plans} />;
}
