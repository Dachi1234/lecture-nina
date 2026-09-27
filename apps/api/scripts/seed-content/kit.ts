import path from "node:path";
import { fileURLToPath } from "node:url";
import { lineSlide, titleSlide } from "./cards.js";
import { duration, ILLUSTRATIONS, joinAudio, makeVideo, tts, upload, type VideoSlide, type Voice } from "./media.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const BRAND = path.resolve(here, "../../../web/public");

export type Ref = { assetId: string };
export type Tone = "burgundy" | "teal" | "sage" | "mustard" | "navy";
export type Speaker = { id: string; name: string; initial: string; tone: Tone };

export const S = {
  ana: { id: "ana", name: "Ana", initial: "A", tone: "burgundy" },
  lucas: { id: "lucas", name: "Lucas", initial: "L", tone: "teal" },
  laura: { id: "laura", name: "Laura", initial: "L", tone: "sage" },
  nina: { id: "nina", name: "Nina", initial: "N", tone: "mustard" },
  camarero: { id: "camarero", name: "Camarero", initial: "C", tone: "navy" },
  tu: { id: "tu", name: "Tú", initial: "T", tone: "teal" },
  senor: { id: "senor", name: "Señor", initial: "S", tone: "navy" },
  recep: { id: "recep", name: "Recepcionista", initial: "R", tone: "mustard" },
} satisfies Record<string, Speaker>;

const VOICE_OF: Record<string, Voice> = { ana: "ana", lucas: "lucas", laura: "laura", nina: "nina", camarero: "camarero", tu: "tu", senor: "local", recep: "tu", megafonia: "narrador", taquilla: "camarero" };

export type MaterialKind = "INFO_CARD" | "VOCAB" | "DIALOGUE" | "STORY" | "VIDEO" | "AUDIO" | "DOCUMENT" | "GRAMMAR" | "EXERCISE" | "GAME" | "PRONUNCIATION" | "GRADED_READER" | "CHECKPOINT";

export type Spec = {
  title: string;
  type: MaterialKind;
  subtitle?: string;
  description?: string;
  estMinutes?: number;
  tags?: string[];
  topic?: number;
  status?: "PUBLISHED" | "DRAFT";
  build: (m: Kit) => Promise<Record<string, unknown>>;
};

export const ex = (templateId: string, title: string, instructionKa: string, steps: unknown[], extra: Record<string, unknown> = {}) => ({
  schemaVersion: 1,
  templateId,
  title,
  instructionKa,
  passThreshold: 0.7,
  ...extra,
  steps,
});

export type Line = [speakerId: string, es: string, en: string];
export type DialogueInput = { context?: { ka?: string; es?: string }; speakers: Speaker[]; lines: Line[]; full?: boolean };

export type Entry = { article?: "el" | "la" | "los" | "las" | ""; es: string; ka: string; en?: string; exampleEs?: string; exampleKa?: string; image?: string };

