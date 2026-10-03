import { notFound } from "next/navigation";
import { MaterialStudio, type StudioMaterial } from "@/components/admin/studio/studio";
import { ApiError, apiGet } from "@/lib/api";

function backLabel(path: string) {
  if (path.startsWith("/admin/plans/")) return "გეგმაზე დაბრუნება";
  if (path.startsWith("/admin/lessons/")) return "გაკვეთილზე დაბრუნება";
  return "უკან";
}

export default async function AdminMaterialPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string; returnTo?: string }>;
}) {
  const { id } = await params;
  const { tab, returnTo } = await searchParams;
  let material: StudioMaterial;
  try {
    material = await apiGet<StudioMaterial>(`/v1/admin/materials/${id}`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }
  const initialTab = tab === "basics" || tab === "publish" ? tab : "content";
  const back = returnTo?.startsWith("/admin/") ? { href: returnTo, label: backLabel(returnTo) } : null;
  return <MaterialStudio key={material.id} material={material} initialTab={initialTab} returnTo={back} />;
}
