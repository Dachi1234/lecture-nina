import { LeadBoard } from "@/components/admin/lead-board";
import { apiGet } from "@/lib/api";

type Lead = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  channel: string;
  goal: string | null;
  days: string[];
  timeOfDay: string | null;
  note: string | null;
  adminNote: string | null;
  source: string | null;
  status: string;
  createdAt: string;
};

export default async function LeadsPage() {
  const data = await apiGet<{ items: Lead[] }>("/v1/admin/leads");
  return (
    <section className="flex max-w-4xl flex-col gap-4">
      <h1 className="text-3xl font-bold">ლიდები</h1>
      <LeadBoard leads={data.items} />
    </section>
  );
}
