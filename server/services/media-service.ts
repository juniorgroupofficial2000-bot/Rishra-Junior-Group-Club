import "server-only";

import { createId } from "@/server/media/create-id";
import {
  optimizeImageVariants,
  variantsToMap,
} from "@/server/media/optimize";
import { getObjectStorage } from "@/server/media/storage";
import type { MediaPurposeValue, MediaVariantName, MediaVariantsMap } from "@/server/media/types";
import { resolveMediaUrl } from "@/server/media/urls";
import {
  MediaValidationError,
  buildSafeStorageKey,
  validateAltText,
  validateCaption,
  validateUploadBuffer,
} from "@/server/media/validation";
import { AuditActions } from "@/server/audit/actions";
import { prisma } from "@/server/db/prisma";
import { writeAuditEvent } from "@/server/services/audit-service";
import type { MediaAsset, Prisma } from "@prisma/client";

export class MediaServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MediaServiceError";
  }
}

export type UploadImageInput = {
  buffer: Buffer;
  filename: string;
  declaredMime?: string | null;
  purpose: MediaPurposeValue;
  alt: string;
  caption?: string | null;
  historicallyImportant?: boolean;
  slotKey?: string | null;
  actorUserId: string | null;
};

function asVariantsMap(value: unknown): MediaVariantsMap {
  if (!value || typeof value !== "object") return {};
  return value as MediaVariantsMap;
}

function wrapValidation<T>(fn: () => T): T {
  try {
    return fn();
  } catch (error) {
    if (error instanceof MediaValidationError) {
      throw new MediaServiceError(error.message);
    }
    throw error;
  }
}

export async function uploadImageAsset(
  input: UploadImageInput,
): Promise<MediaAsset> {
  const alt = wrapValidation(() => validateAltText(input.alt));
  const caption = wrapValidation(() => validateCaption(input.caption));
  const validated = wrapValidation(() =>
    validateUploadBuffer({
      buffer: input.buffer,
      declaredMime: input.declaredMime,
      filename: input.filename,
      purpose: input.purpose,
    }),
  );

  const assetId = createId();
  const storage = getObjectStorage();

  let optimized;
  try {
    optimized = await optimizeImageVariants(
      input.buffer,
      validated.mimeType,
    );
  } catch (error) {
    if (error instanceof MediaValidationError) {
      throw new MediaServiceError(error.message);
    }
    throw new MediaServiceError("Image optimization failed.");
  }

  const storedVariants: Array<{
    name: MediaVariantName;
    key: string;
    width: number;
    height: number;
    byteSize: number;
    mimeType: string;
  }> = [];

  try {
    for (const variant of optimized.variants) {
      const key = buildSafeStorageKey({
        purpose: input.purpose,
        assetId,
        variant: variant.name,
        mimeType: variant.mimeType,
        originalFilename: validated.originalFilename,
      });
      await storage.putObject({
        key,
        body: variant.buffer,
        contentType: variant.mimeType,
      });
      storedVariants.push({
        name: variant.name,
        key,
        width: variant.width,
        height: variant.height,
        byteSize: variant.buffer.length,
        mimeType: variant.mimeType,
      });
    }
  } catch (error) {
    // Best-effort cleanup of partial uploads.
    await Promise.all(
      storedVariants.map((v) => storage.deleteObject(v.key).catch(() => undefined)),
    );
    throw error instanceof MediaServiceError
      ? error
      : new MediaServiceError("Failed to store image object.");
  }

  const variantsMap = variantsToMap(storedVariants);
  const original = storedVariants.find((v) => v.name === "original")!;

  try {
    const row = await prisma.mediaAsset.create({
      data: {
        id: assetId,
        purpose: input.purpose,
        status: "READY",
        slotKey: input.slotKey?.trim() || null,
        originalFilename: validated.originalFilename,
        storageKey: original.key,
        mimeType: original.mimeType,
        byteSize: original.byteSize,
        width: optimized.width,
        height: optimized.height,
        alt,
        caption,
        variants: variantsMap as Prisma.InputJsonValue,
        checksumSha256: validated.checksumSha256,
        historicallyImportant: Boolean(input.historicallyImportant),
        createdById: input.actorUserId,
      },
    });

    await writeAuditEvent({
      actorUserId: input.actorUserId,
      action: AuditActions.MEDIA_UPLOADED,
      entityType: "MediaAsset",
      entityId: row.id,
      metadata: {
        purpose: row.purpose,
        mimeType: row.mimeType,
        byteSize: row.byteSize,
        slotKey: row.slotKey,
      },
    });

    return row;
  } catch (error) {
    await Promise.all(
      storedVariants.map((v) => storage.deleteObject(v.key).catch(() => undefined)),
    );
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2002"
    ) {
      throw new MediaServiceError(
        "A media asset already exists for this hero slot.",
      );
    }
    throw new MediaServiceError("Failed to persist media metadata.");
  }
}

