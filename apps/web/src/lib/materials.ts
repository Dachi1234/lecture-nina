import { MATERIAL_CATALOG, exerciseTemplateMeta, type MaterialGroupId, type MaterialTypeId } from "@nina/contracts";
import type { IconName } from "@nina/ui";

function meta(type: string) {
  return MATERIAL_CATALOG[type as MaterialTypeId];
}

export function materialLabel(type: string, minutes: number | null) {
  const label = meta(type)?.labelKa ?? "მასალა";
  return minutes ? `${label} · ${minutes} წთ` : label;
}

export function materialIcon(type: string): IconName {
  return (meta(type)?.icon ?? "document") as IconName;
}

export function templateLabel(templateId: string | null | undefined) {
  return templateId ? exerciseTemplateMeta(templateId)?.labelKa ?? null : null;
}

const groupTones: Record<MaterialGroupId, { tile: string; ink: string }> = {
  words: { tile: "bg-mustard-soft", ink: "text-mustard-ink" },
  listen: { tile: "bg-teal-soft", ink: "text-teal-deep" },
  explain: { tile: "bg-sage-soft", ink: "text-sage-ink" },
  files: { tile: "bg-sand-soft", ink: "text-ink" },
  practice: { tile: "bg-burgundy-soft", ink: "text-burgundy" },
};

export function groupTone(type: string) {
  return groupTones[meta(type)?.group ?? "files"];
}

export function progressLabel(status: "NOT_STARTED" | "OPENED" | "COMPLETED") {
  if (status === "COMPLETED") return "✓ დასრულებული";
  if (status === "OPENED") return "გახსნილი";
  return "არ დაწყებულა";
}

export function ringFor(status: "NOT_STARTED" | "OPENED" | "COMPLETED") {
  if (status === "COMPLETED") return "done" as const;
  if (status === "OPENED") return "opened" as const;
  return "empty" as const;
}
