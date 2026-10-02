import { Stagger, StaggerItem } from "@/components/motion/fade-in";
import { OptimizedMedia } from "@/components/media/optimized-media";
import type { MediaItem } from "@/content/shared/media";

export function AlbumMediaGrid({ media }: { media: MediaItem[] }) {
  return (
    <Stagger className="grid grid-cols-2 gap-3 md:grid-cols-3">
      {media.map((item, index) => (
        <StaggerItem
          key={item.id}
          className={item.kind === "video" ? "col-span-2 md:col-span-1" : undefined}
        >
          <OptimizedMedia
            media={item}
            priority={index === 0}
            sizes="(max-width: 768px) 50vw, 33vw"
            className="overflow-hidden rounded-lg [&_div]:aspect-square [&_div]:sm:rounded-lg"
          />
        </StaggerItem>
      ))}
    </Stagger>
  );
}
