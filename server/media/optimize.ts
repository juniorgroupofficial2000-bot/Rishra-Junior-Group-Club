import "server-only";

import sharp from "sharp";
import type { MediaVariantName, MediaVariantsMap } from "@/server/media/types";
import { MediaValidationError } from "@/server/media/validation";

const VARIANT_WIDTHS: Record<Exclude<MediaVariantName, "original">, number> = {
  thumb: 240,
  sm: 480,
  md: 960,
  lg: 1600,
};

export type OptimizedVariant = {
  name: MediaVariantName;
  buffer: Buffer;
  width: number;
  height: number;
  mimeType: string;
};

/**
 * Decode, auto-orient, strip metadata, and produce responsive WebP variants
 * plus a bounded original (JPEG/WebP) for archival delivery.
 */
export async function optimizeImageVariants(
  input: Buffer,
  sourceMime: string,
): Promise<{
  width: number;
  height: number;
  variants: OptimizedVariant[];
}> {
  let pipeline = sharp(input, {
    failOn: "error",
    animated: sourceMime === "image/gif",
  }).rotate();

  const meta = await pipeline.metadata();
  if (!meta.width || !meta.height) {
    throw new MediaValidationError("Could not read image dimensions.");
  }

  // Re-create pipeline after metadata (sharp consumers are one-shot).
  pipeline = sharp(input, {
    failOn: "error",
    animated: sourceMime === "image/gif",
  }).rotate();

  const maxOriginalEdge = 2400;
  const variants: OptimizedVariant[] = [];

  // Original: re-encode to strip EXIF; keep GIF as GIF when animated.
  if (sourceMime === "image/gif" && (meta.pages ?? 1) > 1) {
    const buffer = await pipeline.gif().toBuffer();
    const outMeta = await sharp(buffer).metadata();
    variants.push({
      name: "original",
      buffer,
      width: outMeta.width ?? meta.width,
      height: outMeta.height ?? meta.height,
      mimeType: "image/gif",
    });
  } else {
    const buffer = await sharp(input)
      .rotate()
      .resize({
        width: maxOriginalEdge,
        height: maxOriginalEdge,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 82, effort: 4 })
      .toBuffer();
    const outMeta = await sharp(buffer).metadata();
    variants.push({
      name: "original",
      buffer,
      width: outMeta.width ?? meta.width,
      height: outMeta.height ?? meta.height,
      mimeType: "image/webp",
    });
  }

  for (const [name, width] of Object.entries(VARIANT_WIDTHS) as Array<
    [Exclude<MediaVariantName, "original">, number]
  >) {
    const isThumb = name === "thumb";
    const buffer = await sharp(input)
      .rotate()
      .resize({
        width: isThumb ? width : width,
        height: isThumb ? width : undefined,
        fit: isThumb ? "cover" : "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: isThumb ? 75 : 80, effort: 4 })
      .toBuffer();
    const outMeta = await sharp(buffer).metadata();
    variants.push({
      name,
      buffer,
      width: outMeta.width ?? width,
      height: outMeta.height ?? width,
      mimeType: "image/webp",
    });
  }

  const original = variants.find((v) => v.name === "original")!;
  return {
    width: original.width,
    height: original.height,
    variants,
  };
}

export function variantsToMap(
  stored: Array<{
    name: MediaVariantName;
    key: string;
    width: number;
    height: number;
    byteSize: number;
    mimeType: string;
  }>,
): MediaVariantsMap {
  const map: MediaVariantsMap = {};
  for (const item of stored) {
    map[item.name] = {
      key: item.key,
      width: item.width,
      height: item.height,
      byteSize: item.byteSize,
      mimeType: item.mimeType,
    };
  }
  return map;
}
