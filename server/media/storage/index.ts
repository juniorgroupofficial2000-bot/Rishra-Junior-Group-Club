import "server-only";

import { getServerEnv } from "@/config";
import { LocalObjectStorageProvider } from "@/server/media/storage/local-provider";
import type { ObjectStorageProvider } from "@/server/media/types";

let cached: ObjectStorageProvider | null = null;

/**
 * Resolve the configured object storage provider.
 * Default: local filesystem. Production: set MEDIA_STORAGE_DRIVER=s3.
 */
export function getObjectStorage(): ObjectStorageProvider {
  if (cached) return cached;

  const driver = getServerEnv().mediaStorageDriver;
  if (driver === "s3") {
    // Lazy load keeps S3 SDK out of local/test boot paths.
    // eslint-disable-next-line @typescript-eslint/no-require-imports -- sync provider factory
    const mod = require("./s3-provider") as typeof import("./s3-provider");
    cached = new mod.S3ObjectStorageProvider();
  } else if (driver === "local") {
    cached = new LocalObjectStorageProvider();
  } else {
    throw new Error(
      `Unknown MEDIA_STORAGE_DRIVER="${driver}". Use local or s3.`,
    );
  }
  return cached;
}

/** Test helper — reset singleton between cases. */
export function resetObjectStorageForTests(): void {
  cached = null;
}

export function createLocalObjectStorageForTests(
  rootDir: string,
): ObjectStorageProvider {
  return new LocalObjectStorageProvider(rootDir);
}
