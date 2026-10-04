import { OptimizedMedia } from "@/components/media/optimized-media";
import { EmptyState } from "@/components/public/empty-state";
import type { MediaItem } from "@/content/shared/media";

/**
 * Gallery media grid — Server Component by default.
 * Only the first image is prioritized; the rest lazy-load to reduce LCP contention.
 */
export function AlbumMediaGrid({ media }: { media: MediaItem[] }) {
  if (media.length === 0) {
    return (
      <EmptyState
        title="No photos in this album yet"
        description="Media appears here after the committee publishes photographs for this album."
        action={{ label: "All albums", href: "/gallery" }}
      />
    );
  }

  return (
    <ul className="grid min-w-0 grid-cols-2 gap-3 md:grid-cols-3">
      {media.map((item, index) => (
        <li
          key={item.id}
          className={
            item.kind === "video"
              ? "col-span-2 min-w-0 md:col-span-1"
              : "min-w-0 [content-visibility:auto] [contain-intrinsic-size:1px_280px]"
          }
        >
          <OptimizedMedia
            media={item}
            variant="sm"
            priority={index === 0}
            sizes="(max-width: 768px) 50vw, 33vw"
            className="overflow-hidden rounded-lg [&_div]:aspect-square"
          />
        </li>
      ))}
    </ul>
  );
}
