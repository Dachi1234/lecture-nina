import { randomUUID } from "node:crypto";
import { hashPassword } from "better-auth/crypto";
import { PrismaClient, type Prisma } from "@prisma/client";

const prisma = new PrismaClient();

const blocks = [
  { order: 1, titleEs: "¡Hola!", titleKa: "მისალმება", size: 4 },
  { order: 2, titleEs: "Me presento", titleKa: "თავის გაცნობა", size: 5 },
  { order: 3, titleEs: "En el café", titleKa: "კაფეში", size: 5 },
  { order: 4, titleEs: "¿Dónde está?", titleKa: "მიმართულებები", size: 4 },
  { order: 5, titleEs: "Mi día", titleKa: "ჩემი დღე", size: 5 },
  { order: 6, titleEs: "Mi familia", titleKa: "ოჯახი", size: 4 },
  { order: 7, titleEs: "De compras", titleKa: "საყიდლები", size: 5 },
  { order: 8, titleEs: "En la ciudad", titleKa: "ქალაქში", size: 5 },
  { order: 9, titleEs: "De viaje", titleKa: "მოგზაურობა", size: 4 },
  { order: 10, titleEs: "A1", titleKa: "შემოწმება", size: 4 },
] as const;

const namedTopics: Record<number, { titleKa: string; titleEs?: string }> = {
  1: { titleKa: "მისალმება", titleEs: "Los saludos" },
  3: { titleKa: "თავის გაცნობა", titleEs: "Me presento" },
  9: { titleKa: "რიცხვები 1–20", titleEs: "Los números" },
  14: { titleKa: "საკვები და სასმელი", titleEs: "Comida y bebida" },
  15: { titleKa: "querer / quiero", titleEs: "querer" },
  16: { titleKa: "თავაზიანი თხოვნა", titleEs: "Por favor" },
};

type ProgressName = "NOT_STARTED" | "OPENED" | "COMPLETED";

type ItemSpec = {
  title: string;
  type: Prisma.MaterialCreateInput["type"];
  status: ProgressName;
  kind?: Prisma.AssignmentCreateInput["kind"];
  groupLabel?: string;
  subtitle?: string;
  dueAt?: Date;
  lastStep?: number;
  bestScore?: number;
  content?: Prisma.InputJsonValue;
  topicNumber?: number;
};

const exercise = (templateId: string, title: string, instructionKa: string, steps: unknown[]): Prisma.InputJsonValue => ({
  schemaVersion: 1,
  templateId,
  title,
  instructionKa,
  passThreshold: 0.7,
  steps,
});

async function clear() {
  await prisma.exerciseAttempt.deleteMany();
  await prisma.materialProgress.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.teacherNote.deleteMany();
  await prisma.checklistItem.deleteMany();
  await prisma.lessonTopic.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.materialRevision.deleteMany();
  await prisma.materialTopic.deleteMany();
  await prisma.materialAsset.deleteMany();
  await prisma.material.deleteMany();
  await prisma.vocabularyEntry.deleteMany();
  await prisma.invite.deleteMany();
  await prisma.studentProfile.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.verification.deleteMany();
  await prisma.user.deleteMany();
  await prisma.topic.deleteMany();
  await prisma.block.deleteMany();
  await prisma.course.deleteMany();
  await prisma.siteSetting.deleteMany();
}

async function createUser(input: {
  email: string;
  name: string;
  nameLatin: string;
  role: "ADMIN" | "STUDENT";
  password: string;
}) {
  const user = await prisma.user.create({
    data: {
      email: input.email,
      name: input.name,
      nameLatin: input.nameLatin,
      role: input.role,
      emailVerified: true,
    },
  });
  await prisma.account.create({
    data: {
      id: randomUUID(),
      accountId: user.id,
      providerId: "credential",
      userId: user.id,
      password: await hashPassword(input.password),
    },
  });
  return user;
}

