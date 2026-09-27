import "../../src/env.js";
import { collectAssetIds, exerciseContentSchema, materialReadiness, parseViewerContent } from "@nina/contracts";
import { Prisma } from "@nina/db";
import { prisma } from "../../src/db.js";
import { Kit, type Spec } from "./kit.js";
import { lessonsA } from "./lessons-a.js";
import { lessonsB } from "./lessons-b.js";
import { library } from "./library.js";
import { toolReport } from "./media.js";

const TOPICS: Record<number, [ka: string, es: string]> = {
  1: ["მისალმება", "Los saludos"], 2: ["ანბანი და ბგერები", "El alfabeto"], 3: ["თავის გაცნობა", "Me presento"], 4: ["ser — ვინ ვარ", "El verbo ser"],
  5: ["ქვეყნები და ეროვნებები", "Países"], 6: ["ser და estar", "Ser y estar"], 7: ["ესპანეთის რუკა", "España"], 8: ["სად ცხოვრობ?", "¿Dónde vives?"],
  9: ["რიცხვები 1–20", "Los números"], 10: ["რომელი საათია?", "La hora"], 11: ["შეხვედრაზე შეთანხმება", "Quedar"], 12: ["რიცხვები 20–100", "Más números"],
  13: ["კვირის დღეები", "Los días de la semana"], 14: ["საკვები და სასმელი", "Comida y bebida"], 15: ["querer / quiero", "querer"], 16: ["თავაზიანი თხოვნა", "Por favor"],
  17: ["სად არის?", "¿Dónde está?"], 18: ["მიმართულებები", "Direcciones"], 19: ["ჩემი დღე", "Mi día"], 20: ["რეფლექსური ზმნები", "Verbos reflexivos"],
  21: ["განრიგი", "Horarios"], 22: ["ჩვევები", "Hábitos"], 23: ["რამდენად ხშირად?", "¿Con qué frecuencia?"], 24: ["ოჯახი", "La familia"],
  25: ["აღწერა", "Descripciones"], 26: ["mi, tu, su", "Posesivos"], 27: ["tener და ასაკი", "Tener"], 28: ["საყიდლები", "De compras"],
  29: ["ფერები", "Los colores"], 30: ["ტანსაცმელი", "La ropa"], 31: ["რა ღირს?", "¿Cuánto cuesta?"], 32: ["este / ese", "Demostrativos"],
  33: ["ქალაქი", "La ciudad"], 34: ["ტრანსპორტი", "El transporte"], 35: ["hay და está", "Hay y está"], 36: ["გეგმები: ir a", "Ir a + infinitivo"],
  37: ["ამინდი", "El tiempo"], 38: ["მოგზაურობა", "De viaje"], 39: ["სასტუმროში", "En el hotel"], 40: ["სადგურზე", "En la estación"],
  41: ["წარსული — პირველი ნახვა", "El pasado"], 42: ["გამეორება: ლექსიკა", "Repaso: vocabulario"], 43: ["გამეორება: გრამატიკა", "Repaso: gramática"],
  44: ["მოსმენა და კითხვა", "Comprensión"], 45: ["A1 შემაჯამებელი", "Examen A1"],
};

const EXERCISE_TYPES = new Set(["EXERCISE", "GAME", "CHECKPOINT"]);

function validate(spec: Spec, content: Record<string, unknown>) {
  if (EXERCISE_TYPES.has(spec.type)) {
    const parsed = exerciseContentSchema.safeParse(content);
    if (!parsed.success) throw new Error(`${spec.title}: ${parsed.error.message}`);
  } else if (parseViewerContent(spec.type, content) === null) {
    throw new Error(`${spec.title}: content does not match the ${spec.type} viewer schema`);
  }
  const readiness = materialReadiness(spec.type, content);
  if ((spec.status ?? "PUBLISHED") === "PUBLISHED" && !readiness.ready) {
    throw new Error(`${spec.title}: not ready — ${readiness.checks.filter((check) => check.required && !check.done).map((check) => check.labelKa).join(", ")}`);
  }
  return readiness;
}

