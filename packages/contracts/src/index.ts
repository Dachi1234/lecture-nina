export const CONTRACTS_VERSION = 1;

export {
  audioSchema,
  collectAssetIds,
  dialogueSchema,
  documentSchema,
  embedMessageSchema,
  exerciseContentSchema,
  grammarSchema,
  htmlEmbedSchema,
  infoCardSchema,
  parseViewerContent,
  pronunciationSchema,
  storySchema,
  videoSchema,
  vocabEntrySchema,
  vocabSchema,
} from "./content/schema.js";
export type { ExerciseContent } from "./content/schema.js";

export {
  EXERCISE_MATERIAL_TYPES,
  EXERCISE_TEMPLATE_CATALOG,
  MATERIAL_CATALOG,
  MATERIAL_GROUPS,
  MATERIAL_TYPES,
  SPEAKER_PRESETS,
  blankExerciseStep,
  exerciseTemplateMeta,
  materialReadiness,
  starterContent,
} from "./content/catalog.js";
export type {
  BuildMode,
  ExerciseTemplateId,
  ExerciseTemplateMeta,
  MaterialGroupId,
  MaterialTypeId,
  MaterialTypeMeta,
  Readiness,
  ReadinessCheck,
} from "./content/catalog.js";

export { contactChannelSchema, goalSchema, leadInputSchema, phoneDigits, timeOfDaySchema, weekDaySchema } from "./leads.js";
export type { LeadInput } from "./leads.js";

export type {
  AgentEvent,
  BrandKit,
  SocialAgent,
  SocialFormat,
  SocialPlatform,
  SocialPostDraft,
  SocialPostStatus,
  SocialRenderer,
} from "./social.js";
