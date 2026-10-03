// Demo data on top of an existing database: a second student, a group, three filled lesson plans
// (items copied from the legacy library and tagged "demo") and a few lessons. Safe to re-run.
import "../src/env.js";
import { randomUUID } from "node:crypto";
import { hashPassword } from "better-auth/crypto";
import { prisma } from "../src/db.js";
import { copyLegacyMaterial } from "../src/modules/admin/legacy.routes.js";

const day = 1000 * 60 * 60 * 24;

const sectionFor: Record<string, "WARMUP" | "CLASS" | "HOMEWORK" | "REVIEW"> = {
  PRONUNCIATION: "WARMUP",
  EXERCISE: "HOMEWORK",
  GAME: "HOMEWORK",
  DOCUMENT: "HOMEWORK",
  CHECKPOINT: "REVIEW",
};

async function ensureStudent(email: string, name: string, nameLatin: string, password: string, greetingForm: string) {
  const existing = await prisma.user.findUnique({ where: { email }, include: { student: true } });
  if (existing?.student) return existing.student;
  const user = await prisma.user.create({ data: { email, name, nameLatin, role: "STUDENT", emailVerified: true } });
  await prisma.account.create({
    data: { id: randomUUID(), accountId: user.id, providerId: "credential", userId: user.id, password: await hashPassword(password) },
  });
  return prisma.studentProfile.create({ data: { userId: user.id, greetingForm } });
}

async function main() {
  const course = await prisma.course.findFirst({ orderBy: { order: "asc" }, include: { units: { orderBy: { order: "asc" }, include: { plans: { orderBy: { order: "asc" } } } } } });
  if (!course) throw new Error("No course found. Run the base seed or the migration first.");
  const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });

  const mariam = await ensureStudent("mariam@nina.local", "მარიამი", "Mariam", "MariamDev-2026", "feminine");
  const giorgi = await ensureStudent("giorgi@nina.local", "გიორგი", "Giorgi", "GiorgiDev-2026", "masculine");
  for (const student of [mariam, giorgi]) {
    await prisma.enrollment.upsert({
      where: { studentId_courseId: { studentId: student.id, courseId: course.id } },
      create: { studentId: student.id, courseId: course.id },
      update: {},
    });
  }

  let group = await prisma.group.findFirst({ where: { name: "საღამოს ჯგუფი" } });
  if (!group) {
    group = await prisma.group.create({
      data: { name: "საღამოს ჯგუფი", courseId: course.id, members: { create: [{ studentId: mariam.id }, { studentId: giorgi.id }] } },
    });
  }

  const plans = course.units[0]?.plans.slice(0, 4) ?? [];
  for (const [index, plan] of plans.slice(0, 3).entries()) {
    if ((await prisma.planItem.count({ where: { planId: plan.id } })) > 0) continue;
    const legacy = await prisma.legacyMaterial.findMany({ where: { topicOrder: index + 1, status: "PUBLISHED" }, orderBy: { type: "asc" }, take: 6 });
    const perSection = new Map<string, number>();
    for (const row of legacy) {
      const copy = await copyLegacyMaterial(row.id, admin?.id ?? null, true);
      if (!copy) continue;
      await prisma.material.update({ where: { id: copy.id }, data: { tags: { push: "demo" }, level: "A1" } });
      const section = sectionFor[row.type] ?? "CLASS";
      const order = perSection.get(section) ?? 0;
      perSection.set(section, order + 1);
      await prisma.planItem.upsert({
        where: { planId_materialId: { planId: plan.id, materialId: copy.id } },
        create: { planId: plan.id, materialId: copy.id, section, order },
        update: {},
      });
    }
    await prisma.lessonPlan.update({
      where: { id: plan.id },
      data: { goalsKa: index === 0 ? ["მისალმება დღის სხვადასხვა დროს", "თავაზიანი დამშვიდობება"] : index === 1 ? ["ანბანის ასოები", "ბგერები, რომლებიც ქართულში არ გვაქვს"] : ["თავის წარდგენა", "ser — soy, eres, es"] },
    });
  }

  if ((await prisma.lesson.count()) === 0 && plans.length >= 4) {
    const now = Date.now();
    await prisma.lesson.createMany({
      data: [
        { planId: plans[0]!.id, studentId: mariam.id, date: new Date(now - 7 * day), durationMin: 75, publishedAt: new Date(now - 7 * day), heldAt: new Date(now - 7 * day), noteKa: "კარგი დასაწყისი! გაიმეორე მისალმებები." },
        { planId: plans[1]!.id, groupId: group.id, date: new Date(now - 2 * day), durationMin: 75, publishedAt: new Date(now - 2 * day), homeworkDueAt: new Date(now + 2 * day) },
        { planId: plans[2]!.id, studentId: mariam.id, date: new Date(now + 3 * day), durationMin: 75 },
        { planId: plans[3]!.id, groupId: group.id, date: new Date(now + 5 * day), durationMin: 75 },
      ],
    });
  }
  console.log("demo ready");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
