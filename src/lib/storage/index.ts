import { localDriver } from "./local";
import type { StorageDriver } from "./types";

export type { StorageDriver, StoredObject, ObjectStat } from "./types";

let driver: StorageDriver | null = null;

export async function getStorage(): Promise<StorageDriver> {
  if (driver) return driver;
  const provider = (process.env.STORAGE_PROVIDER ?? "local").toLowerCase();
  if (provider === "s3" || provider === "minio") {
    const { createS3Driver } = await import("./s3");
    driver = createS3Driver();
  } else {
    driver = localDriver;
  }
  return driver;
}

/** Public URL (served by /api/files) for an object key. */
export function fileUrl(key: string): string {
  return `/api/files/${key.split("/").map(encodeURIComponent).join("/")}`;
}

export function isSafeKey(key: string): boolean {
  if (!key || key.length > 512) return false;
  if (key.startsWith("/") || key.includes("\\") || key.includes("\0")) return false;
  return key.split("/").every((part) => part !== "" && part !== "." && part !== "..");
}

export function datedKey(prefix: string, fileName: string): string {
  const now = new Date();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  return `${prefix}/${now.getUTCFullYear()}/${month}/${fileName}`;
}
