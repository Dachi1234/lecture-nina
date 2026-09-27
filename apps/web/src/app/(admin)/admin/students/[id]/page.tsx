import { StudentDetail } from "@/components/admin/student-detail";
import { ApiError, apiGet } from "@/lib/api";
import { notFound } from "next/navigation";

export default async function StudentPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { id } = await params;
  const { tab } = await searchParams;
  try {
    const student = await apiGet<Parameters<typeof StudentDetail>[0]["student"]>(`/v1/admin/students/${id}`);
    return <StudentDetail student={student} tab={tab ?? "overview"} />;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }
}
