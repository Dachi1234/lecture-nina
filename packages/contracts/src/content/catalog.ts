import { exerciseContentSchema } from "./schema.js";

export const MATERIAL_TYPES = [
  "INFO_CARD",
  "VOCAB",
  "DIALOGUE",
  "STORY",
  "VIDEO",
  "AUDIO",
  "DOCUMENT",
  "GRAMMAR",
  "EXERCISE",
  "GAME",
  "PRONUNCIATION",
  "GRADED_READER",
  "CHECKPOINT",
  "HTML_EMBED",
] as const;

export type MaterialTypeId = (typeof MATERIAL_TYPES)[number];

export const EXERCISE_MATERIAL_TYPES: readonly MaterialTypeId[] = ["EXERCISE", "GAME", "CHECKPOINT"];

export type MaterialGroupId = "words" | "listen" | "explain" | "files" | "practice";

export const MATERIAL_GROUPS: { id: MaterialGroupId; labelKa: string; hintKa: string }[] = [
  { id: "words", labelKa: "სიტყვები და ბარათები", hintKa: "რაც მოსწავლემ უნდა დაიმახსოვროს" },
  { id: "listen", labelKa: "სიტუაცია და მოსმენა", hintKa: "ცოცხალი ესპანური: დიალოგი, ვიდეო, აუდიო" },
  { id: "explain", labelKa: "ახსნა", hintKa: "წესი, გამოთქმა, მოკლე ახსნა" },
  { id: "files", labelKa: "ფაილები და საკითხავი", hintKa: "PDF, დოკუმენტი, ტექსტი" },
  { id: "practice", labelKa: "ვარჯიში", hintKa: "ინტერაქტიული სავარჯიშოები ავტომატური შემოწმებით" },
];

export type BuildMode = "builder" | "upload" | "mixed";

export type MaterialTypeMeta = {
  type: MaterialTypeId;
  labelKa: string;
  group: MaterialGroupId;
  icon: string;
  purposeKa: string;
  studentSeesKa: string;
  build: BuildMode;
  titleExample: string;
  inWizard: boolean;
};