async function main() {
  await clear();

  await createUser({
    email: "nina@nina.local",
    name: "ნინა",
    nameLatin: "Nina",
    role: "ADMIN",
    password: "NinaDev-2026",
  });
  const mariam = await createUser({
    email: "mariam@nina.local",
    name: "მარიამი",
    nameLatin: "Mariam",
    role: "STUDENT",
    password: "MariamDev-2026",
  });

  const course = await prisma.course.create({
    data: { slug: "a1", title: "A1", level: "A1", order: 1 },
  });

  const topicId = new Map<number, string>();
  let number = 1;
  for (const blockSpec of blocks) {
    const block = await prisma.block.create({
      data: {
        courseId: course.id,
        order: blockSpec.order,
        titleEs: blockSpec.titleEs,
        titleKa: blockSpec.titleKa,
      },
    });
    for (let index = 0; index < blockSpec.size; index += 1) {
      const named = namedTopics[number];
      const topic = await prisma.topic.create({
        data: {
          blockId: block.id,
          number,
          titleKa: named?.titleKa ?? `თემა ${number}`,
          titleEs: named?.titleEs ?? blockSpec.titleEs,
        },
      });
      topicId.set(number, topic.id);
      number += 1;
    }
  }

  const profile = await prisma.studentProfile.create({
    data: {
      userId: mariam.id,
      phone: "995555112233",
      preferredChannel: "WHATSAPP",
      goal: "TRAVEL",
      goalNote: "Valencia",
      courseId: course.id,
      nextLessonAt: new Date("2026-10-03T15:00:00.000Z"),
      giftLessonsLeft: 0,
      greetingForm: "feminine",
      onboardedAt: new Date("2026-09-08T14:00:00.000Z"),
    },
  });

  const checkpoint1 = exercise("checkpoint", "ბლოკი 1", "შეამოწმე პირველი ბლოკი", [
    { sections: [{ labelKa: "მისალმება", stepRefs: [] }] },
  ]);
  const checkpoint2 = exercise("checkpoint", "ბლოკი 2", "შეამოწმე მეორე ბლოკი", [
    { sections: [{ labelKa: "თავის გაცნობა", stepRefs: [] }] },
  ]);

  const lessons: Array<{
    number: number;
    title: string;
    date: string;
    topics: number[];
    isGift?: boolean;
    note?: string;
    noteAt?: Date;
    items: ItemSpec[];
  }> = [
    {
      number: 1,
      title: "¡Hola! — პირველი შეხვედრა",
      date: "2026-09-08T14:00:00.000Z",
      topics: [1],
      isGift: true,
      items: [
        { title: "Los saludos", type: "INFO_CARD", status: "COMPLETED", subtitle: "ბარათი 9:16", topicNumber: 1, content: { pages: [], altKa: "მისალმება" } },
        { title: "Buenos días", type: "DIALOGUE", status: "COMPLETED", subtitle: "დიალოგი · 6 ხაზი", topicNumber: 1 },
        {
          title: "აირჩიე სწორი მისალმება",
          type: "EXERCISE",
          status: "COMPLETED",
          topicNumber: 1,
          content: exercise("multiple_choice", "აირჩიე სწორი მისალმება", "აირჩიე სწორი პასუხი", [
            { prompt: { es: "Good night", ka: "ღამე მშვიდობისა" }, options: [{ id: "a", text: "buenas noches" }, { id: "b", text: "buenos días" }], correctId: "a" },
          ]),
        },
        { title: "hola / adiós", type: "VOCAB", status: "COMPLETED", topicNumber: 1, content: { layout: "list", title: { es: "Los saludos", ka: "მისალმება" } } },
        {
          title: "დააკავშირე სიტყვა და სურათი",
          type: "EXERCISE",
          status: "COMPLETED",
          topicNumber: 1,
          content: exercise("matching_pairs", "დააკავშირე სიტყვა და სურათი", "დააკავშირე წყვილები", [
            { mode: "word_image", pairs: [{ left: "el café", right: "ყავა" }, { left: "el cuaderno", right: "რვეული" }] },
          ]),
        },
      ],
    },
    {
      number: 2,
      title: "El alfabeto y los sonidos",
      date: "2026-09-12T14:00:00.000Z",
      topics: [2],
      isGift: true,
      items: [
        { title: "El alfabeto", type: "INFO_CARD", status: "COMPLETED", topicNumber: 2 },
        { title: "გამოთქმა: ll, ñ, j", type: "PRONUNCIATION", status: "COMPLETED", topicNumber: 2, content: { title: "ll ñ j", items: [{ grapheme: "ll" }, { grapheme: "ñ" }, { grapheme: "j" }], examples: ["me llamo", "España"] } },
        { title: "ბგერები — აუდიო", type: "AUDIO", status: "COMPLETED", topicNumber: 2 },
        { title: "ანბანის ბარათები", type: "VOCAB", status: "COMPLETED", topicNumber: 2 },
        { title: "წაიკითხე ხმამაღლა", type: "DOCUMENT", status: "COMPLETED", topicNumber: 2 },
        { title: "ბლოკი 1", type: "CHECKPOINT", status: "COMPLETED", subtitle: "19 / 20", topicNumber: 1, bestScore: 0.95, content: checkpoint1 },
      ],
    },
    {
      number: 3,
      title: "Me presento",
      date: "2026-09-15T14:00:00.000Z",
      topics: [3],
      items: [
        { title: "Me llamo…", type: "DIALOGUE", status: "COMPLETED", topicNumber: 3 },
        { title: "თავის გაცნობის ბარათები", type: "INFO_CARD", status: "COMPLETED", topicNumber: 3 },
        {
          title: "ჩასვი სწორი ფორმა: ser",
          type: "EXERCISE",
          status: "COMPLETED",
          topicNumber: 3,
          content: exercise("fill_blank", "ჩასვი სწორი ფორმა: ser", "ჩასვი ser-ის ფორმა", [
            { verbHint: "ser", rows: [{ before: "Yo", after: "Ana.", answer: "soy" }, { before: "Tú", after: "de Tbilisi.", answer: "eres" }] },
          ]),
        },
        { title: "ser — soy, eres, es", type: "GRAMMAR", status: "COMPLETED", topicNumber: 3 },
        { title: "encantada", type: "VOCAB", status: "COMPLETED", topicNumber: 3 },
        { title: "ვიდეო: Me presento", type: "VIDEO", status: "COMPLETED", topicNumber: 3 },
        { title: "el / la — გადაიტანე სწორ ყუთში", type: "GAME", status: "COMPLETED", topicNumber: 3, content: exercise("drag_sort", "el / la", "გადაიტანე სწორ ყუთში", [{ buckets: [{ id: "el", label: "el" }, { id: "la", label: "la" }], items: [{ id: "1", text: "café", bucketId: "el" }, { id: "2", text: "cuenta", bucketId: "la" }] }]) },
        { title: "ჩემი წარდგენა", type: "DOCUMENT", status: "COMPLETED", topicNumber: 3 },
        { title: "გაიმეორე დიალოგი", type: "AUDIO", status: "COMPLETED", topicNumber: 3 },
      ],
    },
    {
      number: 4,
      title: "Ana en Barcelona",
      date: "2026-09-19T14:00:00.000Z",
      topics: [4, 5, 6, 7, 8],
      items: [
        { title: "Ana en Barcelona", type: "STORY", status: "COMPLETED", topicNumber: 4 },
        {
          title: "Ana es de Barcelona.",
          type: "EXERCISE",
          status: "COMPLETED",
          topicNumber: 4,
          content: exercise("swipe_true_false", "Ana en Barcelona", "გადაფურცლე ან დააჭირე", [
            { statement: "Ana es de Barcelona.", isTrue: false },
          ]),
        },
        { title: "ქვეყნები", type: "VOCAB", status: "COMPLETED", topicNumber: 5 },
        { title: "ser და estar — პირველი ნახვა", type: "GRAMMAR", status: "COMPLETED", topicNumber: 6 },
        { title: "რუკა", type: "INFO_CARD", status: "COMPLETED", topicNumber: 7 },
        { title: "დიალოგი ბარსელონაში", type: "DIALOGUE", status: "COMPLETED", topicNumber: 8 },
        { title: "მოსმენა: Ana", type: "AUDIO", status: "COMPLETED", topicNumber: 4 },
        { title: "ტექსტი", type: "DOCUMENT", status: "COMPLETED", topicNumber: 4 },
      ],
    },
    {
      number: 5,
      title: "Los números y la hora",
      date: "2026-09-22T14:00:00.000Z",
      topics: [9, 10, 11, 12, 13],
      items: [
        { title: "რიცხვები 1–20", type: "VOCAB", status: "COMPLETED", topicNumber: 9 },
        { title: "¿Qué hora es?", type: "GRAMMAR", status: "COMPLETED", topicNumber: 10 },
        { title: "საათი — ბარათები", type: "INFO_CARD", status: "COMPLETED", topicNumber: 10 },
        { title: "დიალოგი: დრო", type: "DIALOGUE", status: "COMPLETED", topicNumber: 11 },
        { title: "მოსმენა: la hora", type: "AUDIO", status: "COMPLETED", topicNumber: 11 },
        { title: "ვიდეო: los números", type: "VIDEO", status: "COMPLETED", topicNumber: 9 },
        { title: "სავარჯიშო: რიცხვები", type: "EXERCISE", status: "COMPLETED", topicNumber: 9 },
        { title: "PDF: los números", type: "DOCUMENT", status: "COMPLETED", topicNumber: 12 },
        { title: "გამოთქმა: ce", type: "PRONUNCIATION", status: "COMPLETED", topicNumber: 9, content: { title: "ce", items: [{ grapheme: "ce" }], examples: ["once"] } },
        { title: "ბლოკი 2", type: "CHECKPOINT", status: "COMPLETED", subtitle: "17 / 20", topicNumber: 9, bestScore: 0.85, content: checkpoint2 },
      ],
    },
    {
      number: 6,
      title: "En el café — შეკვეთა",
      date: "2026-09-26T14:00:00.000Z",
      topics: [14, 15, 16],
      note: "დღეს ანა და ლუკასი კაფეში შედიან. ჯერ ვიდეოს უყურე, მერე სცადე სავარჯიშო — წესს შემდეგ ერთად ავხსნით. ¡Ánimo!",
      noteAt: new Date("2026-09-24T10:00:00.000Z"),
      items: [
        { title: "Por favor", type: "DIALOGUE", status: "COMPLETED", groupLabel: "1 · ვხედავთ სიტუაციას", topicNumber: 16 },
        { title: "Un café con leche", type: "VOCAB", status: "COMPLETED", groupLabel: "1 · ვხედავთ სიტუაციას", topicNumber: 14 },
        {
          title: "Ana y Lucas en el café",
          type: "VIDEO",
          status: "COMPLETED",
          subtitle: "ვიდეო-დიალოგი · 2:10",
          groupLabel: "1 · ვხედავთ სიტუაციას",
          topicNumber: 14,
          content: { dialogue: { speakers: [{ id: "ana", name: "Ana", initial: "A", tone: "burgundy" }, { id: "lucas", name: "Lucas", initial: "L", tone: "teal" }], lines: [{ speakerId: "lucas", es: "¡Hola! ¿Qué quieres tomar?", en: "Hi! What do you want to drink?" }] } },
        },
        {
          title: "დიალოგის ტექსტი (ES / EN)",
          type: "DIALOGUE",
          status: "COMPLETED",
          subtitle: "დიალოგი · 8 ხაზი",
          groupLabel: "1 · ვხედავთ სიტუაციას",
          topicNumber: 14,
        },
        {
          title: "En el café · ლექსიკის ბარათები",
          type: "VOCAB",
          status: "COMPLETED",
          subtitle: "ბარათი 9:16 · 4 ცალი",
          groupLabel: "2 · სიტყვები და წესი",
          topicNumber: 14,
          content: { layout: "image", title: { es: "En el café", ka: "კაფეში" }, pages: [] },
        },
        { title: "El menú del día", type: "INFO_CARD", status: "COMPLETED", groupLabel: "2 · სიტყვები და წესი", topicNumber: 14 },
        { title: "La cuenta, por favor", type: "DIALOGUE", status: "COMPLETED", groupLabel: "2 · სიტყვები და წესი", topicNumber: 16 },
        {
          title: "querer — quiero, quieres…",
          type: "GRAMMAR",
          status: "OPENED",
          subtitle: "გრამატიკა · ვიზუალური ახსნა",
          groupLabel: "2 · სიტყვები და წესი",
          topicNumber: 15,
        },
        {
          title: "გამოთქმა: c / z",
          type: "PRONUNCIATION",
          status: "NOT_STARTED",
          subtitle: "გამოთქმა · აუდიოთი",
          groupLabel: "2 · სიტყვები და წესი",
          topicNumber: 14,
          content: { title: "c / z", items: [{ grapheme: "c" }, { grapheme: "z" }], examples: ["cerveza"] },
        },
        {
          title: "ააწყე წინადადება — ¿Qué vas a tomar?",
          type: "EXERCISE",
          status: "OPENED",
          subtitle: "ინტერაქტიული სავარჯიშო · 8 ნაბიჯი · 3/8",
          groupLabel: "3 · ვიყენებთ",
          lastStep: 3,
          topicNumber: 15,
          content: exercise(
            "sentence_builder",
            "¿Qué vas a tomar?",
            "ააწყე წინადადება",
            [
              { promptKa: "მე საქართველოდან ვარ, მაგრამ ბარსელონაში ვცხოვრობ.", tiles: ["vivo", "en", "Barcelona", "pero", "Soy", "de", "Georgia,"], answer: ["Soy", "de", "Georgia,", "pero", "vivo", "en", "Barcelona"] },
              { promptKa: "მინდა ყავა რძით.", tiles: ["con", "leche", "Un", "café"], answer: ["Un", "café", "con", "leche"] },
              { promptKa: "ანგარიში, გთხოვ.", tiles: ["por", "favor", "La", "cuenta"], answer: ["La", "cuenta,", "por", "favor"] },
              { promptKa: "რას დალევ?", tiles: ["vas", "a", "tomar", "¿Qué"], answer: ["¿Qué", "vas", "a", "tomar?"] },
              { promptKa: "მინდა წვენი.", tiles: ["zumo", "Quiero", "un"], answer: ["Quiero", "un", "zumo"] },
              { promptKa: "არა, გმადლობ.", tiles: ["gracias", "No"], answer: ["No,", "gracias"] },
              { promptKa: "რა ღირს?", tiles: ["es", "¿Cuánto"], answer: ["¿Cuánto", "es?"] },
              { promptKa: "ტოსტი, გთხოვ.", tiles: ["por", "favor", "una", "tostada"], answer: ["una", "tostada,", "por", "favor"] },
            ],
          ),
        },
        {
          title: "დაწერე დიალოგი",
          type: "DIALOGUE",
          status: "NOT_STARTED",
          kind: "HOMEWORK",
          subtitle: "შეკვეთა კაფეში, 6–8 ხაზი",
          dueAt: new Date("2026-10-02T15:00:00.000Z"),
          topicNumber: 16,
        },
        {
          title: "მოუსმინე: Diálogo 3",
          type: "AUDIO",
          status: "NOT_STARTED",
          kind: "HOMEWORK",
          subtitle: "აუდიო · 1:24",
          dueAt: new Date("2026-10-03T15:00:00.000Z"),
          topicNumber: 14,
          content: { transcript: { speakers: [], lines: [] } },
        },
      ],
    },
    {
      number: 7,
      title: "¿Dónde está el metro?",
      date: "2026-10-03T15:00:00.000Z",
      topics: [16],
      items: [
        { title: "¿Dónde está…?", type: "GRAMMAR", status: "NOT_STARTED", topicNumber: 16 },
        { title: "მიმართულებების ბარათები", type: "INFO_CARD", status: "NOT_STARTED", topicNumber: 16 },
        { title: "ელ მეტრო — ვიდეო", type: "VIDEO", status: "NOT_STARTED", topicNumber: 16 },
        {
          title: "მოსმენა: ¿Qué pide Laura?",
          type: "EXERCISE",
          status: "NOT_STARTED",
          subtitle: "აუდიო + კითხვა · 1:05",
          topicNumber: 14,
          content: exercise("listening", "მოუსმინე და უპასუხე", "რა შეუკვეთა ლაურამ?", [
            { questionEs: "¿Qué pide Laura?", questionKa: "რა შეუკვეთა ლაურამ?", options: [{ id: "te", text: "un té" }, { id: "zumo", text: "un zumo" }, { id: "cafe", text: "un café" }, { id: "agua", text: "agua" }], correctId: "cafe" },
          ]),
        },
        { title: "La carta del café", type: "DOCUMENT", status: "NOT_STARTED", subtitle: "PDF · 2 გვ.", topicNumber: 14, content: { allowDownload: true } },
        {
          title: "შენ კაფეში ხარ. რას უპასუხებ?",
          type: "EXERCISE",
          status: "NOT_STARTED",
          topicNumber: 16,
          content: exercise("branching_dialogue", "შენ კაფეში ხარ", "აირჩიე პასუხი", [
            {
              start: "h",
              speakers: [{ id: "lucas", name: "Lucas", initial: "L", tone: "teal" }],
              nodes: [{ id: "h", speakerId: "lucas", text: "¡Hola! ¿Qué quieres tomar?", choices: [{ text: "Un café con leche, por favor.", next: "eat", isGood: true }] }],
            },
          ]),
        },
        { title: "izquierda / derecha", type: "VOCAB", status: "NOT_STARTED", topicNumber: 16 },
        { title: "დიალოგი ქუჩაში", type: "DIALOGUE", status: "NOT_STARTED", topicNumber: 16 },
        { title: "გამოთქმა: rr", type: "PRONUNCIATION", status: "NOT_STARTED", topicNumber: 16 },
      ],
    },
  ];

  const checkpointIds: string[] = [];

  for (const lessonSpec of lessons) {
    const lesson = await prisma.lesson.create({
      data: {
        studentId: profile.id,
        number: lessonSpec.number,
        title: lessonSpec.title,
        date: new Date(lessonSpec.date),
        noteFromNina: lessonSpec.note,
        readyForStudent: true,
        isGift: lessonSpec.isGift ?? false,
        topics: {
          create: lessonSpec.topics.map((topicNumber) => ({ topicId: topicId.get(topicNumber)! })),
        },
      },
    });
    if (lessonSpec.note && lessonSpec.noteAt) {
      await prisma.teacherNote.create({
        data: {
          studentId: profile.id,
          body: lessonSpec.note,
          visibleToStudent: true,
          createdAt: lessonSpec.noteAt,
        },
      });
    }

    for (const [order, item] of lessonSpec.items.entries()) {
      const topic = item.topicNumber ? topicId.get(item.topicNumber) : undefined;
      const material = await prisma.material.create({
        data: {
          type: item.type,
          title: item.title,
          subtitle: item.subtitle,
          content: item.content ?? {},
          status: "PUBLISHED",
          topics: topic ? { create: { topicId: topic } } : undefined,
        },
      });
      const revision = await prisma.materialRevision.create({
        data: { materialId: material.id, title: item.title, content: item.content ?? {} },
      });
      await prisma.assignment.create({
        data: {
          studentId: profile.id,
          materialId: material.id,
          lessonId: lesson.id,
          kind: item.kind ?? "LESSON_MATERIAL",
          groupLabel: item.groupLabel,
          order,
          dueAt: item.dueAt,
          readyForStudent: true,
        },
      });
      if (item.status !== "NOT_STARTED") {
        await prisma.materialProgress.create({
          data: {
            studentId: profile.id,
            materialId: material.id,
            status: item.status,
            openedAt: new Date(lessonSpec.date),
            completedAt: item.status === "COMPLETED" ? new Date(lessonSpec.date) : null,
            lastStep: item.lastStep,
            bestScore: item.bestScore,
          },
        });
      }
      if (item.type === "CHECKPOINT") checkpointIds.push(material.id);
      if (item.lastStep) {
        await prisma.exerciseAttempt.create({
          data: {
            studentId: profile.id,
            materialId: material.id,
            contentRevisionId: revision.id,
            answers: { step: item.lastStep },
            finishedAt: null,
          },
        });
      }
    }
  }

  const [block1, block2] = await prisma.block.findMany({
    where: { courseId: course.id, order: { in: [1, 2] } },
    orderBy: { order: "asc" },
  });
  if (block1 && checkpointIds[0]) {
    await prisma.block.update({ where: { id: block1.id }, data: { checkpointMaterialId: checkpointIds[0] } });
  }
  if (block2 && checkpointIds[1]) {
    await prisma.block.update({ where: { id: block2.id }, data: { checkpointMaterialId: checkpointIds[1] } });
  }

  const personal = await prisma.material.create({
    data: {
      type: "VOCAB",
      title: "Transporte en Valencia",
      subtitle: "ლექსიკა · ნინასგან შენთვის",
      content: { layout: "list", title: { es: "Transporte en Valencia", ka: "ტრანსპორტი ვალენსიაში" } },
      status: "PUBLISHED",
      personalForId: profile.id,
    },
  });
  await prisma.assignment.create({
    data: {
      studentId: profile.id,
      materialId: personal.id,
      kind: "PERSONAL",
      readyForStudent: true,
    },
  });

  const words: Array<{ es: string; ka: string; en: string; topic?: number; personal?: boolean; label?: string }> = [
    { es: "hola", ka: "გამარჯობა", en: "hello", topic: 1 },
    { es: "buenos días", ka: "დილა მშვიდობისა", en: "good morning", topic: 1 },
    { es: "buenas noches", ka: "ღამე მშვიდობისა", en: "good night", topic: 1 },
    { es: "adiós", ka: "ნახვამდის", en: "goodbye", topic: 1 },
    { es: "encantada", ka: "სასიამოვნოა", en: "nice to meet you", topic: 3 },
    { es: "me llamo", ka: "მე მქვია", en: "my name is", topic: 3 },
    { es: "once", ka: "თერთმეტი", en: "eleven", topic: 9 },
    { es: "el café", ka: "ყავა", en: "coffee", topic: 14 },
    { es: "la tostada", ka: "ტოსტი", en: "toast", topic: 14 },
    { es: "el zumo", ka: "წვენი", en: "juice", topic: 14 },
    { es: "el té", ka: "ჩაი", en: "tea", topic: 14 },
    { es: "quiero", ka: "მინდა", en: "I want", topic: 15 },
    { es: "quieres", ka: "გინდა", en: "you want", topic: 15 },
    { es: "la cuenta", ka: "ანგარიში", en: "the bill", topic: 16 },
    { es: "por favor", ka: "გთხოვ", en: "please", topic: 16 },
    { es: "el metro", ka: "მეტრო", en: "subway", personal: true, label: "Valencia" },
  ];
  await prisma.vocabularyEntry.createMany({
    data: words.map((word) => ({
      es: word.es,
      ka: word.ka,
      en: word.en,
      topicId: word.topic ? topicId.get(word.topic) : undefined,
      personalForId: word.personal ? profile.id : undefined,
      personalLabel: word.label,
    })),
  });

  await prisma.siteSetting.createMany({
    data: [
      { key: "price_gel", value: 30 },
      { key: "lesson_minutes", value: 75 },
      { key: "gift_lessons", value: 2 },
      { key: "checkpoint_pass", value: 0.7 },
    ],
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error: unknown) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
