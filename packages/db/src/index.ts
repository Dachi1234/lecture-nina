import { Prisma, PrismaClient } from "@prisma/client";

export { Prisma, PrismaClient };

export function createPrismaClient(): PrismaClient {
  return new PrismaClient();
}
