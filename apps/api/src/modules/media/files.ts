export const SIZE_LIMITS = {
  IMAGE: 20 * 1024 * 1024,
  AUDIO: 100 * 1024 * 1024,
  DOCUMENT: 50 * 1024 * 1024,
  VIDEO: 1024 * 1024 * 1024,
} as const;

export type UploadKind = keyof typeof SIZE_LIMITS;

const MIME: Record<string, { kind: UploadKind; ext: string }> = {
  "image/jpeg": { kind: "IMAGE", ext: "jpg" },
  "image/png": { kind: "IMAGE", ext: "png" },
  "image/webp": { kind: "IMAGE", ext: "webp" },
  "image/gif": { kind: "IMAGE", ext: "gif" },
  "video/mp4": { kind: "VIDEO", ext: "mp4" },
  "video/quicktime": { kind: "VIDEO", ext: "mov" },
  "video/webm": { kind: "VIDEO", ext: "webm" },
  "audio/mpeg": { kind: "AUDIO", ext: "mp3" },
  "audio/wav": { kind: "AUDIO", ext: "wav" },
  "audio/ogg": { kind: "AUDIO", ext: "ogg" },
  "audio/mp4": { kind: "AUDIO", ext: "m4a" },
  "application/pdf": { kind: "DOCUMENT", ext: "pdf" },
  "application/msword": { kind: "DOCUMENT", ext: "doc" },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": { kind: "DOCUMENT", ext: "docx" },
};

export function classifyMime(mime: string) {
  return MIME[mime] ?? null;
}

export function sniffMime(head: Buffer) {
  if (head.length >= 3 && head[0] === 0xff && head[1] === 0xd8 && head[2] === 0xff) return "image/jpeg";
  if (head.length >= 8 && head.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "image/png";
  if (head.length >= 6 && head.subarray(0, 6).toString("ascii") === "GIF87a") return "image/gif";
  if (head.length >= 6 && head.subarray(0, 6).toString("ascii") === "GIF89a") return "image/gif";
  if (head.length >= 12 && head.subarray(0, 4).toString("ascii") === "RIFF" && head.subarray(8, 12).toString("ascii") === "WEBP") return "image/webp";
  if (head.length >= 12 && head.subarray(0, 4).toString("ascii") === "RIFF" && head.subarray(8, 12).toString("ascii") === "WAVE") return "audio/wav";
  if (head.length >= 4 && head.subarray(0, 4).toString("ascii") === "%PDF") return "application/pdf";
  if (head.length >= 3 && head.subarray(0, 3).toString("ascii") === "ID3") return "audio/mpeg";
  if (head.length >= 2 && head[0] === 0xff && (head[1]! & 0xe0) === 0xe0) return "audio/mpeg";
  if (head.length >= 4 && head.subarray(0, 4).toString("ascii") === "OggS") return "audio/ogg";
  if (head.length >= 4 && head[0] === 0x1a && head[1] === 0x45 && head[2] === 0xdf && head[3] === 0xa3) return "video/webm";
  if (head.length >= 8 && head.subarray(0, 8).equals(Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]))) return "application/msword";
  if (head.length >= 4 && head[0] === 0x50 && head[1] === 0x4b && head[2] === 0x03 && head[3] === 0x04) {
    if (head.includes(Buffer.from("word/"))) return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    return null;
  }
  if (head.length >= 12 && head.subarray(4, 8).toString("ascii") === "ftyp") {
    const brand = head.subarray(8, 12).toString("ascii");
    if (brand === "M4A " || brand === "M4B ") return "audio/mp4";
    if (brand.startsWith("qt")) return "video/quicktime";
    return "video/mp4";
  }
  return null;
}

export function sanitizeFileName(name: string) {
  const base = name.split(/[/\\]/).pop() ?? "file";
  const cleaned = base.replace(/[^\p{L}\p{N}._ -]/gu, "").trim().slice(0, 180);
  return cleaned || "file";
}

export function originalKey(assetId: string, ext: string, now = new Date()) {
  const year = String(now.getUTCFullYear());
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  return `orig/${year}/${month}/${assetId}.${ext}`;
}

export function variantKey(assetId: string, name: string, ext: string) {
  return `var/${assetId}/${name}.${ext}`;
}
