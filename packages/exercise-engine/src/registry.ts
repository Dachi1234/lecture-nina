export type TemplateMeta = {
  id: string;
  labelKa: string;
  variants: string[];
  bestFor: string[];
  minSteps: number;
  maxSteps: number;
};

export const templateRegistry = {
  multiple_choice: { id: "multiple_choice", labelKa: "არჩევანი", variants: ["list", "cards_2x2", "chat_context"], bestFor: ["vocabulary", "grammar"], minSteps: 1, maxSteps: 12 },
  swipe_true_false: { id: "swipe_true_false", labelKa: "სწორი / არასწორი", variants: ["card_stack", "buttons_only"], bestFor: ["reading", "grammar"], minSteps: 1, maxSteps: 12 },
  drag_sort: { id: "drag_sort", labelKa: "დახარისხება", variants: ["two_buckets", "multi_buckets"], bestFor: ["grammar", "vocabulary"], minSteps: 1, maxSteps: 8 },
  sentence_builder: { id: "sentence_builder", labelKa: "წინადადების აწყობა", variants: ["tiles", "tiles_with_translation_hint"], bestFor: ["speaking", "grammar"], minSteps: 1, maxSteps: 10 },
  fill_blank: { id: "fill_blank", labelKa: "გამოტოვებული სიტყვა", variants: ["typed", "options"], bestFor: ["verbs", "grammar"], minSteps: 1, maxSteps: 8 },
  matching_pairs: { id: "matching_pairs", labelKa: "წყვილები", variants: ["lines", "tap_pairs"], bestFor: ["vocabulary"], minSteps: 1, maxSteps: 8 },
  branching_dialogue: { id: "branching_dialogue", labelKa: "დიალოგი", variants: ["chat", "scene"], bestFor: ["speaking", "dialogue"], minSteps: 1, maxSteps: 6 },
  listening: { id: "listening", labelKa: "მოსმენა", variants: ["question", "dialogue"], bestFor: ["listening"], minSteps: 1, maxSteps: 8 },
  checkpoint: { id: "checkpoint", labelKa: "შემოწმება", variants: ["sections"], bestFor: ["review"], minSteps: 1, maxSteps: 4 },
} as const satisfies Record<string, TemplateMeta>;

export const templateList = Object.values(templateRegistry);
