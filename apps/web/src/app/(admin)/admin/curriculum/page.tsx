import { CurriculumBoard } from "@/components/admin/curriculum-board";
import { apiGet } from "@/lib/api";

type Course = Parameters<typeof CurriculumBoard>[0]["courses"][number];

export default async function CurriculumPage() {
  const data = await apiGet<{ courses: Course[] }>("/v1/admin/curriculum");
  return (
    <section className="flex flex-col gap-4">
      <div>
        <h1 className="text-3xl font-bold">კურიკულუმი</h1>
        <p className="mt-1 text-ink-muted">შიდა ნომერი მხოლოდ აქ ჩანს. მოსწავლე მას ვერ ხედავს.</p>
      </div>
      <CurriculumBoard courses={data.courses} />
    </section>
  );
}
