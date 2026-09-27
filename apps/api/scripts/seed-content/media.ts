import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { createReadStream, existsSync, readdirSync } from "node:fs";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { prisma } from "../../src/db.js";
import { classifyMime, originalKey, sniffMime } from "../../src/modules/media/files.js";
import { processMediaAsset } from "../../src/modules/media/worker.js";
import { getStorage } from "../../src/storage/index.js";

const here = path.dirname(fileURLToPath(import.meta.url));
export const ILLUSTRATIONS = path.join(here, "illustrations");
export const CACHE = path.join(here, ".cache");
const FONTS = path.resolve(here, "../../../web/src/fonts");
const BRAND = path.resolve(here, "../../../web/public");
const TOOLS = path.join(process.env.LOCALAPPDATA ?? os.homedir(), "nina-tools");

function findChrome() {
  if (process.env.NINA_CHROME) return process.env.NINA_CHROME;
  const root = path.join(process.env.LOCALAPPDATA ?? os.homedir(), "ms-playwright");
  if (existsSync(root)) {
    const builds = readdirSync(root).filter((name) => name.startsWith("chromium-")).sort().reverse();
    for (const build of builds) {
      const exe = path.join(root, build, "chrome-win64", "chrome.exe");
      if (existsSync(exe)) return exe;
    }
  }
  return "chrome";
}

function findFfmpegDir() {
  if (process.env.NINA_FFMPEG_DIR) return process.env.NINA_FFMPEG_DIR;
  const root = path.join(TOOLS, "ffmpeg");
  if (!existsSync(root)) return null;
  for (const build of readdirSync(root)) {
    const bin = path.join(root, build, "bin");
    if (existsSync(path.join(bin, "ffmpeg.exe"))) return bin;
  }
  return null;
}

const ffmpegDir = findFfmpegDir();
if (ffmpegDir) process.env.PATH = `${ffmpegDir}${path.delimiter}${process.env.PATH ?? ""}`;
const CHROME = findChrome();
const PY_TARGET = process.env.NINA_EDGE_TTS_PATH ?? path.join(TOOLS, "py");

function run(command: string, args: string[], env?: NodeJS.ProcessEnv) {
  return new Promise<string>((resolve, reject) => {
    const child = spawn(command, args, { windowsHide: true, env: { ...process.env, ...env } });
    let out = "";
    let err = "";
    child.stdout.on("data", (chunk: Buffer) => (out += chunk.toString()));
    child.stderr.on("data", (chunk: Buffer) => (err += chunk.toString()));
    child.on("error", reject);
    child.on("close", (code) => (code === 0 ? resolve(out) : reject(new Error(`${command} exited ${code}: ${err.slice(-600)}`))));
  });
}

const hash = (value: unknown) => createHash("sha1").update(JSON.stringify(value)).digest("hex").slice(0, 16);

async function cached(kind: string, key: unknown, ext: string, make: (file: string) => Promise<void>) {
  const dir = path.join(CACHE, kind);
  await mkdir(dir, { recursive: true });
  const file = path.join(dir, `${hash(key)}.${ext}`);
  if (!existsSync(file) || (await stat(file)).size === 0) await make(file);
  return file;
}

export type Voice = "ana" | "lucas" | "laura" | "nina" | "camarero" | "local" | "tu" | "narrador";

const VOICES: Record<Voice, { voice: string; pitch?: string; rate?: string }> = {
  ana: { voice: "es-ES-ElviraNeural" },
  lucas: { voice: "es-ES-AlvaroNeural" },
  laura: { voice: "es-ES-XimenaNeural" },
  nina: { voice: "es-ES-XimenaNeural", rate: "-8%" },
  camarero: { voice: "es-ES-AlvaroNeural", pitch: "-9Hz", rate: "+4%" },
  local: { voice: "es-MX-JorgeNeural", pitch: "-6Hz" },
  tu: { voice: "es-MX-DaliaNeural" },
  narrador: { voice: "es-ES-ElviraNeural", rate: "-6%" },
};

