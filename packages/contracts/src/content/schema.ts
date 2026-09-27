import { z } from "zod";

const localized = z.object({
  es: z.string().optional(),
  ka: z.string().optional(),
  en: z.string().optional(),
});

const assetRef = z.object({ assetId: z.string() });

const speaker = z.object({
  id: z.string(),
  name: z.string(),
  initial: z.string().max(2),
  tone: z.enum(["burgundy", "teal", "sage", "mustard", "navy"]),
});

const dialogueLine = z.object({
  speakerId: z.string(),
  es: z.string().optional(),
  en: z.string().optional(),
  audio: assetRef.optional(),
});

const dialogue = z.object({
  context: localized.optional(),
  speakers: z.array(speaker).default([]),
  lines: z.array(dialogueLine).default([]),
  fullAudio: assetRef.optional(),
});

const feedback = z.object({
  correctKa: z.string().optional(),
  finishTitleEs: z.string().optional(),
});

const frame = {
  schemaVersion: z.literal(1),
  title: z.string(),
  instructionKa: z.string(),
  variant: z.string().optional(),
  illustration: z.string().optional(),
  passThreshold: z.number().min(0).max(1).default(0.7),
  feedback: feedback.optional(),
};

const option = z.object({ id: z.string(), text: z.string() });

const multipleChoice = z.object({
  ...frame,
  templateId: z.literal("multiple_choice"),
  steps: z.array(z.object({
    prompt: localized.optional(),
    context: z.string().optional(),
    options: z.array(option).min(1),
    correctId: z.string(),
    explanationKa: z.string().optional(),
  })).min(1),
});

const swipe = z.object({
  ...frame,
  templateId: z.literal("swipe_true_false"),
  steps: z.array(z.object({
    statement: z.string(),
    isTrue: z.boolean(),
    context: z.string().optional(),
  })).min(1),
});

const dragSort = z.object({
  ...frame,
  templateId: z.literal("drag_sort"),
  steps: z.array(z.object({
    buckets: z.array(z.object({ id: z.string(), label: z.string() })).min(1),
    items: z.array(z.object({ id: z.string(), text: z.string(), bucketId: z.string() })).min(1),
  })).min(1),
});

const sentenceBuilder = z.object({
  ...frame,
  templateId: z.literal("sentence_builder"),
  steps: z.array(z.object({
    promptKa: z.string(),
    tiles: z.array(z.string()).min(1),
    answer: z.array(z.string()).min(1),
    acceptAlso: z.array(z.array(z.string())).optional(),
  })).min(1),
});

const fillBlank = z.object({
  ...frame,
  templateId: z.literal("fill_blank"),
  steps: z.array(z.object({
    verbHint: z.string().optional(),
    strictAccents: z.boolean().optional(),
    rows: z.array(z.object({
      before: z.string(),
      after: z.string(),
      answer: z.string(),
      options: z.array(z.string()).optional(),
    })).min(1),
  })).min(1),
});

const matching = z.object({
  ...frame,
  templateId: z.literal("matching_pairs"),
  steps: z.array(z.object({
    mode: z.enum(["word_image", "word_translation"]),
    pairs: z.array(z.object({
      left: z.string(),
      right: z.union([z.string(), assetRef]),
    })).min(1),
  })).min(1),
});

const branching = z.object({
  ...frame,
  templateId: z.literal("branching_dialogue"),
  steps: z.array(z.object({
    start: z.string(),
    speakers: z.array(speaker).default([]),
    nodes: z.array(z.object({
      id: z.string(),
      speakerId: z.string().optional(),
      text: z.string(),
      choices: z.array(z.object({
        text: z.string(),
        next: z.string(),
        isGood: z.boolean().optional(),
      })).optional(),
    })).min(1),
  })).min(1),
});

const listening = z.object({
  ...frame,
  templateId: z.literal("listening"),
  steps: z.array(z.object({
    audio: assetRef.optional(),
    questionEs: z.string(),
    questionKa: z.string().optional(),
    options: z.array(option).min(1),
    correctId: z.string(),
  })).min(1),
});

const checkpoint = z.object({
  ...frame,
  templateId: z.literal("checkpoint"),
  steps: z.array(z.object({
    sections: z.array(z.object({
      labelKa: z.string(),
      stepRefs: z.array(z.record(z.string(), z.unknown())).default([]),
    })),
  })).min(1),
});

export const exerciseContentSchema = z.discriminatedUnion("templateId", [
  multipleChoice,
  swipe,
  dragSort,
  sentenceBuilder,
  fillBlank,
  matching,
  branching,
  listening,
  checkpoint,
]);

export type ExerciseContent = z.infer<typeof exerciseContentSchema>;

