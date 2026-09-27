import { randomBytes } from "node:crypto";
import type { FastifyInstance } from "fastify";
import { hashPassword } from "better-auth/crypto";
import { prisma } from "../../db.js";
import { requireRole } from "./guard.js";

export async function inviteRoutes(app: FastifyInstance) {
  app.post("/v1/admin/students/:id/invite", async (request, reply) => {
    const admin = await requireRole(request, reply, "ADMIN");
    if (!admin) return;
    const { id } = request.params as { id: string };
    const profile = await prisma.studentProfile.findUnique({
      where: { id },
      include: { user: true },
    });
    if (!profile) {
      return reply.code(404).send({ error: { code: "NOT_FOUND", messageKa: "მოსწავლე ვერ მოიძებნა." } });
    }
    const token = randomBytes(24).toString("hex");
    const invite = await prisma.invite.create({
      data: {
        token,
        email: profile.user.email,
        userId: profile.userId,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
      },
    });
    const url = `${process.env.WEB_ORIGIN ?? "http://localhost:3000"}/invite/${token}`;
    if (!process.env.RESEND_API_KEY) console.info(`invite link: ${url}`);
    return { id: invite.id, url };
  });

  app.post("/v1/auth/invite/accept", async (request, reply) => {
    const body = request.body as { token?: string; password?: string };
    if (!body.token || !body.password || body.password.length < 8) {
      return reply.code(400).send({
        error: { code: "VALIDATION", messageKa: "ბმული ან პაროლი არასწორია." },
      });
    }
    const invite = await prisma.invite.findUnique({ where: { token: body.token } });
    if (!invite || invite.acceptedAt || invite.expiresAt < new Date()) {
      return reply.code(400).send({
        error: { code: "INVITE_INVALID", messageKa: "მოწვევის ბმული აღარ მოქმედებს." },
      });
    }
    const password = await hashPassword(body.password);
    await prisma.account.updateMany({
      where: { userId: invite.userId, providerId: "credential" },
      data: { password },
    });
    await prisma.invite.update({ where: { id: invite.id }, data: { acceptedAt: new Date() } });
    return { ok: true };
  });
}
