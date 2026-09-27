export const SPEAKER_TONES = ["burgundy", "teal", "sage", "mustard", "navy"] as const;

export type SpeakerTone = (typeof SPEAKER_TONES)[number];

const toneClasses: Record<SpeakerTone, string> = {
  burgundy: "bg-burgundy-soft text-burgundy",
  teal: "bg-teal-soft text-teal-deep",
  sage: "bg-sage-soft text-sage-ink",
  mustard: "bg-mustard-soft text-mustard-ink",
  navy: "bg-navy text-on-dark",
};

export const toneLabels: Record<SpeakerTone, string> = {
  burgundy: "ბორდო",
  teal: "ფირუზისფერი",
  sage: "მწვანე",
  mustard: "მდოგვისფერი",
  navy: "მუქი",
};

export function toneClass(tone: string | undefined) {
  return toneClasses[(tone ?? "teal") as SpeakerTone] ?? toneClasses.teal;
}
