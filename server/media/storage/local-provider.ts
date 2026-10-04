import "server-only";

import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  assertSafeStorageKey,
} from "@/server/media/validation";
import type {
  ObjectStorageProvider,
  PutObjectInput,
  StoredObject,
} from "@/server/media/types";

/** Default root — must stay under a fixed subfolder of cwd for Turbopack tracing. */
const DEFAULT_MEDIA_ROOT = path.join(process.cwd(), ".data", "media");

/**
 * Local filesystem object store for development / single-node deploys.
 * Objects live outside `public/` and are served only through the media API.
 */
export class LocalObjectStorageProvider implements ObjectStorageProvider {
  readonly name = "local";
  private readonly root: string;

  constructor(rootDir?: string) {
    // Keep the default path statically scoped (cwd/.data/media). Custom roots
    // opt out of Turbopack filesystem tracing so Vercel does not bundle the
    // entire project into the serverless output.
    this.root = rootDir
      ? path.resolve(/* turbopackIgnore: true */ rootDir)
      : DEFAULT_MEDIA_ROOT;
  }

  private resolveKey(key: string): string {
    assertSafeStorageKey(key);
    const full = path.resolve(/* turbopackIgnore: true */ this.root, key);
    const relative = path.relative(this.root, full);
    if (relative.startsWith("..") || path.isAbsolute(relative)) {
      throw new Error("Path traversal rejected.");
    }
    return full;
  }

  async putObject(input: PutObjectInput): Promise<{ key: string }> {
    const full = this.resolveKey(input.key);
    await mkdir(path.dirname(full), { recursive: true });
    await writeFile(full, input.body);
    return { key: input.key };
  }

  async getObject(key: string): Promise<StoredObject | null> {
    try {
      const full = this.resolveKey(key);
      const body = await readFile(full);
      return {
        key,
        body,
        contentType: "application/octet-stream",
        contentLength: body.length,
      };
    } catch {
      return null;
    }
  }

  async deleteObject(key: string): Promise<void> {
    try {
      const full = this.resolveKey(key);
      await unlink(full);
    } catch {
      // idempotent
    }
  }

  getPublicUrl(_key: string): string | null {
    // Local objects are not world-readable from disk; use /api/media/:id.
    return null;
  }
}