export const MATERIAL_CATALOG: Record<MaterialTypeId, MaterialTypeMeta> = {
  VOCAB: {
    type: "VOCAB",
    labelKa: "ლექსიკა",
    group: "words",
    icon: "vocabulary",
    purposeKa: "სიტყვების სია: ესპანური, ქართული, არტიკლი, მაგალითი, სურათი და აუდიო.",
    studentSeesKa: "ლამაზ სიას და ბარათებით ვარჯიშს (გადაბრუნება).",
    build: "builder",
    titleExample: "En el café · სიტყვები",
    inWizard: true,
  },
  INFO_CARD: {
    type: "INFO_CARD",
    labelKa: "ბარათი 9:16",
    group: "words",
    icon: "card",
    purposeKa: "შენი მზა დიზაინის ბარათები (Canva, Figma): ატვირთე სურათები თანმიმდევრობით.",
    studentSeesKa: "ბარათებს ერთმანეთის მიყოლებით, გადიდებითა და გადაფურცვლით.",
    build: "upload",
    titleExample: "El menú del día",
    inWizard: true,
  },
  DIALOGUE: {
    type: "DIALOGUE",
    labelKa: "დიალოგი",
    group: "listen",
    icon: "dialogue",
    purposeKa: "პერსონაჟები და ხაზები ესპანურად, ინგლისური თარგმანით და აუდიოთი.",
    studentSeesKa: "ჩატის ბუშტებს, ES / ES+EN გადამრთველს და ▶ ყოველ ხაზზე.",
    build: "builder",
    titleExample: "La cuenta, por favor",
    inWizard: true,
  },
  VIDEO: {
    type: "VIDEO",
    labelKa: "ვიდეო",
    group: "listen",
    icon: "video",
    purposeKa: "ატვირთე ვიდეო და, თუ გინდა, დაურთე დიალოგის ტექსტი.",
    studentSeesKa: "ვიდეოს და ქვემოთ დიალოგის ტექსტს.",
    build: "mixed",
    titleExample: "Ana y Lucas en el café",
    inWizard: true,
  },
  AUDIO: {
    type: "AUDIO",
    labelKa: "აუდიო",
    group: "listen",
    icon: "audio",
    purposeKa: "ატვირთე ჩანაწერი და ტრანსკრიფცია.",
    studentSeesKa: "პლეერს სიჩქარით 0.75× / 1× / 1.25× და ტრანსკრიფციას.",
    build: "mixed",
    titleExample: "მოუსმინე: Diálogo 3",
    inWizard: true,
  },
  STORY: {
    type: "STORY",
    labelKa: "ისტორია",
    group: "listen",
    icon: "lessons",
    purposeKa: "სცენა: ადგილი, კონტექსტი, დიალოგი, გრამატიკის და კულტურის შენიშვნა.",
    studentSeesKa: "სცენას თავიდან ბოლომდე: სად ვართ, ვინ ლაპარაკობს, რა ვისწავლეთ.",
    build: "builder",
    titleExample: "Ana en Barcelona",
    inWizard: true,
  },
  GRAMMAR: {
    type: "GRAMMAR",
    labelKa: "გრამატიკა",
    group: "explain",
    icon: "grammar",
    purposeKa: "მოკლე წესი, უღლების ცხრილი, მაგალითები, ხშირი შეცდომები და რჩევა.",
    studentSeesKa: "ვიზუალურ ახსნას: წესი ერთ ხაზად, ცხრილი, მაგალითები.",
    build: "builder",
    titleExample: "querer — quiero, quieres…",
    inWizard: true,
  },
  PRONUNCIATION: {
    type: "PRONUNCIATION",
    labelKa: "გამოთქმა",
    group: "explain",
    icon: "pronunciation",
    purposeKa: "ასოები/ბგერები აუდიოთი, მინიშნებით და მაგალითის სიტყვებით.",
    studentSeesKa: "მწვანე წრეებს — დააჭერს და მოისმენს.",
    build: "builder",
    titleExample: "გამოთქმა: c / z",
    inWizard: true,
  },
  DOCUMENT: {
    type: "DOCUMENT",
    labelKa: "დოკუმენტი",
    group: "files",
    icon: "document",
    purposeKa: "PDF ან Word ფაილი. შეგიძლია ჩამოტვირთვა დაუშვა ან აკრძალო.",
    studentSeesKa: "დოკუმენტს პირდაპირ გვერდზე და (თუ დაუშვი) ჩამოტვირთვის ღილაკს.",
    build: "upload",
    titleExample: "La carta del café",
    inWizard: true,
  },
  GRADED_READER: {
    type: "GRADED_READER",
    labelKa: "საკითხავი",
    group: "files",
    icon: "materials",
    purposeKa: "მოკლე ტექსტი ან თავი საკითხავად, პატარა ლექსიკონით.",
    studentSeesKa: "სუფთა საკითხავ გვერდს და სიტყვებს ბოლოში.",
    build: "mixed",
    titleExample: "Capítulo 1",
    inWizard: true,
  },
  EXERCISE: {
    type: "EXERCISE",
    labelKa: "სავარჯიშო",
    group: "practice",
    icon: "exercise",
    purposeKa: "ინტერაქტიული სავარჯიშო ავტომატური შემოწმებით.",
    studentSeesKa: "ნაბიჯ-ნაბიჯ სავარჯიშოს, შემოწმებას და შედეგს.",
    build: "builder",
    titleExample: "¿Qué vas a tomar?",
    inWizard: false,
  },
  GAME: {
    type: "GAME",
    labelKa: "თამაში",
    group: "practice",
    icon: "game",
    purposeKa: "სწრაფი თამაში: გადაფურცვლა, დალაგება, წყვილები.",
    studentSeesKa: "მოკლე თამაშს შედეგით.",
    build: "builder",
    titleExample: "el / la",
    inWizard: false,
  },
  CHECKPOINT: {
    type: "CHECKPOINT",
    labelKa: "შემოწმება",
    group: "practice",
    icon: "checkpoint",
    purposeKa: "ბლოკის შემაჯამებელი ტესტი ნაწილებად.",
    studentSeesKa: "ნაწილებად დაყოფილ ტესტს და ქულას.",
    build: "builder",
    titleExample: "ბლოკი 3",
    inWizard: false,
  },
  HTML_EMBED: {
    type: "HTML_EMBED",
    labelKa: "ძველი HTML სავარჯიშო",
    group: "practice",
    icon: "exercise",
    purposeKa: "გადმოტანილი ინტერაქტიული HTML (მხოლოდ მიგრაციისთვის).",
    studentSeesKa: "სავარჯიშოს დაცულ ჩარჩოში.",
    build: "upload",
    titleExample: "",
    inWizard: false,
  },
};

