import { randomBytes, randomUUID } from "node:crypto";
import type { FastifyInstance } from "fastify";
import { hashPassword } from "better-auth/crypto";
import { prisma } from "../../db.js";
import { requireRole } from "../auth/guard.js";

const statuses = new Set(["NEW", "CONTACTED", "TRIAL_SCHEDULED", "TRIAL_DONE", "CONVERTED", "LOST"]);

export async function adminLeadRoutes(app: FastifyInstance) {
  app.get("/v1/admin/leads", async (request, reply) => {
    const admin = await requireRole(request, reply, "ADMIN");
    if (!admin) return;
    const rows = await prisma.lead.findMany({ orderBy: { createdAt: "desc" } });
    return {
      items: rows.map((lead) => ({
        id: lead.id,
        name: lead.name,
        phone: lead.phone,
        email: lead.email,
        channel: lead.channel,
        goal: lead.goal,
        days: lead.days,
        timeOfDay: lead.timeOfDay,
        note: lead.note,
        adminNote: lead.adminNote,
        source: lead.source,
        status: lead.status,
        createdAt: lead.createdAt.toISOString(),
      })),
    };
  });

  app.patch("/v1/admin/leads/:id", async (request, reply) => {
    const admin = await requireRole(request, reply, "ADMIN");
    if (!admin) return;
    const { id } = request.params as { id: string };
    const body = request.body as { status?: string; adminNote?: string | null };
    if (body.status !== undefined && !statuses.has(body.status)) {
      return reply.code(400).send({ error: { code: "VALIDATION", messageKa: "სტატუსი არასწორია." } });
    }
    const existing = await prisma.lead.findUnique({ where: { id } });
    if (!existing) return reply.code(404).send({ error: { code: "NOT_FOUND", messageKa: "ლიდი ვერ მოიძებნა." } });
    const saved = await prisma.lead.update({
      where: { id },
      data: {
        ...(body.status ? { status: body.status as "NEW" } : {}),
        ...(body.adminNote === null || typeof body.adminNote === "string" ? { adminNote: body.adminNote } : {}),
      },
    });
    return { id: saved.id, status: saved.status };
  });

  app.post("/v1/admin/leads/:id/convert", async (request, reply) => {
    const admin = await requireRole(request, reply, "ADMIN");
    if (!admin) return;
    const { id } = request.params as { id: string };
    const body = request.body as { email?: string; nameLatin?: string };
    const lead = await prisma.lead.findUnique({ where: { id }, include: { student: true } });
    if (!lead) return reply.code(404).send({ error: { code: "NOT_FOUND", messageKa: "ლიდი ვერ მოიძებნა." } });
    if (lead.student) return reply.code(409).send({ error: { code: "CONFLICT", messageKa: "ეს ლიდი უკვე მოსწავლეა." } });
    const email = (body.email || lead.email || "").trim().toLowerCase();
    if (!email.includes("@")) {
      return reply.code(400).send({ error: { code: "VALIDATION", messageKa: "მოსწავლის ელ-ფოსტა საჭიროა." } });
    }
    const taken = await prisma.user.findUnique({ where: { email } });
    if (taken) return reply.code(409).send({ error: { code: "CONFLICT", messageKa: "ეს ელ-ფოსტა უკვე გამოყენებულია." } });
    const course = await prisma.course.findFirst({ where: { isArchived: false }, orderBy: { order: "asc" } });
    const user = await prisma.user.create({
      data: {
        email,
        name: lead.name,
        nameLatin: body.nameLatin?.trim() || null,
        role: "STUDENT",
        emailVerified: true,
      },
    });
    await prisma.account.create({
      data: {
        id: randomUUID(),
        accountId: user.id,
        providerId: "credential",
        userId: user.id,
        password: await hashPassword(randomBytes(24).toString("hex")),
      },
    });
    const profile = await prisma.studentProfile.create({
      data: {
        userId: user.id,
        phone: lead.phone,
        preferredChannel: lead.channel,
        goal: lead.goal,
        goalNote: lead.note,
        leadId: lead.id,
        ...(course ? { enrollments: { create: { courseId: course.id } } } : {}),
      },
    });
    await prisma.lead.update({ where: { id: lead.id }, data: { status: "CONVERTED", email } });
    const token = randomBytes(24).toString("hex");
    await prisma.invite.create({
      data: { token, email, userId: user.id, expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7) },
    });
    const url = `${process.env.WEB_ORIGIN ?? "http://localhost:3000"}/invite/${token}`;
    return { studentId: profile.id, url };
  });
}