export const infoCardSchema = z.object({
  pages: z.array(assetRef).default([]),
  altKa: z.string().optional(),
  captionKa: z.string().optional(),
});

export const vocabEntrySchema = z.object({
  es: z.string(),
  article: z.enum(["el", "la", "los", "las", ""]).optional(),
  ka: z.string().optional(),
  en: z.string().optional(),
  exampleEs: z.string().optional(),
  exampleKa: z.string().optional(),
  audio: assetRef.optional(),
  image: assetRef.optional(),
});

export const vocabSchema = z.object({
  layout: z.enum(["list", "image"]).optional(),
  title: localized.optional(),
  introKa: z.string().optional(),
  entries: z.array(vocabEntrySchema).optional(),
  pages: z.array(assetRef).optional(),
});

export const dialogueSchema = dialogue;

export const storySchema = z.object({
  characters: z.array(speaker).optional(),
  place: localized.optional(),
  image: assetRef.optional(),
  contextKa: z.string().optional(),
  vocabularyIds: z.array(z.string()).optional(),
  dialogue: dialogue.optional(),
  grammarKa: z.unknown().optional(),
  cultureKa: z.unknown().optional(),
  followUpMaterialIds: z.array(z.string()).optional(),
});

export const videoSchema = z.object({
  video: assetRef.optional(),
  introKa: z.string().optional(),
  captions: assetRef.optional(),
  dialogue: dialogue.optional(),
});

export const audioSchema = z.object({
  audio: assetRef.optional(),
  introKa: z.string().optional(),
  transcript: dialogue.optional(),
  peaks: z.array(z.number()).optional(),
});

export const documentSchema = z.object({
  file: assetRef.optional(),
  noteKa: z.string().optional(),
  allowDownload: z.boolean().optional(),
});

export const grammarTableSchema = z.object({
  caption: z.string().optional(),
  headers: z.array(z.string()),
  rows: z.array(z.array(z.string())),
});

export const grammarSchema = z.object({
  titleEs: z.string().optional(),
  ruleKa: z.string().optional(),
  body: z.unknown().optional(),
  table: grammarTableSchema.optional(),
  image: assetRef.optional(),
  examples: z.array(localized).optional(),
  mistakes: z.array(z.object({ wrong: z.string(), right: z.string(), noteKa: z.string().optional() })).optional(),
  tipKa: z.string().optional(),
});

export const pronunciationSchema = z.object({
  title: z.string().optional(),
  items: z.array(z.object({
    grapheme: z.string(),
    hintKa: z.string().optional(),
    example: z.string().optional(),
    audio: assetRef.optional(),
  })).default([]),
  examples: z.array(z.string()).default([]),
  tipKa: z.string().optional(),
});

export const gradedReaderSchema = z.object({
  file: assetRef.optional(),
  body: z.unknown().optional(),
  chapter: z.number().optional(),
  glossary: z.array(z.object({ es: z.string(), ka: z.string() })).optional(),
});

export const htmlEmbedSchema = z.object({
  bundle: assetRef.optional(),
  entry: z.string().optional(),
  height: z.number().optional(),
  reportsCompletion: z.boolean().optional(),
});

const viewers = {
  INFO_CARD: infoCardSchema,
  VOCAB: vocabSchema,
  DIALOGUE: dialogueSchema,
  STORY: storySchema,
  VIDEO: videoSchema,
  AUDIO: audioSchema,
  DOCUMENT: documentSchema,
  GRAMMAR: grammarSchema,
  PRONUNCIATION: pronunciationSchema,
  GRADED_READER: gradedReaderSchema,
  HTML_EMBED: htmlEmbedSchema,
} as const;

export function parseViewerContent(type: string, content: unknown) {
  const schema = viewers[type as keyof typeof viewers];
  if (!schema) return null;
  const parsed = schema.safeParse(content ?? {});
  return parsed.success ? parsed.data : null;
}

export const embedMessageSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("nina:ready") }),
  z.object({ type: z.literal("nina:progress"), step: z.number(), total: z.number() }),
  z.object({ type: z.literal("nina:complete"), score: z.number().min(0).max(1).optional(), correct: z.number().optional(), total: z.number().optional() }),
  z.object({ type: z.literal("nina:resize"), height: z.number().positive() }),
]);

export function collectAssetIds(value: unknown, into = new Set<string>()) {
  if (!value || typeof value !== "object") return into;
  if (Array.isArray(value)) {
    for (const item of value) collectAssetIds(item, into);
    return into;
  }
  const record = value as Record<string, unknown>;
  if (typeof record.assetId === "string") into.add(record.assetId);
  for (const child of Object.values(record)) collectAssetIds(child, into);
  return into;
}
