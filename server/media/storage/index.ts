import "server-only";

import { getServerEnv } from "@/config";
import type { ObjectStorageProvider } from "@/server/media/types";

let cached: ObjectStorageProvider | null = null;

/**
 * Resolve the configured object storage provider.
 * Default: local filesystem. Production: set MEDIA_STORAGE_DRIVER=s3.
 *
 * Providers are lazy-required so the unused driver (and its native / fs
 * dependencies) stay out of serverless traces.
 */
export function getObjectStorage(): ObjectStorageProvider {
  if (cached) return cached;

  const driver = getServerEnv().mediaStorageDriver;
  if (driver === "s3") {
    // eslint-disable-next-line @typescript-eslint/no-require-imports -- sync provider factory
    const mod = require("./s3-provider") as typeof import("./s3-provider");
    cached = new mod.S3ObjectStorageProvider();
  } else if (driver === "local") {
    // eslint-disable-next-line @typescript-eslint/no-require-imports -- sync provider factory
    const mod = require("./local-provider") as typeof import("./local-provider");
    cached = new mod.LocalObjectStorageProvider();
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
  // eslint-disable-next-line @typescript-eslint/no-require-imports -- test-only local provider
  const mod = require("./local-provider") as typeof import("./local-provider");
  return new mod.LocalObjectStorageProvider(rootDir);
}
