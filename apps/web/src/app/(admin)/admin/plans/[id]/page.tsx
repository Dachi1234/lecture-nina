import { notFound } from "next/navigation";
import { PlanEditor, type PlanDetail, type UnitOption } from "@/components/admin/curriculum/plan-editor";
import { ApiError, apiGet } from "@/lib/api";

type Course = { id: string; title: string; isArchived: boolean };
type CourseUnits = { id: string; title: string; units: { id: string; titleKa: string }[] };

export default async function PlanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let plan: PlanDetail;
  try {
    plan = await apiGet<PlanDetail>(`/v1/admin/plans/${id}`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }
  const { items: courses } = await apiGet<{ items: Course[] }>("/v1/admin/courses");
  const details = await Promise.all(courses.filter((course) => !course.isArchived || course.id === plan.course?.id).map((course) => apiGet<CourseUnits>(`/v1/admin/courses/${course.id}`)));
  const units: UnitOption[] = details.flatMap((course) => course.units.map((unit) => ({ id: unit.id, label: `${course.title} · ${unit.titleKa}` })));
  return <PlanEditor key={plan.id} plan={plan} units={units} />;
}