/** Learner-paced by default: A1 audio is slightly slower than natural speech. */
export async function tts(text: string, voice: Voice, rate?: string) {
  const spec = VOICES[voice];
  const finalRate = rate ?? spec.rate ?? "-10%";
  return cached("tts", { text, spec, finalRate }, "mp3", async (file) => {
    const args = ["-m", "edge_tts", "--voice", spec.voice, `--rate=${finalRate}`, "--text", text, "--write-media", file];
    if (spec.pitch) args.splice(4, 0, `--pitch=${spec.pitch}`);
    for (let attempt = 1; ; attempt += 1) {
      try {
        await run("python", args, { PYTHONPATH: PY_TARGET });
        return;
      } catch (error) {
        if (attempt >= 3) throw error;
        await new Promise((resolve) => setTimeout(resolve, 1500 * attempt));
      }
    }
  });
}

export async function duration(file: string) {
  const out = await run("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", file]);
  return Number(out.trim()) || 0;
}

/** Joins clips with a short pause between them into one learner-friendly track. */
export async function joinAudio(files: string[], gapSec = 0.7) {
  return cached("join", { files: files.map((file) => path.basename(file)), gapSec }, "mp3", async (out) => {
    const args: string[] = ["-y"];
    for (const file of files) args.push("-i", file);
    const parts = files.map((_, index) => `[${index}:a]aresample=24000,aformat=channel_layouts=mono,apad=pad_dur=${gapSec}[a${index}]`);
    const inputs = files.map((_, index) => `[a${index}]`).join("");
    args.push("-filter_complex", `${parts.join(";")};${inputs}concat=n=${files.length}:v=0:a=1[out]`, "-map", "[out]", "-codec:a", "libmp3lame", "-b:a", "96k", out);
    await run("ffmpeg", args);
  });
}

const fontFace = (family: string, file: string, weight: number, range?: string) =>
  `@font-face{font-family:"${family}";src:url("${pathToFileURL(path.join(FONTS, file)).href}") format("woff2");font-weight:${weight};font-display:block;${range ? `unicode-range:${range};` : ""}}`;

export const BASE_CSS = [
  ...[400, 500, 600, 700].map((weight) => fontFace("FiraGO", `firago-georgian-${weight}.woff2`, weight, "U+10A0-10FF,U+1C90-1CBF,U+2D00-2D2F")),
  ...[400, 500, 600, 700].map((weight) => fontFace("Montserrat", `montserrat-latin-${weight}-normal.woff2`, weight)),
  ...[500, 600, 700].map((weight) => fontFace("Caveat", `caveat-latin-${weight}-normal.woff2`, weight)),
  `:root{--paper:#FCF7E6;--card:#FFFCF3;--deep:#F3EAD6;--teal:#196166;--navy:#0A414F;--burgundy:#841B22;--mustard:#F5B246;--sand:#D0AC84;--line:#E4D3B4;--sage:#5B8A81;--muted:#4A6268;--teal-soft:#DCEBE8;--mustard-soft:#FBE7C2;--sage-soft:#DDE9E3;--burgundy-soft:#F3DCD9;--pron:#D6E9C9}`,
  `*{box-sizing:border-box;margin:0;padding:0}html,body{background:var(--paper);color:var(--navy);font-family:"FiraGO","Montserrat",system-ui,sans-serif;-webkit-font-smoothing:antialiased}`,
  `.hand{font-family:"Caveat",cursive;font-weight:600}.ka{line-height:1.5}`,
].join("\n");

export const illustrationUrl = (name: string) => pathToFileURL(path.join(ILLUSTRATIONS, `${name}.webp`)).href;
export const brandUrl = (relative: string) => pathToFileURL(path.join(BRAND, relative)).href;

async function writeHtml(kind: string, key: unknown, body: string, css: string) {
  const dir = path.join(CACHE, "html");
  await mkdir(dir, { recursive: true });
  const file = path.join(dir, `${kind}-${hash(key)}.html`);
  await writeFile(file, `<!doctype html><html lang="ka"><head><meta charset="utf-8"><style>${BASE_CSS}\n${css}</style></head><body>${body}</body></html>`, "utf8");
  return file;
}

const chromeFlags = ["--headless=new", "--disable-gpu", "--hide-scrollbars", "--allow-file-access-from-files", "--no-first-run", "--no-default-browser-check", "--virtual-time-budget=4000", "--force-device-scale-factor=1"];

