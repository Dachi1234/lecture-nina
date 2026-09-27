import { MaterialStage, type MaterialPayload } from "@/components/cabinet/viewers";
import { RememberOpen } from "@/components/cabinet/remember-open";
import { apiGet, redirectAdminHome } from "@/lib/api";

export default async function MaterialPage({
  params,
  searchParams,
}: {
  params: Promise<{ materialId: string }>;
  searchParams: Promise<{ lessonId?: string }>;
}) {
  const { materialId } = await params;
  const { lessonId } = await searchParams;
  await redirectAdminHome();
  const material = await apiGet<MaterialPayload>(`/v1/me/materials/${materialId}${lessonId ? `?lessonId=${encodeURIComponent(lessonId)}` : ""}`);
  return (
    <>
      <RememberOpen materialId={material.id} />
      <MaterialStage material={material} />
    </>
  );
}
