import Link from "next/link";
import { StudentCreate } from "@/components/admin/student-create";
import { apiGet } from "@/lib/api";
import { lessonWhen } from "@/lib/dates";

type Student = {
  id: string;
  name: string;
  email: string;
  nextLessonAt: string | null;
  progress: number;
  currentLesson: { number: number; title: string } | null;
  invite: "none" | "sent" | "accepted";
};

const inviteKa = { none: "მოწვევა არ გაგზავნილა", sent: "მოწვევა გაგზავნილია", accepted: "შესულია" };

export default async function StudentsPage() {
  const data = await apiGet<{ items: Student[] }>("/v1/admin/students");
  return (
    <section className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold">მოსწავლეები</h1>
      <StudentCreate />
      <div className="overflow-hidden rounded-2xl border-[1.5px] border-line bg-card">
        <table className="w-full text-left text-sm">
          <thead className="bg-paper-deep text-ink-muted">
            <tr>
              <th className="px-4 py-3 font-semibold">სახელი</th>
              <th className="px-4 py-3 font-semibold">გაკვეთილი</th>
              <th className="px-4 py-3 font-semibold">შემდეგი</th>
              <th className="px-4 py-3 font-semibold">პროგრესი</th>
              <th className="px-4 py-3 font-semibold">მოწვევა</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((student) => (
              <tr key={student.id} className="border-t border-line-soft">
                <td className="px-4 py-3">
                  <Link href={`/admin/students/${student.id}`} className="font-bold">{student.name}</Link>
                  <p className="text-ink-muted">{student.email}</p>
                </td>
                <td className="px-4 py-3">{student.currentLesson ? `${student.currentLesson.number} · ${student.currentLesson.title}` : "—"}</td>
                <td className="px-4 py-3">{student.nextLessonAt ? lessonWhen(student.nextLessonAt) : "—"}</td>
                <td className="px-4 py-3">{student.progress}%</td>
                <td className="px-4 py-3">{inviteKa[student.invite]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
