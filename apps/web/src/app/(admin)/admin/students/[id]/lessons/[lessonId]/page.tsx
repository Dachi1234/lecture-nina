import { LessonEditor } from "@/components/admin/lesson-editor";
import { ApiError, apiGet } from "@/lib/api";
import { notFound } from "next/navigation";

type Curriculum = {
  courses: { blocks: { topics: { id: string; number: number; titleKa: string }[] }[] }[];
};

export default async function LessonPage({ params }: { params: Promise<{ id: string; lessonId: string }> }) {
  const { lessonId } = await params;
  try {
    const [lesson, curriculum] = await Promise.all([
      apiGet<Parameters<typeof LessonEditor>[0]["lesson"]>(`/v1/admin/lessons/${lessonId}`),
      apiGet<Curriculum>("/v1/admin/curriculum"),
    ]);
    const topics = curriculum.courses.flatMap((course) => course.blocks.flatMap((block) => block.topics));
    return <LessonEditor lesson={lesson} topics={topics} />;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }
}
