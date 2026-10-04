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

/**
 * Local filesystem object store for development / single-node deploys.
 * Objects live outside `public/` and are served only through the media API.
 */
export class LocalObjectStorageProvider implements ObjectStorageProvider {
  readonly name = "local";
  private readonly root: string;

  constructor(rootDir?: string) {
    this.root = path.resolve(
      rootDir ?? process.env.MEDIA_LOCAL_ROOT ?? ".data/media",
    );
  }

  private resolveKey(key: string): string {
    assertSafeStorageKey(key);
    const full = path.resolve(this.root, key);
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