function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    return `{${Object.keys(record)
      .filter((key) => record[key] !== undefined)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${canonical(record[key])}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

async function syncAssets(materialId: string, content: unknown) {
  const ids = [...collectAssetIds(content)];
  await prisma.$transaction([
    prisma.materialAsset.deleteMany({ where: { materialId } }),
    ...(ids.length ? [prisma.materialAsset.createMany({ data: ids.map((assetId, order) => ({ materialId, assetId, role: "content", order })) })] : []),
  ]);
  return ids.length;
}

async function main() {
  const tools = toolReport();
  if (!tools.chrome || !tools.ffmpeg || !tools.edgeTts) {
    throw new Error(`missing tools: ${JSON.stringify(tools)} — set NINA_CHROME, NINA_FFMPEG_DIR, NINA_EDGE_TTS_PATH`);
  }

  const course = await prisma.course.findUnique({ where: { slug: "a1" }, include: { blocks: { include: { topics: true } } } });
  if (!course) throw new Error("run the base seed first (pnpm --filter @nina/db seed)");
  const topicId = new Map<number, string>();
  for (const block of course.blocks) for (const topic of block.topics) topicId.set(topic.number, topic.id);
  for (const [number, [titleKa, titleEs]] of Object.entries(TOPICS)) {
    const id = topicId.get(Number(number));
    if (id) await prisma.topic.update({ where: { id }, data: { titleKa, titleEs } });
  }

  const profile = await prisma.studentProfile.findFirst({ where: { user: { email: "mariam@nina.local" } } });
  const stats = { updated: 0, created: 0, revisions: 0, links: 0 };
  const byTitle = new Map<string, string>();

  const all: Array<{ spec: Spec; existingOnly: boolean }> = [
    ...lessonsA.map((spec) => ({ spec, existingOnly: true })),
    ...lessonsB.map((spec) => ({ spec, existingOnly: true })),
    ...library.map((spec) => ({ spec, existingOnly: false })),
  ];

  for (const { spec, existingOnly } of all) {
    const started = Date.now();
    const existing = await prisma.material.findFirst({ where: { title: spec.title, type: spec.type }, include: { topics: true } });
    if (!existing && existingOnly) throw new Error(`seed material not found: ${spec.title} — run the base seed first`);
    const kit = new Kit();
    const content = await spec.build(kit);
    const readiness = validate(spec, content);
    const status = spec.status ?? "PUBLISHED";
    const meta = {
      subtitle: kit.subtitle ?? spec.subtitle ?? existing?.subtitle ?? null,
      description: spec.description ?? existing?.description ?? null,
      estMinutes: spec.estMinutes ?? existing?.estMinutes ?? null,
      tags: spec.tags ?? existing?.tags ?? [],
    };
    let materialId: string;
    let changed: boolean;
    if (existing) {
      changed = canonical(existing.content) !== canonical(content) || existing.draft !== null;
      await prisma.material.update({ where: { id: existing.id }, data: { ...meta, content: content as object, draft: Prisma.DbNull, status } });
      materialId = existing.id;
      stats.updated += 1;
    } else {
      const created = await prisma.material.create({ data: { ...meta, type: spec.type, title: spec.title, content: content as object, status } });
      materialId = created.id;
      changed = true;
      stats.created += 1;
    }
    const topic = spec.topic ? topicId.get(spec.topic) : undefined;
    if (topic && !existing?.topics.some((link) => link.topicId === topic)) {
      await prisma.materialTopic.upsert({ where: { materialId_topicId: { materialId, topicId: topic } }, create: { materialId, topicId: topic }, update: {} });
    }
    if (changed && status === "PUBLISHED") {
      await prisma.materialRevision.create({ data: { materialId, title: spec.title, content: content as object, note: "seed:content" } });
      stats.revisions += 1;
    }
    stats.links += await syncAssets(materialId, content);
    byTitle.set(spec.title, materialId);
    console.log(`${existing ? "updated" : "created"}  ${spec.type.padEnd(13)} ${spec.title}  · ${readiness.summaryKa} · ${kit.assets.size} assets · ${((Date.now() - started) / 1000).toFixed(1)}s`);
  }

  const checkpoint3 = byTitle.get("ბლოკი 3 · En el café");
  const block3 = course.blocks.find((block) => block.order === 3);
  if (checkpoint3 && block3) await prisma.block.update({ where: { id: block3.id }, data: { checkpointMaterialId: checkpoint3 } });

  if (profile) {
    const lesson = await prisma.lesson.upsert({
      where: { studentId_number: { studentId: profile.id, number: 8 } },
      create: { studentId: profile.id, number: 8, title: "Mi familia", date: new Date("2026-10-07T15:00:00.000Z"), readyForStudent: false },
      update: {},
    });
    for (const number of [24, 27]) {
      const id = topicId.get(number);
      if (id) await prisma.lessonTopic.upsert({ where: { lessonId_topicId: { lessonId: lesson.id, topicId: id } }, create: { lessonId: lesson.id, topicId: id }, update: {} });
    }
    const plan = ["La familia", "tener — tengo, tienes…", "ჩასვი tener-ის ფორმა", "La familia — წყვილები"];
    for (const [order, title] of plan.entries()) {
      const materialId = byTitle.get(title);
      if (!materialId) continue;
      const assigned = await prisma.assignment.findFirst({ where: { lessonId: lesson.id, materialId } });
      if (!assigned) await prisma.assignment.create({ data: { studentId: profile.id, materialId, lessonId: lesson.id, order, readyForStudent: false } });
    }
  }

  let glossary = 0;
  for (const { spec } of all) {
    if (spec.type !== "VOCAB" || spec.title === "ანბანის ბარათები") continue;
    const material = await prisma.material.findUniqueOrThrow({ where: { id: byTitle.get(spec.title)! }, include: { topics: true } });
    const content = material.content as { title?: { es?: string }; entries?: Array<{ article?: string; es: string; ka?: string; en?: string; audio?: { assetId: string } }> };
    const personal = material.personalForId;
    const topic = material.topics[0]?.topicId ?? null;
    for (const entry of content.entries ?? []) {
      if (!entry.ka) continue;
      const es = `${entry.article ?? ""} ${entry.es}`.trim();
      const where = personal ? { es, personalForId: personal } : { es, topicId: topic };
      const found = await prisma.vocabularyEntry.findFirst({ where });
      const data = { ka: entry.ka, en: entry.en ?? null, audioAssetId: entry.audio?.assetId ?? null, category: content.title?.es ?? null };
      if (found) await prisma.vocabularyEntry.update({ where: { id: found.id }, data });
      else await prisma.vocabularyEntry.create({ data: { ...data, es, topicId: personal ? null : topic, personalForId: personal, personalLabel: personal ? "Valencia" : null } });
      glossary += 1;
    }
  }

  const assets = await prisma.mediaAsset.groupBy({ by: ["kind"], where: { tags: { has: "seed" } }, _count: true });
  console.log(JSON.stringify({ ...stats, glossary, assets: Object.fromEntries(assets.map((row) => [row.kind, row._count])) }, null, 2));
}

main()
  .then(async () => {
    await prisma.$disconnect();
    process.exit(0);
  })
  .catch(async (error: unknown) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
