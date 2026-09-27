import type { FastifyInstance } from "fastify";
import { leadInputSchema, phoneDigits } from "@nina/contracts";
import { prisma } from "../../db.js";
import { enqueueLeadNotify } from "../../jobs/boss.js";

export async function leadRoutes(app: FastifyInstance) {
  app.post(
    "/v1/leads",
    {
      config: {
        rateLimit: {
          max: 5,
          timeWindow: "1 hour",
        },
      },
    },
    async (request, reply) => {
      const parsed = leadInputSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({
          error: {
            code: "VALIDATION",
            messageKa: "გთხოვ, შეავსე მონიშნული ველები.",
            details: parsed.error.flatten(),
          },
        });
      }
      const input = parsed.data;
      if (input.hp || (input.t !== undefined && input.t < 1500)) {
        return reply.code(201).send({ ok: true });
      }
      const lead = await prisma.lead.create({
        data: {
          name: input.name,
          phone: phoneDigits(input.phone),
          email: input.email || null,
          channel: input.channel,
          goal: input.goal,
          days: input.days,
          timeOfDay: input.timeOfDay,
          note: input.note,
          consentAt: new Date(),
          source: input.source,
          utm: input.utm,
        },
      });
      try {
        await enqueueLeadNotify(lead.id);
      } catch (error) {
        request.log.error(error, "lead notify failed");
      }
      return reply.code(201).send({ id: lead.id });
    },
  );
}