export type ExerciseTemplateId =
  | "multiple_choice"
  | "swipe_true_false"
  | "drag_sort"
  | "sentence_builder"
  | "fill_blank"
  | "matching_pairs"
  | "branching_dialogue"
  | "listening"
  | "checkpoint";

export type ExerciseTemplateMeta = {
  id: ExerciseTemplateId;
  labelKa: string;
  purposeKa: string;
  exampleKa: string;
  materialType: MaterialTypeId;
  defaultInstructionKa: string;
  variants: { id: string; labelKa: string }[];
};

export const EXERCISE_TEMPLATE_CATALOG: ExerciseTemplateMeta[] = [
  {
    id: "multiple_choice",
    labelKa: "აირჩიე სწორი",
    purposeKa: "კითხვა და 2–4 პასუხი. შეიძლება დიალოგის ხაზი გამოტოვებით.",
    exampleKa: "„Buenos días“ — როდის ვამბობთ?",
    materialType: "EXERCISE",
    defaultInstructionKa: "აირჩიე სწორი პასუხი",
    variants: [
      { id: "list", labelKa: "სია" },
      { id: "cards_2x2", labelKa: "ბარათები 2×2" },
      { id: "chat_context", labelKa: "ჩატის კონტექსტი" },
    ],
  },
  {
    id: "fill_blank",
    labelKa: "შეავსე გამოტოვებული",
    purposeKa: "წინადადება ცარიელი ადგილით. იდეალურია ზმნის ფორმებისთვის.",
    exampleKa: "Yo ___ Ana. → soy",
    materialType: "EXERCISE",
    defaultInstructionKa: "ჩასვი სწორი ფორმა",
    variants: [],
  },
  {
    id: "sentence_builder",
    labelKa: "ააწყე წინადადება",
    purposeKa: "სიტყვების ფილები სწორი რიგით.",
    exampleKa: "¿ · Qué · vas · a · tomar · ?",
    materialType: "EXERCISE",
    defaultInstructionKa: "ააწყე წინადადება",
    variants: [
      { id: "tiles", labelKa: "ფილები" },
      { id: "tiles_with_translation_hint", labelKa: "ფილები + თარგმანის მინიშნება" },
    ],
  },
  {
    id: "listening",
    labelKa: "მოუსმინე და უპასუხე",
    purposeKa: "აუდიო ჩანაწერი და კითხვა პასუხის ვარიანტებით.",
    exampleKa: "¿Qué pide Laura? → un café",
    materialType: "EXERCISE",
    defaultInstructionKa: "მოუსმინე და აირჩიე პასუხი",
    variants: [],
  },
  {
    id: "branching_dialogue",
    labelKa: "დიალოგი არჩევანით",
    purposeKa: "მოსწავლე თვითონ ირჩევს პასუხებს საუბარში.",
    exampleKa: "კაფეში ხარ. მიმტანი გეკითხება…",
    materialType: "EXERCISE",
    defaultInstructionKa: "აირჩიე, რას უპასუხებ",
    variants: [
      { id: "chat", labelKa: "ჩატი" },
      { id: "scene", labelKa: "სცენა" },
    ],
  },
  {
    id: "swipe_true_false",
    labelKa: "მართალია / მცდარია",
    purposeKa: "სწრაფი განცხადებები — გადაფურცვლა ან ღილაკები.",
    exampleKa: "Ana es de Barcelona. → მცდარია",
    materialType: "GAME",
    defaultInstructionKa: "მართალია თუ მცდარი?",
    variants: [
      { id: "card_stack", labelKa: "ბარათების დასტა" },
      { id: "buttons_only", labelKa: "მხოლოდ ღილაკები" },
    ],
  },
  {
    id: "drag_sort",
    labelKa: "დაალაგე ჯგუფებად",
    purposeKa: "სიტყვები სწორ ყუთებში: el / la, ser / estar…",
    exampleKa: "café → el · cuenta → la",
    materialType: "GAME",
    defaultInstructionKa: "გადაიტანე სწორ ყუთში",
    variants: [
      { id: "two_buckets", labelKa: "ორი ყუთი" },
      { id: "multi_buckets", labelKa: "რამდენიმე ყუთი" },
    ],
  },
  {
    id: "matching_pairs",
    labelKa: "დააკავშირე წყვილები",
    purposeKa: "სიტყვა ↔ თარგმანი ან სიტყვა ↔ სურათი.",
    exampleKa: "el café ↔ ყავა",
    materialType: "GAME",
    defaultInstructionKa: "დააკავშირე წყვილები",
    variants: [
      { id: "tap_pairs", labelKa: "დაჭერით" },
      { id: "lines", labelKa: "ხაზებით" },
    ],
  },
  {
    id: "checkpoint",
    labelKa: "ბლოკის შემოწმება",
    purposeKa: "შემაჯამებელი ტესტი ნაწილებად: ლექსიკა, გრამატიკა, მოსმენა.",
    exampleKa: "ბლოკი 3 · 20 კითხვა",
    materialType: "CHECKPOINT",
    defaultInstructionKa: "შეამოწმე, რა ისწავლე ამ ბლოკში",
    variants: [],
  },
];

