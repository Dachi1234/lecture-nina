import path from "node:path";
import { LocalVolumeDriver } from "./local.js";
import type { StorageDriver } from "./driver.js";

let driver: StorageDriver | null = null;

export function getStorage() {
  if (driver) return driver;
  const kind = process.env.STORAGE_DRIVER ?? "local";
  if (kind === "s3") throw new Error("S3 storage is not configured yet");
  const root = process.env.STORAGE_ROOT ?? path.resolve(process.cwd(), ".data");
  driver = new LocalVolumeDriver(root);
  return driver;
}
