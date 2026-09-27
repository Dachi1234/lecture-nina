import type { FastifyInstance } from "fastify";
import { prisma } from "../../db.js";
import { requireRole } from "../auth/guard.js";

const keys = [
  "price_gel",
  "lesson_minutes",
  "gift_lessons",
  "checkpoint_pass",
  "contact_email",
  "contact_phone",
  "telegram",
  "instagram_url",
  "facebook_url",
  "tiktok_url",
  "lesson_platform",
  "lead_notify_email",
  "lead_notify_telegram",
] as const;

export async function adminSettingsRoutes(app: FastifyInstance) {
  app.get("/v1/admin/settings", async (request, reply) => {
    const admin = await requireRole(request, reply, "ADMIN");
    if (!admin) return;
    const rows = await prisma.siteSetting.findMany();
    const stored = Object.fromEntries(rows.map((row) => [row.key, row.value]));
    return Object.fromEntries(keys.map((key) => [key, stored[key] ?? null]));
  });

  app.put("/v1/admin/settings", async (request, reply) => {
    const admin = await requireRole(request, reply, "ADMIN");
    if (!admin) return;
    const body = request.body as Record<string, unknown>;
    for (const key of keys) {
      if (!(key in body)) continue;
      const value = body[key];
      if (value === null || value === "") {
        await prisma.siteSetting.deleteMany({ where: { key } });
        continue;
      }
      await prisma.siteSetting.upsert({
        where: { key },
        create: { key, value: value as object },
        update: { value: value as object },
      });
    }
    return { ok: true };
  });
}
