import { prisma } from "../../db.js";
import { groupIdsFor, lessonInclude, resolveItems, studentLessonWhere, visibleToStudent } from "../lessons/load.js";
import { decideMediaAccess, signMediaUrl } from "./sign.js";

/** True when the asset belongs to a material this student can open in one of their published lessons. */
export async function assignmentReadyForAsset(userId: string, assetId: string) {
  const profile = await prisma.studentProfile.findUnique({ where: { userId }, select: { id: true } });
  if (!profile) return false;
  const links = await prisma.materialAsset.findMany({ where: { assetId }, select: { materialId: true } });
  if (!links.length) return false;
  const materialIds = new Set(links.map((link) => link.materialId));
  const groupIds = await groupIdsFor(profile.id);
  const lessons = await prisma.lesson.findMany({
    where: {
      AND: [
        studentLessonWhere(profile.id, groupIds),
        { OR: [{ plan: { items: { some: { materialId: { in: [...materialIds] } } } } }, { items: { some: { materialId: { in: [...materialIds] } } } }] },
      ],
    },
    include: lessonInclude,
  });
  return lessons.some((lesson) => visibleToStudent(resolveItems(lesson)).some((item) => materialIds.has(item.materialId)));
}

export async function issueMediaUrl(user: { id: string; role?: string | null }, assetId: string, variant: string) {
  const ready = user.role === "ADMIN" || (await assignmentReadyForAsset(user.id, assetId));
  if (!decideMediaAccess(user.role, ready)) return null;
  return signMediaUrl(assetId, variant);
}
