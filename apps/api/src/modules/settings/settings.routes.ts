import type { FastifyInstance } from "fastify";
import { prisma } from "../../db.js";

const defaults = {
  price_gel: 30,
  lesson_minutes: 75,
  gift_lessons: 2,
  checkpoint_pass: 0.7,
  contact_email: null,
  contact_phone: null,
  telegram: null,
  instagram_url: null,
  facebook_url: null,
  tiktok_url: null,
  lesson_platform: null,
};

export async function settingsRoutes(app: FastifyInstance) {
  app.get("/v1/public/settings", async () => {
    const rows = await prisma.siteSetting.findMany();
    const stored = Object.fromEntries(rows.map((row) => [row.key, row.value]));
    return { ...defaults, ...stored };
  });
}
