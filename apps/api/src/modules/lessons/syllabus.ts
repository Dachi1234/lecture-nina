import { prisma } from "../../db.js";
import type { SyllabusUnit } from "../../domain/progress.js";

export async function courseSyllabus(courseId: string): Promise<SyllabusUnit[]> {
  const units = await prisma.unit.findMany({
    where: { courseId },
    orderBy: { order: "asc" },
    select: {
      id: true,
      order: true,
      titleKa: true,
      titleEs: true,
      plans: { orderBy: { order: "asc" }, select: { id: true, order: true, titleKa: true, titleEs: true } },
    },
  });
  return units;
}
