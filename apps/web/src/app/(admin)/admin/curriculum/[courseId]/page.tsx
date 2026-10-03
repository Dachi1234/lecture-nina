import { notFound } from "next/navigation";
import { CourseBoard, type CourseDetail } from "@/components/admin/curriculum/course-board";
import { ApiError, apiGet } from "@/lib/api";

export default async function CoursePage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  let course: CourseDetail;
  try {
    course = await apiGet<CourseDetail>(`/v1/admin/courses/${courseId}`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }
  return <CourseBoard course={course} />;
}