export function exerciseTemplateMeta(id: string) {
  return EXERCISE_TEMPLATE_CATALOG.find((item) => item.id === id) ?? null;
}

export const SPEAKER_PRESETS = [
  { id: "ana", name: "Ana", initial: "A", tone: "burgundy" },
  { id: "lucas", name: "Lucas", initial: "L", tone: "teal" },
  { id: "laura", name: "Laura", initial: "La", tone: "sage" },
  { id: "nina", name: "Nina", initial: "N", tone: "mustard" },
  { id: "camarero", name: "Camarero", initial: "C", tone: "navy" },
  { id: "tu", name: "Tú", initial: "T", tone: "teal" },
] as const;

type Rec = Record<string, unknown>;

function rec(value: unknown): Rec {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Rec) : {};
}

function arr(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function text(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (!value || typeof value !== "object") return "";
  const record = value as Rec;
  if (typeof record.text === "string") return record.text.trim();
  return arr(record.content).map(text).join(" ").trim();
}

function hasAsset(value: unknown) {
  return typeof rec(value).assetId === "string";
}

export type ReadinessCheck = { id: string; labelKa: string; done: boolean; required: boolean };

export type Readiness = {
  checks: ReadinessCheck[];
  requiredDone: number;
  requiredTotal: number;
  ready: boolean;
  empty: boolean;
  summaryKa: string;
};

function dialogueChecks(value: unknown, prefix = ""): ReadinessCheck[] {
  const dialogue = rec(value);
  const speakers = arr(dialogue.speakers).map(rec).filter((speaker) => text(speaker.name));
  const lines = arr(dialogue.lines).map(rec).filter((line) => text(line.es));
  const translated = lines.length > 0 && lines.every((line) => text(line.en));
  const voiced = lines.length > 0 && (lines.every((line) => hasAsset(line.audio)) || hasAsset(dialogue.fullAudio));
  return [
    { id: `${prefix}speakers`, labelKa: "მინიმუმ 2 პერსონაჟი", done: speakers.length >= 2, required: true },
    { id: `${prefix}lines`, labelKa: "მინიმუმ 2 ხაზი ესპანურად", done: lines.length >= 2, required: true },
    { id: `${prefix}english`, labelKa: "ყველა ხაზს აქვს ინგლისური თარგმანი", done: translated, required: false },
    { id: `${prefix}audio`, labelKa: "აუდიო (ხაზებზე ან მთლიანი)", done: voiced, required: false },
  ];
}

function exerciseStepFilled(templateId: string, step: Rec): boolean {
  switch (templateId) {
    case "multiple_choice":
    case "listening": {
      const options = arr(step.options).map(rec);
      const question = templateId === "listening" ? text(step.questionEs) : text(rec(step.prompt).ka) || text(rec(step.prompt).es) || text(step.context);
      return Boolean(question) && options.length >= 2 && options.every((option) => text(option.text)) && options.some((option) => option.id === step.correctId);
    }
    case "swipe_true_false":
      return Boolean(text(step.statement)) && typeof step.isTrue === "boolean";
    case "sentence_builder": {
      const answer = arr(step.answer).map(text).filter(Boolean);
      return Boolean(text(step.promptKa)) && answer.length >= 2;
    }
    case "fill_blank": {
      const rows = arr(step.rows).map(rec);
      return rows.length > 0 && rows.every((row) => text(row.answer) && (text(row.before) || text(row.after)));
    }
    case "drag_sort": {
      const buckets = arr(step.buckets).map(rec);
      const items = arr(step.items).map(rec);
      return buckets.length >= 2 && buckets.every((bucket) => text(bucket.label)) && items.length >= 2 && items.every((item) => text(item.text));
    }
    case "matching_pairs": {
      const pairs = arr(step.pairs).map(rec);
      return pairs.length >= 2 && pairs.every((pair) => text(pair.left) && (text(pair.right) || hasAsset(pair.right)));
    }
    case "branching_dialogue": {
      const nodes = arr(step.nodes).map(rec);
      return nodes.length >= 2 && nodes.every((node) => text(node.text)) && nodes.some((node) => arr(node.choices).length > 0);
    }
    case "checkpoint": {
      const sections = arr(step.sections).map(rec);
      return sections.length > 0 && sections.every((section) => {
        const refs = arr(section.stepRefs).map(rec);
        return text(section.labelKa) && refs.length > 0 && refs.every((ref) => exerciseStepFilled(String(ref.templateId ?? ""), ref));
      });
    }
    default:
      return false;
  }
}

function checksFor(type: string, content: Rec): ReadinessCheck[] {
  switch (type) {
    case "INFO_CARD": {
      const pages = arr(content.pages).filter(hasAsset);
      return [
        { id: "pages", labelKa: "მინიმუმ 1 ბარათი ატვირთულია", done: pages.length > 0, required: true },
        { id: "alt", labelKa: "აღწერა ეკრანის წამკითხველისთვის", done: Boolean(text(content.altKa)), required: false },
      ];
    }
    case "VOCAB": {
      const entries = arr(content.entries).map(rec).filter((entry) => text(entry.es));
      const imageMode = content.layout === "image";
      const pages = arr(content.pages).filter(hasAsset);
      const title = rec(content.title);
      const listDone = entries.length >= 3 && entries.every((entry) => text(entry.ka));
      return [
        { id: "title", labelKa: "ესპანური სათაური", done: Boolean(text(title.es)), required: true },
        imageMode && entries.length === 0
          ? { id: "pages", labelKa: "მინიმუმ 1 ბარათი ატვირთულია", done: pages.length > 0, required: true }
          : { id: "entries", labelKa: "მინიმუმ 3 სიტყვა თარგმანით", done: listDone, required: true },
        { id: "audio", labelKa: "ყველა სიტყვას აქვს აუდიო", done: entries.length > 0 && entries.every((entry) => hasAsset(entry.audio)), required: false },
        { id: "examples", labelKa: "მაგალითის წინადადებები", done: entries.length > 0 && entries.filter((entry) => text(entry.exampleEs)).length >= Math.ceil(entries.length / 2), required: false },
      ];
    }
    case "DIALOGUE":
      return [
        ...dialogueChecks(content),
        { id: "context", labelKa: "სიტუაციის აღწერა (სად ვართ)", done: Boolean(text(rec(content.context).ka) || text(rec(content.context).es)), required: false },
      ];
    case "STORY": {
      const place = rec(content.place);
      return [
        { id: "place", labelKa: "ადგილი ან კონტექსტი", done: Boolean(text(place.es) || text(content.contextKa)), required: true },
        ...dialogueChecks(content.dialogue, "dialogue-"),
        { id: "culture", labelKa: "კულტურის შენიშვნა", done: Boolean(text(content.cultureKa)), required: false },
      ];
    }
    case "VIDEO": {
      const lines = arr(rec(content.dialogue).lines).map(rec).filter((line) => text(line.es));
      return [
        { id: "video", labelKa: "ვიდეო ატვირთულია", done: hasAsset(content.video), required: true },
        { id: "transcript", labelKa: "დიალოგის ტექსტი ქვემოთ", done: lines.length > 0, required: false },
        { id: "intro", labelKa: "მოკლე შესავალი (რას ვუყურებთ)", done: Boolean(text(content.introKa)), required: false },
      ];
    }
    case "AUDIO": {
      const lines = arr(rec(content.transcript).lines).map(rec).filter((line) => text(line.es));
      return [
        { id: "audio", labelKa: "აუდიო ატვირთულია", done: hasAsset(content.audio), required: true },
        { id: "transcript", labelKa: "ტრანსკრიფცია", done: lines.length > 0, required: false },
        { id: "intro", labelKa: "დავალება მოსმენამდე", done: Boolean(text(content.introKa)), required: false },
      ];
    }
    case "DOCUMENT":
      return [
        { id: "file", labelKa: "ფაილი ატვირთულია", done: hasAsset(content.file), required: true },
        { id: "note", labelKa: "შენიშვნა მოსწავლისთვის", done: Boolean(text(content.noteKa)), required: false },
      ];
    case "GRAMMAR": {
      const examples = arr(content.examples).map(rec).filter((example) => text(example.es));
      const table = rec(content.table);
      return [
        { id: "rule", labelKa: "წესი ერთი წინადადებით", done: Boolean(text(content.ruleKa) || text(content.body)), required: true },
        { id: "examples", labelKa: "მინიმუმ 2 მაგალითი", done: examples.length >= 2, required: true },
        { id: "translations", labelKa: "მაგალითებს აქვს თარგმანი", done: examples.length > 0 && examples.every((example) => text(example.ka)), required: false },
        { id: "table", labelKa: "ცხრილი (მაგ. უღლება)", done: arr(table.rows).length > 0, required: false },
        { id: "tip", labelKa: "რჩევა ან ხშირი შეცდომა", done: Boolean(text(content.tipKa)) || arr(content.mistakes).length > 0, required: false },
      ];
    }
    case "PRONUNCIATION": {
      const items = arr(content.items).map(rec).filter((item) => text(item.grapheme));
      const words = arr(content.examples).map(text).filter(Boolean).length + items.filter((item) => text(item.example)).length;
      return [
        { id: "items", labelKa: "მინიმუმ 1 ბგერა", done: items.length > 0, required: true },
        { id: "words", labelKa: "მინიმუმ 2 მაგალითის სიტყვა", done: words >= 2, required: true },
        { id: "audio", labelKa: "ყველა ბგერას აქვს აუდიო", done: items.length > 0 && items.every((item) => hasAsset(item.audio)), required: false },
        { id: "hint", labelKa: "მინიშნება, როგორ წარმოვთქვათ", done: items.some((item) => text(item.hintKa)) || Boolean(text(content.tipKa)), required: false },
      ];
    }
    case "GRADED_READER":
      return [
        { id: "body", labelKa: "ტექსტი ან ფაილი", done: Boolean(text(content.body)) || hasAsset(content.file), required: true },
        { id: "glossary", labelKa: "პატარა ლექსიკონი", done: arr(content.glossary).length > 0, required: false },
      ];
    case "HTML_EMBED":
      return [{ id: "bundle", labelKa: "HTML ფაილი ატვირთულია", done: hasAsset(content.bundle), required: true }];
    case "EXERCISE":
    case "GAME":
    case "CHECKPOINT": {
      const templateId = typeof content.templateId === "string" ? content.templateId : "";
      const steps = arr(content.steps).map(rec);
      const filled = steps.filter((step) => exerciseStepFilled(templateId, step)).length;
      return [
        { id: "template", labelKa: "შაბლონი არჩეულია", done: Boolean(templateId), required: true },
        { id: "instruction", labelKa: "დავალება ქართულად", done: Boolean(text(content.instructionKa)), required: true },
        { id: "steps", labelKa: steps.length > 0 ? `ყველა ნაბიჯი შევსებულია (${filled} / ${steps.length})` : "მინიმუმ 1 ნაბიჯი", done: steps.length > 0 && filled === steps.length, required: true },
        { id: "valid", labelKa: "ფორმა სწორია (სწორი პასუხები მონიშნულია)", done: exerciseContentSchema.safeParse(content).success, required: true },
        { id: "variety", labelKa: templateId === "checkpoint" ? "მინიმუმ 2 ნაწილი" : "მინიმუმ 4 ნაბიჯი", done: templateId === "checkpoint" ? arr(rec(steps[0]).sections).length >= 2 : steps.length >= 4, required: false },
      ];
    }
    default:
      return [];
  }
}

export function materialReadiness(type: string, content: unknown): Readiness {
  const checks = checksFor(type, rec(content));
  const required = checks.filter((check) => check.required);
  const requiredDone = required.filter((check) => check.done).length;
  const ready = required.length > 0 && requiredDone === required.length;
  const empty = requiredDone === 0;
  const summaryKa = ready ? "მზადაა" : empty ? "ცარიელია" : `${requiredDone} / ${required.length} შევსებული`;
  return { checks, requiredDone, requiredTotal: required.length, ready, empty, summaryKa };
}

export function blankExerciseStep(templateId: string): Rec {
  switch (templateId) {
    case "multiple_choice":
      return { prompt: { ka: "" }, options: [{ id: "a", text: "" }, { id: "b", text: "" }, { id: "c", text: "" }], correctId: "a" };
    case "listening":
      return { questionEs: "", questionKa: "", options: [{ id: "a", text: "" }, { id: "b", text: "" }, { id: "c", text: "" }], correctId: "a" };
    case "swipe_true_false":
      return { statement: "", isTrue: true };
    case "sentence_builder":
      return { promptKa: "", tiles: [], answer: [] };
    case "fill_blank":
      return { verbHint: "", rows: [{ before: "", answer: "", after: "" }] };
    case "drag_sort":
      return { buckets: [{ id: "a", label: "el" }, { id: "b", label: "la" }], items: [{ id: "1", text: "", bucketId: "a" }, { id: "2", text: "", bucketId: "b" }] };
    case "matching_pairs":
      return { mode: "word_translation", pairs: [{ left: "", right: "" }, { left: "", right: "" }, { left: "", right: "" }] };
    case "branching_dialogue":
      return {
        start: "n1",
        speakers: [{ id: "camarero", name: "Camarero", initial: "C", tone: "navy" }],
        nodes: [
          { id: "n1", speakerId: "camarero", text: "", choices: [{ text: "", next: "n2", isGood: true }, { text: "", next: "n2", isGood: false }] },
          { id: "n2", speakerId: "camarero", text: "" },
        ],
      };
    case "checkpoint":
      return { sections: [{ labelKa: "ლექსიკა", stepRefs: [{ templateId: "multiple_choice", ...blankExerciseStep("multiple_choice") }] }] };
    default:
      return {};
  }
}

function blankDialogue() {
  return {
    context: { ka: "" },
    speakers: [{ ...SPEAKER_PRESETS[0] }, { ...SPEAKER_PRESETS[1] }],
    lines: [
      { speakerId: "ana", es: "", en: "" },
      { speakerId: "lucas", es: "", en: "" },
    ],
  };
}

export function starterContent(type: string, templateId?: string): Rec {
  switch (type) {
    case "INFO_CARD":
      return { pages: [], altKa: "" };
    case "VOCAB":
      return { layout: "list", title: { es: "", ka: "" }, introKa: "", entries: [{ es: "", ka: "" }, { es: "", ka: "" }, { es: "", ka: "" }] };
    case "DIALOGUE":
      return blankDialogue();
    case "STORY":
      return { place: { es: "", ka: "" }, contextKa: "", dialogue: blankDialogue(), grammarKa: "", cultureKa: "" };
    case "VIDEO":
      return { introKa: "", dialogue: { speakers: [], lines: [] } };
    case "AUDIO":
      return { introKa: "", transcript: { speakers: [], lines: [] } };
    case "DOCUMENT":
      return { allowDownload: true, noteKa: "" };
    case "GRAMMAR":
      return { titleEs: "", ruleKa: "", body: "", examples: [{ es: "", ka: "" }, { es: "", ka: "" }], tipKa: "" };
    case "PRONUNCIATION":
      return { title: "", items: [{ grapheme: "", hintKa: "", example: "" }], examples: [], tipKa: "" };
    case "GRADED_READER":
      return { body: "", glossary: [] };
    case "HTML_EMBED":
      return { entry: "index.html", reportsCompletion: true };
    case "EXERCISE":
    case "GAME":
    case "CHECKPOINT": {
      const id = templateId ?? (type === "CHECKPOINT" ? "checkpoint" : "multiple_choice");
      const meta = exerciseTemplateMeta(id);
      return {
        schemaVersion: 1,
        templateId: id,
        title: "",
        instructionKa: meta?.defaultInstructionKa ?? "",
        ...(meta?.variants[0] ? { variant: meta.variants[0].id } : {}),
        passThreshold: 0.7,
        steps: [blankExerciseStep(id)],
      };
    }
    default:
      return {};
  }
}
