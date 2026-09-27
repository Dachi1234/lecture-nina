import { prisma } from "../../db.js";
import { decideMediaAccess, signMediaUrl } from "./sign.js";

export async function assignmentReadyForAsset(userId: string, assetId: string) {
  const profile = await prisma.studentProfile.findUnique({ where: { userId }, select: { id: true } });
  if (!profile) return false;
  const hit = await prisma.materialAsset.findFirst({
    where: {
      assetId,
      material: { assignments: { some: { studentId: profile.id, readyForStudent: true } } },
    },
    select: { assetId: true },
  });
  return hit !== null;
}

export async function issueMediaUrl(user: { id: string; role?: string | null }, assetId: string, variant: string) {
  const ready = user.role === "ADMIN" || (await assignmentReadyForAsset(user.id, assetId));
  if (!decideMediaAccess(user.role, ready)) return null;
  return signMediaUrl(assetId, variant);
}