const shortName = (text: string) => text.replace(/[¿?¡!.,…:;"]/g, "").trim().slice(0, 48) || "audio";

export const clock = (seconds: number) => `${Math.floor(seconds / 60)}:${String(Math.round(seconds % 60)).padStart(2, "0")}`;

export class Kit {
  readonly assets = new Set<string>();
  subtitle?: string;
  /** Length of the last joined dialogue track, for subtitles like „დიალოგი · 0:42“. */
  seconds = 0;

  async file(file: string, name: string, alt?: string): Promise<Ref> {
    const id = await upload(file, name, alt);
    this.assets.add(id);
    return { assetId: id };
  }

  async say(text: string, voice: Voice = "nina", rate?: string) {
    return this.file(await tts(text, voice, rate), `${shortName(text)}.mp3`, text);
  }

  image(name: string, alt?: string) {
    return this.file(path.join(ILLUSTRATIONS, `${name}.webp`), `${name}.webp`, alt);
  }

  brand(relative: string, alt?: string) {
    return this.file(path.join(BRAND, relative), path.basename(relative), alt);
  }

  async card(render: Promise<string>, name: string, alt?: string) {
    return this.file(await render, `${name}.png`, alt);
  }

  async cards(renders: Array<Promise<string>>, name: string, alt?: string) {
    const refs: Ref[] = [];
    for (const [index, render] of renders.entries()) refs.push(await this.card(render, `${name} ${index + 1}`, alt));
    return refs;
  }

  async lineClips(lines: Line[]) {
    return Promise.all(lines.map(([speakerId, es]) => tts(es, VOICE_OF[speakerId] ?? "nina")));
  }

  async dialogue(input: DialogueInput) {
    const clips = await this.lineClips(input.lines);
    const lines = [];
    for (const [index, [speakerId, es, en]] of input.lines.entries()) {
      lines.push({ speakerId, es, en, audio: await this.file(clips[index]!, `${shortName(es)}.mp3`, es) });
    }
    const fullFile = input.full === false ? null : await joinAudio(clips);
    const fullAudio = fullFile ? await this.file(fullFile, `${shortName(input.context?.es ?? input.lines[0]![1])} — diálogo.mp3`) : undefined;
    this.seconds = fullFile ? await duration(fullFile) : 0;
    return { context: input.context, speakers: input.speakers, lines, ...(fullAudio ? { fullAudio } : {}) };
  }

  /** A single narrated track plus its transcript, for AUDIO materials. */
  async track(input: DialogueInput, gapSec = 0.8) {
    const clips = await this.lineClips(input.lines);
    const joined = await joinAudio(clips, gapSec);
    const seconds = await duration(joined);
    const audio = await this.file(joined, `${shortName(input.context?.es ?? input.lines[0]![1])}.mp3`);
    const transcript = { context: input.context, speakers: input.speakers, lines: input.lines.map(([speakerId, es, en]) => ({ speakerId, es, en })) };
    return { audio, transcript, seconds };
  }

  /** A short multi-voice snippet (e.g. one exchange) as a single audio file. */
  async clip(lines: Line[], name: string) {
    const clips = await this.lineClips(lines);
    const file = clips.length === 1 ? clips[0]! : await joinAudio(clips, 0.4);
    return this.file(file, `${name}.mp3`, lines.map((line) => line[1]).join(" "));
  }

  async entries(list: Entry[], voice: Voice = "nina") {
    const clips = await Promise.all(list.map((entry) => tts(entry.article ? `${entry.article} ${entry.es}` : entry.es, voice, "-18%")));
    const out = [];
    for (const [index, entry] of list.entries()) {
      const { image, ...rest } = entry;
      out.push({
        ...rest,
        article: entry.article ?? "",
        audio: await this.file(clips[index]!, `${shortName(`${entry.article ?? ""} ${entry.es}`)}.mp3`, entry.es),
        ...(image ? { image: await this.image(image, entry.es) } : {}),
      });
    }
    return out;
  }

  /** Title slide + one illustrated subtitle slide per line, voiced line by line. */
  async dialogueVideo(input: DialogueInput & { image: string | string[]; hand: string; titleKa: string; name: string }) {
    const clips = await this.lineClips(input.lines);
    const images = Array.isArray(input.image) ? input.image : [input.image];
    const slides: VideoSlide[] = [{ image: await titleSlide({ image: images[0]!, hand: input.hand, titleKa: input.titleKa }), seconds: 3 }];
    for (const [index, [speakerId, es, en]] of input.lines.entries()) {
      const speaker = input.speakers.find((item) => item.id === speakerId)!;
      const image = images[Math.min(images.length - 1, Math.floor((index / input.lines.length) * images.length))]!;
      slides.push({ image: await lineSlide({ image, name: speaker.name, initial: speaker.initial, tone: speaker.tone, es, en }), audio: clips[index] });
    }
    const file = await makeVideo(slides);
    const seconds = await duration(file);
    const video = await this.file(file, `${input.name}.mp4`, input.titleKa);
    const dialogue = { context: input.context, speakers: input.speakers, lines: input.lines.map(([speakerId, es, en]) => ({ speakerId, es, en })) };
    return { video, dialogue, seconds };
  }
}