export async function updateMediaMetadata(
  id: string,
  raw: { alt?: string; caption?: string | null; historicallyImportant?: boolean },
  actorUserId: string | null,
) {
  const existing = await prisma.mediaAsset.findFirst({
    where: { id, deletedAt: null },
  });
  if (!existing) {
    throw new MediaServiceError("Media asset not found.");
  }

  const data: Prisma.MediaAssetUpdateInput = {};
  try {
    if (raw.alt !== undefined) data.alt = validateAltText(raw.alt);
    if (raw.caption !== undefined) data.caption = validateCaption(raw.caption);
  } catch (error) {
    if (error instanceof MediaValidationError) {
      throw new MediaServiceError(error.message);
    }
    throw error;
  }
  if (raw.historicallyImportant !== undefined) {
    data.historicallyImportant = raw.historicallyImportant;
  }

  const row = await prisma.mediaAsset.update({ where: { id }, data });
  await writeAuditEvent({
    actorUserId,
    action: AuditActions.MEDIA_UPDATED,
    entityType: "MediaAsset",
    entityId: row.id,
    metadata: { fields: Object.keys(data) },
  });
  return row;
}

export async function softDeleteMediaAsset(
  id: string,
  actorUserId: string | null,
) {
  const existing = await prisma.mediaAsset.findFirst({
    where: { id, deletedAt: null },
  });
  if (!existing) {
    throw new MediaServiceError("Media asset not found.");
  }
  if (existing.historicallyImportant) {
    throw new MediaServiceError(
      "Cannot delete historically important media. Archive it instead.",
    );
  }

  const row = await prisma.mediaAsset.update({
    where: { id },
    data: { deletedAt: new Date(), status: "ARCHIVED" },
  });

  // Keep objects for recovery; soft-delete only. Hard purge is a separate ops job.
  await writeAuditEvent({
    actorUserId,
    action: AuditActions.MEDIA_DELETED,
    entityType: "MediaAsset",
    entityId: row.id,
    metadata: { purpose: row.purpose, storageKey: row.storageKey },
  });
  return row;
}

export async function getReadyMediaAsset(id: string) {
  return prisma.mediaAsset.findFirst({
    where: { id, deletedAt: null, status: "READY" },
  });
}

/** Purposes that are intended for the public website once READY. */
const PUBLIC_SITE_PURPOSES = new Set([
  "COMMITTEE_PORTRAIT",
  "GALLERY",
  "EVENT",
  "PUJA",
  "HERO",
  "GENERAL",
]);

/**
 * Public `/api/media` delivery rules:
 * - READY + public site purpose (gallery/hero/event/…) → allowed (opaque ids)
 * - READY + hero/site slotKey → allowed
 * - READY + linked to published content or a member portrait → allowed
 * - MEMBER_PORTRAIT without a member link stays staff-only
 * Staff preview always uses `/api/admin/media/[id]`.
 */
