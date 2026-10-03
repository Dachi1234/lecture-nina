import "./env.js";
import { fromNodeHeaders } from "better-auth/node";
import Fastify from "fastify";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import { auth } from "./auth.js";
import { inviteRoutes } from "./modules/auth/invite.routes.js";
import { studentRoutes } from "./modules/student/student.routes.js";
import { leadRoutes } from "./modules/leads/leads.routes.js";
import { settingsRoutes } from "./modules/settings/settings.routes.js";
import { socialRoutes } from "./modules/social/social.routes.js";
import { startJobs, stopJobs } from "./jobs/boss.js";
import { mediaRoutes } from "./modules/media/media.routes.js";
import { adminMaterialRoutes } from "./modules/admin/materials.routes.js";
import { adminLeadRoutes } from "./modules/admin/leads.routes.js";
import { adminDashboardRoutes } from "./modules/admin/dashboard.routes.js";
import { adminStudentRoutes } from "./modules/admin/students.routes.js";
import { adminLessonRoutes } from "./modules/admin/lessons.routes.js";
import { adminCurriculumRoutes } from "./modules/admin/curriculum.routes.js";
import { adminGroupRoutes } from "./modules/admin/groups.routes.js";
import { adminLegacyRoutes } from "./modules/admin/legacy.routes.js";
import { adminSettingsRoutes } from "./modules/admin/settings.routes.js";

const app = Fastify({ logger: true });

await app.register(cors, {
  origin: process.env.WEB_ORIGIN ?? "http://localhost:3000",
  credentials: true,
});

await app.register(rateLimit, { global: false });
await app.register(leadRoutes);
await app.register(settingsRoutes);
await app.register(inviteRoutes);
await app.register(studentRoutes);
await app.register(socialRoutes, { prefix: "/v1/admin/social" });
await app.register(mediaRoutes);
await app.register(adminMaterialRoutes);
await app.register(adminLeadRoutes);
await app.register(adminDashboardRoutes);
await app.register(adminStudentRoutes);
await app.register(adminLessonRoutes);
await app.register(adminCurriculumRoutes);
await app.register(adminGroupRoutes);
await app.register(adminLegacyRoutes);
await app.register(adminSettingsRoutes);

app.get("/v1/health", async () => ({ status: "ok" }));

app.route({
  method: ["GET", "POST"],
  url: "/v1/auth/*",
  async handler(request, reply) {
    const url = new URL(request.url, `http://${request.headers.host}`);
    const req = new Request(url.toString(), {
      method: request.method,
      headers: fromNodeHeaders(request.headers),
      ...(request.body ? { body: JSON.stringify(request.body) } : {}),
    });
    const response = await auth.handler(req);
    reply.status(response.status);
    response.headers.forEach((value, key) => {
      if (key.toLowerCase() === "content-length" || key.toLowerCase() === "set-cookie") return;
      reply.header(key, value);
    });
    for (const cookie of response.headers.getSetCookie()) reply.header("set-cookie", cookie);
    const text = response.body ? await response.text() : null;
    return reply.send(text);
  },
});

app.addHook("onClose", async () => {
  await stopJobs();
});

try {
  await startJobs(app.log);
} catch (error) {
  app.log.error(error, "lead notification queue failed to start");
}

const port = Number(process.env.PORT ?? 4000);
const host = process.env.HOST ?? "0.0.0.0";

try {
  await app.listen({ port, host });
} catch (error) {
  app.log.error(error);
  process.exit(1);
}
