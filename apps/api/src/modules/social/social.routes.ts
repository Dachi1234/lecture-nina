import type { FastifyPluginAsync } from "fastify";

/** Placeholder until Social Studio is ported. See docs/BUILD_GUIDE.md section 17. */
export const socialRoutes: FastifyPluginAsync = async (app) => {
  app.all("/", async (_request, reply) => {
    return reply.code(501).send({
      error: {
        code: "NOT_IMPLEMENTED",
        messageKa: "Social Studio ჯერ არ არის ჩართული.",
      },
    });
  });

  app.all("/*", async (_request, reply) => {
    return reply.code(501).send({
      error: {
        code: "NOT_IMPLEMENTED",
        messageKa: "Social Studio ჯერ არ არის ჩართული.",
      },
    });
  });
};