export async function renderPng(body: string, css: string, width: number, height: number) {
  return cached("png", { body, css, width, height, v: 3 }, "png", async (out) => {
    const html = await writeHtml("png", { body, css }, body, css);
    await run(CHROME, [...chromeFlags, `--window-size=${width},${height}`, `--screenshot=${out}`, pathToFileURL(html).href]);
  });
}

export async function renderPdf(body: string, css: string) {
  return cached("pdf", { body, css, v: 3 }, "pdf", async (out) => {
    const html = await writeHtml("pdf", { body, css }, body, css);
    await run(CHROME, [...chromeFlags, "--no-pdf-header-footer", `--print-to-pdf=${out}`, pathToFileURL(html).href]);
  });
}

export type VideoSlide = { image: string; audio?: string; seconds?: number };

/** Still-frame slides, each held for its narration, stitched into a web-friendly H.264/AAC mp4. */
export async function makeVideo(slides: VideoSlide[]) {
  return cached("video", slides.map((slide) => ({ i: path.basename(slide.image), a: slide.audio ? path.basename(slide.audio) : null, s: slide.seconds })), "mp4", async (out) => {
    const dir = path.join(CACHE, "video-parts", hash(out));
    await mkdir(dir, { recursive: true });
    const parts: string[] = [];
    for (const [index, slide] of slides.entries()) {
      const part = path.join(dir, `${index}.mp4`);
      const hold = slide.audio ? (await duration(slide.audio)) + 0.6 : slide.seconds ?? 2.5;
      const audioInput = slide.audio ? ["-i", slide.audio] : ["-f", "lavfi", "-i", "anullsrc=r=48000:cl=stereo"];
      await run("ffmpeg", [
        "-y", "-loop", "1", "-framerate", "25", "-i", slide.image, ...audioInput,
        "-filter_complex", `[0:v]scale=1280:720,format=yuv420p[v];[1:a]aresample=48000,aformat=channel_layouts=stereo,apad[a]`,
        "-map", "[v]", "-map", "[a]", "-t", hold.toFixed(2),
        "-c:v", "libx264", "-preset", "veryfast", "-tune", "stillimage", "-crf", "24", "-r", "25",
        "-c:a", "aac", "-b:a", "96k", part,
      ]);
      parts.push(part);
    }
    const list = path.join(dir, "list.txt");
    await writeFile(list, parts.map((part) => `file '${part.replace(/\\/g, "/")}'`).join("\n"), "utf8");
    await run("ffmpeg", ["-y", "-f", "concat", "-safe", "0", "-i", list, "-c", "copy", "-movflags", "+faststart", out]);
  });
}

/** Stores a local file through the real storage driver and media processor; reuses the asset on re-runs. */
export async function upload(file: string, originalName: string, alt?: string) {
  const bytes = await readFile(file);
  const checksum = createHash("sha256").update(bytes).digest("hex");
  const tag = `seed:${checksum.slice(0, 24)}`;
  const existing = await prisma.mediaAsset.findFirst({ where: { tags: { has: tag }, status: "READY" } });
  if (existing) return existing.id;
  const mime = sniffMime(bytes.subarray(0, 4100));
  const classified = mime ? classifyMime(mime) : null;
  if (!mime || !classified) throw new Error(`unsupported seed file ${file}`);
  const asset = await prisma.mediaAsset.create({
    data: { kind: classified.kind, originalName, mime, sizeBytes: 0, storageKey: `pending/${tag}-${Date.now()}`, status: "UPLOADING", alt, tags: ["seed", tag] },
  });
  const key = originalKey(asset.id, classified.ext);
  const stored = await getStorage().put(key, createReadStream(file), { contentType: mime });
  await prisma.mediaAsset.update({ where: { id: asset.id }, data: { storageKey: key, sizeBytes: stored.size, checksum: stored.checksum, status: "PROCESSING" } });
  await processMediaAsset(asset.id);
  const done = await prisma.mediaAsset.findUniqueOrThrow({ where: { id: asset.id } });
  if (done.status !== "READY") throw new Error(`processing failed for ${originalName}: ${JSON.stringify(done.variants)}`);
  return asset.id;
}

export function toolReport() {
  return { chrome: CHROME !== "chrome", ffmpeg: Boolean(ffmpegDir), edgeTts: existsSync(PY_TARGET) };
}
