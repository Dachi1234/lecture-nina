import { randomUUID } from "node:crypto";
import { hashPassword } from "better-auth/crypto";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// A1 syllabus draft: units with lesson plan titles. Nina edits these in /admin/curriculum.
const syllabus: { titleKa: string; titleEs: string; plans: [string, string][] }[] = [
  { titleKa: "მისალმება", titleEs: "¡Hola!", plans: [["მისალმება", "Los saludos"], ["ანბანი და ბგერები", "El alfabeto"], ["თავის გაცნობა", "Me presento"], ["ser — ვინ ვარ", "El verbo ser"]] },
  { titleKa: "თავის გაცნობა", titleEs: "Me presento", plans: [["ქვეყნები და ეროვნებები", "Países"], ["ser და estar", "Ser y estar"], ["ესპანეთის რუკა", "España"], ["სად ცხოვრობ?", "¿Dónde vives?"], ["რიცხვები 1–20", "Los números"]] },
  { titleKa: "კაფეში", titleEs: "En el café", plans: [["რომელი საათია?", "La hora"], ["შეხვედრაზე შეთანხმება", "Quedar"], ["რიცხვები 20–100", "Más números"], ["კვირის დღეები", "Los días de la semana"], ["საკვები და სასმელი", "Comida y bebida"]] },
  { titleKa: "მიმართულებები", titleEs: "¿Dónde está?", plans: [["querer / quiero", "querer"], ["თავაზიანი თხოვნა", "Por favor"], ["სად არის?", "¿Dónde está?"], ["მიმართულებები", "Direcciones"]] },
  { titleKa: "ჩემი დღე", titleEs: "Mi día", plans: [["ჩემი დღე", "Mi día"], ["რეფლექსური ზმნები", "Verbos reflexivos"], ["განრიგი", "Horarios"], ["ჩვევები", "Hábitos"], ["რამდენად ხშირად?", "¿Con qué frecuencia?"]] },
  { titleKa: "ოჯახი", titleEs: "Mi familia", plans: [["ოჯახი", "La familia"], ["აღწერა", "Descripciones"], ["mi, tu, su", "Posesivos"], ["tener და ასაკი", "Tener"]] },
  { titleKa: "საყიდლები", titleEs: "De compras", plans: [["საყიდლები", "De compras"], ["ფერები", "Los colores"], ["ტანსაცმელი", "La ropa"], ["რა ღირს?", "¿Cuánto cuesta?"], ["este / ese", "Demostrativos"]] },
  { titleKa: "ქალაქში", titleEs: "En la ciudad", plans: [["ქალაქი", "La ciudad"], ["ტრანსპორტი", "El transporte"], ["hay და está", "Hay y está"], ["გეგმები: ir a", "Ir a + infinitivo"], ["ამინდი", "El tiempo"]] },
  { titleKa: "მოგზაურობა", titleEs: "De viaje", plans: [["მოგზაურობა", "De viaje"], ["სასტუმროში", "En el hotel"], ["სადგურზე", "En la estación"], ["წარსული — პირველი ნახვა", "El pasado"]] },
  { titleKa: "შემოწმება", titleEs: "A1", plans: [["გამეორება: ლექსიკა", "Repaso: vocabulario"], ["გამეორება: გრამატიკა", "Repaso: gramática"], ["მოსმენა და კითხვა", "Comprensión"], ["A1 შემაჯამებელი", "Examen A1"]] },
];

async function createUser(input: { email: string; name: string; nameLatin: string; role: "ADMIN" | "STUDENT"; password: string }) {
  const user = await prisma.user.create({
    data: { email: input.email, name: input.name, nameLatin: input.nameLatin, role: input.role, emailVerified: true },
  });
  await prisma.account.create({
    data: { id: randomUUID(), accountId: user.id, providerId: "credential", userId: user.id, password: await hashPassword(input.password) },
  });
  return user;
}

async function main() {
  const existing = (await prisma.user.count()) + (await prisma.legacyMaterial.count()) + (await prisma.material.count());
  if (existing > 0 && process.env.SEED_FORCE !== "1") {
    console.log("Database already has data; base seed skipped. Set SEED_FORCE=1 on an empty dev database only.");
    return;
  }

  await createUser({ email: "nina@nina.local", name: "ნინა", nameLatin: "Nina", role: "ADMIN", password: "NinaDev-2026" });
  const mariam = await createUser({ email: "mariam@nina.local", name: "მარიამი", nameLatin: "Mariam", role: "STUDENT", password: "MariamDev-2026" });
  const giorgi = await createUser({ email: "giorgi@nina.local", name: "გიორგი", nameLatin: "Giorgi", role: "STUDENT", password: "GiorgiDev-2026" });

  const course = await prisma.course.create({
    data: {
      slug: "a1",
      title: "A1",
      level: "A1",
      order: 1,
      descriptionKa: "პირველი ნაბიჯები: მისალმებიდან მოგზაურობამდე.",
      units: {
        create: syllabus.map((unit, unitIndex) => ({
          order: unitIndex + 1,
          titleKa: unit.titleKa,
          titleEs: unit.titleEs,
          plans: { create: unit.plans.map(([titleKa, titleEs], planIndex) => ({ order: planIndex + 1, titleKa, titleEs, goalsKa: [], estMinutes: 75 })) },
        })),
      },
    },
  });

  const mariamProfile = await prisma.studentProfile.create({
    data: { userId: mariam.id, goal: "TRAVEL", enrollments: { create: { courseId: course.id } } },
  });
  const giorgiProfile = await prisma.studentProfile.create({
    data: { userId: giorgi.id, goal: "RELOCATION", greetingForm: "masculine", enrollments: { create: { courseId: course.id } } },
  });
  await prisma.group.create({
    data: {
      name: "საღამოს ჯგუფი",
      courseId: course.id,
      members: { create: [{ studentId: mariamProfile.id }, { studentId: giorgiProfile.id }] },
    },
  });

  await prisma.siteSetting.createMany({
    data: [
      { key: "price_gel", value: 30 },
      { key: "lesson_minutes", value: 75 },
      { key: "gift_lessons", value: 2 },
      { key: "checkpoint_pass", value: 0.7 },
    ],
    skipDuplicates: true,
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
