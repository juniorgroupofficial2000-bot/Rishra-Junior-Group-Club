import type { MediaItem } from "@/content/shared/media";
import { cn } from "@/lib/cn";
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
};

/**
 * Optimized image/video tile for public media.
 * Images use next/image; SVG placeholders are unoptimized.
 * Videos never autoplay — poster + caption only until a hosted player is wired.
 */
export function OptimizedMedia({
  media,
  className,
  imgClassName,
  sizes,
  priority = false,
  showVideoPoster = true,
}: OptimizedMediaProps) {
  const isSvg =
    media.src.endsWith(".svg") || media.poster?.endsWith(".svg") === true;
  const imageSrc =
    media.kind === "video" && media.poster ? media.poster : media.src;

  return (
    <figure className={cn("min-w-0", className)}>
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-ink-900">
        <Image
          src={imageSrc}
          alt={media.alt}
          fill
          sizes={sizes}
          priority={priority}
          loading={priority ? "eager" : "lazy"}
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
