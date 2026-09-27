import { notFound } from "next/navigation";
import { MaterialStudio, type StudioMaterial } from "@/components/admin/studio/studio";
import { ApiError, apiGet } from "@/lib/api";
import { loadTopics } from "@/lib/topics";

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
  const topics = await loadTopics();
  const initialTab = tab === "basics" || tab === "publish" ? tab : "content";
  const back = returnTo?.startsWith("/admin/") ? { href: returnTo, label: returnTo.includes("/lessons/") ? "გაკვეთილზე დაბრუნება" : "უკან" } : null;
  return <MaterialStudio key={material.id} material={material} topics={topics} initialTab={initialTab} returnTo={back} />;
}
