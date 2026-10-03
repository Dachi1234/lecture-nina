import Link from "next/link";
import { StudentCreate } from "@/components/admin/student-create";
import { apiGet } from "@/lib/api";
import { lessonWhen } from "@/lib/dates";

type Student = {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  courses: { id: string; title: string }[];
  groups: { id: string; name: string }[];
  nextLessonAt: string | null;
  invite: "none" | "sent" | "accepted";
};

const inviteKa = { none: "მოწვევა არ არის", sent: "მოწვევა გაგზავნილია", accepted: "შესულია" };

export default async function StudentsPage() {
  const [data, courses, groups] = await Promise.all([
    apiGet<{ items: Student[] }>("/v1/admin/students"),
    apiGet<{ items: { id: string; title: string; isArchived: boolean }[] }>("/v1/admin/courses"),
    apiGet<{ items: { id: string; name: string; isArchived: boolean }[] }>("/v1/admin/groups"),
  ]);
  const active = data.items.filter((student) => student.isActive);
  const inactive = data.items.filter((student) => !student.isActive);
  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">მოსწავლეები</h1>
          <p className="mt-2 text-ink-muted">{active.length} აქტიური{inactive.length ? ` · ${inactive.length} შეჩერებული` : ""}</p>
        </div>
        <StudentCreate courses={courses.items.filter((course) => !course.isArchived)} groups={groups.items.filter((group) => !group.isArchived)} />
      </div>
      <div className="overflow-x-auto rounded-2xl border-[1.5px] border-line bg-card">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-paper-deep text-ink-muted">
            <tr>
              <th className="px-4 py-3 font-semibold">სახელი</th>
              <th className="px-4 py-3 font-semibold">კურსი · ჯგუფი</th>
              <th className="px-4 py-3 font-semibold">შემდეგი გაკვეთილი</th>
              <th className="px-4 py-3 font-semibold">ანგარიში</th>
            </tr>
          </thead>
          <tbody>
            {[...active, ...inactive].map((student) => (
              <tr key={student.id} className={`border-t border-line-soft ${student.isActive ? "" : "opacity-60"}`}>
                <td className="px-4 py-3">
                  <Link href={`/admin/students/${student.id}`} className="font-bold hover:text-teal-deep">
                    {student.name}
                  </Link>
                  <p className="text-ink-muted">{student.email}</p>
                </td>
                <td className="px-4 py-3">
                  {[...student.courses.map((course) => course.title), ...student.groups.map((group) => group.name)].join(" · ") || "—"}
                </td>
                <td className="px-4 py-3">{student.nextLessonAt ? lessonWhen(student.nextLessonAt) : <span className="text-burgundy">არ არის დაგეგმილი</span>}</td>
                <td className="px-4 py-3">{student.isActive ? inviteKa[student.invite] : "შეჩერებული"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
