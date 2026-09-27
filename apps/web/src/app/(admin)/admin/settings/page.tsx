import { SettingsForm } from "@/components/admin/settings-form";
import { apiGet } from "@/lib/api";

export default async function AdminSettingsPage() {
  const values = await apiGet<Record<string, string | number | null>>("/v1/admin/settings");
  return (
    <section className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold">პარამეტრები</h1>
      <SettingsForm values={values} />
    </section>
  );
}
