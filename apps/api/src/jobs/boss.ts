import { PgBoss } from "pg-boss";
import type { FastifyBaseLogger } from "fastify";
import { prisma } from "../db.js";
import { deliverLeadNotice } from "../modules/leads/notify.js";
import { processMediaAsset } from "../modules/media/worker.js";

export const LEAD_NOTIFY_QUEUE = "lead.notify";
export const MEDIA_PROCESS_QUEUE = "media.process";

let boss: PgBoss | null = null;

export async function startJobs(log: FastifyBaseLogger) {
  const connectionString = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;
  if (!connectionString) {
    log.warn("lead notifications will run inline: no database url for the queue");
    return;
  }

  const next = new PgBoss(connectionString);
  next.on("error", (error) => log.error(error));
  await next.start();
  await next.createQueue(LEAD_NOTIFY_QUEUE, { retryLimit: 3, retryDelay: 20, retryBackoff: true });
  await next.createQueue(MEDIA_PROCESS_QUEUE, { retryLimit: 2, retryDelay: 15, retryBackoff: true });
  await next.work<{ leadId: string }>(LEAD_NOTIFY_QUEUE, async (jobs) => {
    for (const job of jobs) {
      const lead = await prisma.lead.findUnique({ where: { id: job.data.leadId } });
      if (!lead) continue;
      await deliverLeadNotice(lead);
    }
  });
  await next.work<{ assetId: string }>(MEDIA_PROCESS_QUEUE, async (jobs) => {
    for (const job of jobs) await processMediaAsset(job.data.assetId);
  });
  boss = next;
  log.info("background jobs ready");
}

export async function enqueueLeadNotify(leadId: string) {
  if (!boss) {
    const lead = await prisma.lead.findUnique({ where: { id: leadId } });
    if (lead) await deliverLeadNotice(lead);
    return;
  }
  await boss.send(LEAD_NOTIFY_QUEUE, { leadId }, { singletonKey: leadId });
}

export async function enqueueMediaProcess(assetId: string) {
  if (!boss) {
    await processMediaAsset(assetId);
    return;
  }
  await boss.send(MEDIA_PROCESS_QUEUE, { assetId }, { singletonKey: assetId });
}

export async function stopJobs() {
  if (!boss) return;
  await boss.stop();
  boss = null;
}
