import type { MediaItem } from "@/content/shared/media";
import { cn } from "@/lib/cn";
import {
  isManagedMediaSrc,
  withMediaVariant,
  type PublicMediaVariant,
} from "@/lib/media/variant";
import { Play } from "lucide-react";
import Image from "next/image";

type OptimizedMediaProps = {
  media: MediaItem;
  className?: string;
  imgClassName?: string;
  sizes: string;
  priority?: boolean;
  /** When true, video shows poster + play affordance (no autoplay). */
  showVideoPoster?: boolean;
  /**
   * Preferred delivery variant for managed `/api/media` sources.
   * Lists should use `thumb` / `sm`; detail views `md` / `lg`.
   */
  variant?: PublicMediaVariant;
};

/**
 * Optimized image/video tile for public media.
 * Uses next/image with long-lived caching; managed media prefers thumbnails
 * in list contexts for faster paint.
 */
export function OptimizedMedia({
  media,
  className,
  imgClassName,
  sizes,
  priority = false,
  showVideoPoster = true,
  variant = "sm",
}: OptimizedMediaProps) {
  const isSvg =
    media.src.endsWith(".svg") || media.poster?.endsWith(".svg") === true;
  const rawSrc =
    media.kind === "video" && media.poster ? media.poster : media.src;
  const imageSrc = isManagedMediaSrc(rawSrc)
    ? withMediaVariant(rawSrc, variant)
    : rawSrc;

  return (
    <figure className={cn("min-w-0", className)}>
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-ink-900">
        <Image
          src={imageSrc}
          alt={media.alt || "Club media"}
          fill
          sizes={sizes}
          priority={priority}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          quality={isSvg ? undefined : 70}
          unoptimized={isSvg}
          className={cn("object-cover", imgClassName)}
        />
        {media.kind === "video" && showVideoPoster ? (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-ink-950/25">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-ink-900 shadow-md">
              <Play className="h-5 w-5 fill-current" aria-hidden />
              <span className="sr-only">Video</span>
            </span>
          </div>
        ) : null}
      </div>
      {media.caption ? (
        <figcaption className="mt-2 text-xs leading-relaxed text-ink-500">
          {media.caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
