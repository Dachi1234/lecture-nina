import { createHmac, timingSafeEqual } from "node:crypto";

const HOUR = 60 * 60 * 1000;

function secret() {
  return process.env.MEDIA_SIGNING_SECRET || process.env.BETTER_AUTH_SECRET || "";
}

export function signMediaUrl(assetId: string, variant: string, now = Date.now()) {
  const key = secret();
  if (!key) throw new Error("MEDIA_SIGNING_SECRET is not set");
  const exp = now + HOUR;
  const token = createHmac("sha256", key).update(`${assetId}:${variant}:${exp}`).digest("base64url");
  const path = `/v1/media/${assetId}/${variant}?token=${encodeURIComponent(token)}&exp=${exp}`;
  const base = (process.env.BETTER_AUTH_URL ?? "http://localhost:4000").replace(/\/$/, "");
  return { exp, token, path, url: `${base}${path}` };
}

export function verifyMediaToken(assetId: string, variant: string, token: string, exp: number, now = Date.now()) {
  const key = secret();
  if (!key || !Number.isFinite(exp) || exp < now || !token) return false;
  const expected = createHmac("sha256", key).update(`${assetId}:${variant}:${exp}`).digest("base64url");
  const left = Buffer.from(token);
  const right = Buffer.from(expected);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export function decideMediaAccess(role: string | null | undefined, assignmentReady: boolean) {
  if (role === "ADMIN") return true;
  return role === "STUDENT" && assignmentReady;
}