export async function isMediaPubliclyDeliverable(
  assetId: string,
): Promise<boolean> {
  const asset = await prisma.mediaAsset.findFirst({
    where: { id: assetId, deletedAt: null, status: "READY" },
    select: { id: true, slotKey: true, purpose: true },
  });
  if (!asset) return false;
  if (asset.slotKey) return true;
  if (PUBLIC_SITE_PURPOSES.has(asset.purpose)) return true;

  const [gallery, eventCover, committee, puja, announcement, memberPortrait] =
    await Promise.all([
      prisma.galleryMedia.findFirst({
        where: {
          mediaAssetId: assetId,
          deletedAt: null,
          contentStatus: "PUBLISHED",
          album: { deletedAt: null, contentStatus: "PUBLISHED" },
        },
        select: { id: true },
      }),
      prisma.event.findFirst({
        where: {
          coverAssetId: assetId,
          deletedAt: null,
          contentStatus: "PUBLISHED",
        },
        select: { id: true },
      }),
      prisma.publicCommitteeMember.findFirst({
        where: {
          portraitAssetId: assetId,
          deletedAt: null,
          status: "PUBLISHED",
        },
        select: { id: true },
      }),
      prisma.pujaYear.findFirst({
        where: {
          coverAssetId: assetId,
          deletedAt: null,
          status: "PUBLISHED",
        },
        select: { id: true },
      }),
      prisma.announcement.findFirst({
        where: {
          coverAssetId: assetId,
          deletedAt: null,
          OR: [
            { status: "PUBLISHED" },
            { status: "SCHEDULED", publishedAt: { lte: new Date() } },
          ],
        },
        select: { id: true },
      }),
      prisma.member.findFirst({
        where: {
          portraitAssetId: assetId,
          deletedAt: null,
        },
        select: { id: true },
      }),
    ]);

  return Boolean(
    gallery ||
      eventCover ||
      committee ||
      puja ||
      announcement ||
      memberPortrait,
  );
}

export async function listMediaAssets(input?: {
  purpose?: MediaPurposeValue;
  /** When set, only assets with these purposes are returned (RBAC). */
  allowedPurposes?: MediaPurposeValue[];
  query?: string;
  page?: number;
  pageSize?: number;
}) {
  const page = input?.page ?? 1;
  const pageSize = Math.min(input?.pageSize ?? 20, 100);
  const q = input?.query?.trim();
  const purposeFilter = input?.purpose
    ? input.purpose
    : input?.allowedPurposes && input.allowedPurposes.length > 0
      ? { in: input.allowedPurposes }
      : undefined;
  if (input?.purpose && input.allowedPurposes) {
    if (!input.allowedPurposes.includes(input.purpose)) {
      return { items: [], total: 0, page, pageSize };
    }
  }
  const where: Prisma.MediaAssetWhereInput = {
    deletedAt: null,
    ...(purposeFilter ? { purpose: purposeFilter } : {}),
    ...(q
      ? {
          OR: [
            { alt: { contains: q, mode: "insensitive" } },
            { caption: { contains: q, mode: "insensitive" } },
            { originalFilename: { contains: q, mode: "insensitive" } },
            { slotKey: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [total, items] = await prisma.$transaction([
    prisma.mediaAsset.count({ where }),
    prisma.mediaAsset.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return {
    total,
    page,
    pageSize,
    items: items.map((item) => ({
      ...item,
      url: resolveMediaUrl({
        assetId: item.id,
        variants: asVariantsMap(item.variants),
        variant: "thumb",
        admin: true,
      }),
      urlMd: resolveMediaUrl({
        assetId: item.id,
        variants: asVariantsMap(item.variants),
        variant: "md",
        admin: true,
      }),
    })),
  };
}

export async function loadVariantBytes(
  assetId: string,
  variant: MediaVariantName,
  options?: { requirePublic?: boolean },
): Promise<{
  body: Buffer;
  contentType: string;
  cacheControl: string;
} | null> {
  if (options?.requirePublic !== false) {
    const allowed = await isMediaPubliclyDeliverable(assetId);
    if (!allowed) return null;
  }

  const asset = await getReadyMediaAsset(assetId);
  if (!asset) return null;

  const variants = asVariantsMap(asset.variants);
  const descriptor =
    variants[variant] ?? variants.original ?? variants.md ?? variants.sm;
  if (!descriptor) return null;

  const object = await getObjectStorage().getObject(descriptor.key);
  if (!object) return null;

  return {
    body: object.body,
    contentType: descriptor.mimeType || object.contentType,
    // Variant URLs are content-stable for an asset id — cache aggressively.
    cacheControl:
      options?.requirePublic === false
        ? "private, no-store"
        : "public, max-age=31536000, immutable, stale-while-revalidate=86400",
  };
}
