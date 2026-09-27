import { MediaLibrary } from "@/components/admin/media-library";
import { apiGet } from "@/lib/api";

type Asset = Parameters<typeof MediaLibrary>[0]["items"][number];

export default async function AdminMediaPage() {
  const data = await apiGet<{ items: Asset[] }>("/v1/admin/media?limit=200");
  return (
    <section className="flex max-w-3xl flex-col gap-4">
      <h1 className="text-3xl font-bold">მედია</h1>
      <MediaLibrary items={data.items} />
    </section>
  );
}
