export {
  MEDIA_PURPOSES,
  type MediaPurposeValue,
} from "@/lib/media/purposes";

export const MEDIA_VARIANTS = ["thumb", "sm", "md", "lg", "original"] as const;
export type MediaVariantName = (typeof MEDIA_VARIANTS)[number];

export type MediaVariantDescriptor = {
  key: string;
  width: number;
  height: number;
  byteSize: number;
  mimeType: string;
};

export type MediaVariantsMap = Partial<
  Record<MediaVariantName, MediaVariantDescriptor>
>;

export type StoredObject = {
  key: string;
  body: Buffer;
  contentType: string;
  contentLength: number;
};

export type PutObjectInput = {
  key: string;
  body: Buffer;
  contentType: string;
  cacheControl?: string;
};

/**
 * Object storage abstraction — swap local ↔ S3/R2 without changing callers.
 * Never store image binaries in PostgreSQL.
 */
export interface ObjectStorageProvider {
  readonly name: string;
  putObject(input: PutObjectInput): Promise<{ key: string }>;
  getObject(key: string): Promise<StoredObject | null>;
  deleteObject(key: string): Promise<void>;
  /** Optional CDN/public URL when the provider exposes one; otherwise null. */
  getPublicUrl(key: string): string | null;
}
