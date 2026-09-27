import type { FastifyReply, FastifyRequest } from "fastify";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../../auth.js";

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role?: string | null;
};

export async function getSessionUser(request: FastifyRequest) {
  const session = await auth.api.getSession({ headers: fromNodeHeaders(request.headers) });
  return (session?.user as SessionUser | undefined) ?? null;
}

export async function requireRole(request: FastifyRequest, reply: FastifyReply, role: "ADMIN" | "STUDENT") {
  const user = await getSessionUser(request);
  if (!user) {
    reply.code(401).send({ error: { code: "UNAUTHORIZED", messageKa: "შესვლა საჭიროა." } });
    return null;
  }
  if (user.role !== role && user.role !== "ADMIN") {
    reply.code(403).send({ error: { code: "FORBIDDEN", messageKa: "ამ გვერდზე წვდომა არ გაქვს." } });
    return null;
  }
  if (role === "ADMIN" && user.role !== "ADMIN") {
    reply.code(403).send({ error: { code: "FORBIDDEN", messageKa: "ამ გვერდზე წვდომა არ გაქვს." } });
    return null;
  }
  return user;
}
