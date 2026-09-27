import { foldAnswer, gradeExercise, gradeStep } from "./grade.js";
import { templateList, templateRegistry } from "./registry.js";

export const EXERCISE_ENGINE_VERSION = 1 as const;

export { foldAnswer, gradeExercise, gradeStep, templateList, templateRegistry };
export type { GradedExercise, GradedStep } from "./grade.js";
export type { TemplateMeta } from "./registry.js";
