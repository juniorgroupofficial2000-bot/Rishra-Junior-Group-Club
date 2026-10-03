import "server-only";

import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { assertSafeStorageKey } from "@/server/media/validation";
import type {
  ObjectStorageProvider,
  PutObjectInput,
  StoredObject,
} from "@/server/media/types";

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} is required when MEDIA_STORAGE_DRIVER=s3.`);
  }
  return value;
}

/**
 * S3-compatible object storage (AWS S3, Cloudflare R2, MinIO, etc.).
 */
export class S3ObjectStorageProvider implements ObjectStorageProvider {
  readonly name = "s3";
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly publicBaseUrl: string | null;

  constructor() {
    this.bucket = required("MEDIA_S3_BUCKET");
    const region = process.env.MEDIA_S3_REGION?.trim() || "auto";
    const endpoint = process.env.MEDIA_S3_ENDPOINT?.trim() || undefined;
    this.publicBaseUrl =
      process.env.MEDIA_PUBLIC_BASE_URL?.replace(/\/$/, "") || null;

    this.client = new S3Client({
      region,
      endpoint,
      forcePathStyle: process.env.MEDIA_S3_FORCE_PATH_STYLE === "true",
      credentials: {
        accessKeyId: required("MEDIA_S3_ACCESS_KEY_ID"),
        secretAccessKey: required("MEDIA_S3_SECRET_ACCESS_KEY"),
      },
    });
  }

  async putObject(input: PutObjectInput): Promise<{ key: string }> {
    assertSafeStorageKey(input.key);
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: input.key,
        Body: input.body,
        ContentType: input.contentType,
        CacheControl: input.cacheControl ?? "public, max-age=31536000, immutable",
        // Never set Content-Disposition=attachment for public gallery CDN;
        // delivery route still sets nosniff.
      }),
    );
    return { key: input.key };
  }

  async getObject(key: string): Promise<StoredObject | null> {
    assertSafeStorageKey(key);
    try {
      const result = await this.client.send(
        new GetObjectCommand({ Bucket: this.bucket, Key: key }),
      );
      if (!result.Body) return null;
      const bytes = await result.Body.transformToByteArray();
      const body = Buffer.from(bytes);
      return {
        key,
        body,
        contentType: result.ContentType ?? "application/octet-stream",
        contentLength: body.length,
      };
    } catch {
      return null;
    }
  }

  async deleteObject(key: string): Promise<void> {
    assertSafeStorageKey(key);
    await this.client.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: key }),
    );
  }

  getPublicUrl(key: string): string | null {
    if (!this.publicBaseUrl) return null;
    assertSafeStorageKey(key);
    return `${this.publicBaseUrl}/${key}`;
  }
}
