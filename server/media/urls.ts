import "server-only";

import type { MediaVariantName, MediaVariantsMap } from "@/server/media/types";
import { getObjectStorage } from "@/server/media/storage";

/** App-relative public delivery URL (published content only). */
export function mediaDeliveryPath(
  assetId: string,
  variant: MediaVariantName = "md",
): string {
  return `/api/media/${assetId}?v=${variant}`;
}

/** Staff preview URL — requires admin session. */
export function adminMediaDeliveryPath(
  assetId: string,
  variant: MediaVariantName = "md",
): string {
  return `/api/admin/media/${assetId}?v=${variant}`;
}

/**
 * Prefer CDN/public object URL when the storage provider exposes one;
 * otherwise use the app delivery API path.
 * Admin list/preview should pass `admin: true` so drafts are not linked
 * through the public route.
 */
export function resolveMediaUrl(input: {
  assetId: string;
  variants: MediaVariantsMap | null | undefined;
  variant?: MediaVariantName;
  admin?: boolean;
}): string {
  const variant = input.variant ?? "md";
  if (input.admin) {
    return adminMediaDeliveryPath(input.assetId, variant);
  }
  const descriptor = input.variants?.[variant] ?? input.variants?.original;
  if (descriptor) {
    const publicUrl = getObjectStorage().getPublicUrl(descriptor.key);
    if (publicUrl) return publicUrl;
  }
  return mediaDeliveryPath(input.assetId, variant);
}
