import { prisma } from "../../db.js";
import { getStorage } from "../../storage/index.js";
import { processAudio, processDocument, processImage, processVideo, type VariantMap } from "./process.js";

export async function processMediaAsset(assetId: string) {
  const asset = await prisma.mediaAsset.findUnique({ where: { id: assetId } });
  if (!asset || asset.status === "READY") return;
  await prisma.mediaAsset.update({ where: { id: assetId }, data: { status: "PROCESSING" } });
  try {
    const storage = getStorage();
    const result =
      asset.kind === "IMAGE"
        ? await processImage(storage, asset.storageKey, asset.id)
        : asset.kind === "AUDIO"
          ? await processAudio(storage, asset.storageKey, asset.id)
          : asset.kind === "VIDEO"
            ? await processVideo(storage, asset.storageKey, asset.id)
            : asset.kind === "DOCUMENT"
              ? await processDocument(storage, asset.storageKey, asset.id, asset.mime)
              : { variants: { preview: "download" as const } satisfies VariantMap };
    await prisma.mediaAsset.update({
      where: { id: assetId },
      data: {
        status: "READY",
        width: "width" in result ? result.width : null,
        height: "height" in result ? result.height : null,
        durationSec: "durationSec" in result ? result.durationSec : null,
        pageCount: "pageCount" in result ? result.pageCount : null,
        variants: result.variants,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "processing failed";
    await prisma.mediaAsset.update({
      where: { id: assetId },
      data: { status: "FAILED", variants: { error: message.slice(0, 500) } },
    });
  }
}
