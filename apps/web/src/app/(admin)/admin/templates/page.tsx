import { TemplateBoard } from "@/components/admin/template-board";
import { apiGet } from "@/lib/api";

export default async function TemplatesPage() {
  const [templates, students] = await Promise.all([
    apiGet<{ items: { id: string; title: string; note: string | null }[] }>("/v1/admin/lesson-templates"),
    apiGet<{ items: { id: string; name: string }[] }>("/v1/admin/students"),
  ]);
  return (
    <section className="flex max-w-3xl flex-col gap-4">
      <h1 className="text-3xl font-bold">შაბლონები</h1>
      <TemplateBoard templates={templates.items} students={students.items.map((student) => ({ id: student.id, name: student.name }))} />
    </section>
  );
}
