import { FadeIn, Stagger, StaggerItem } from "@/components/motion/fade-in";
import type { GalleryAlbum } from "@/content/gallery";
import { AlbumCard } from "./album-card";

export function AlbumGrid({ albums }: { albums: GalleryAlbum[] }) {
  if (albums.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border-strong px-5 py-8 text-sm text-ink-500">
        No published albums yet.
      </p>
    );
  }

  return (
    <Stagger className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {albums.map((album, index) => (
        <StaggerItem key={album.id}>
          <FadeIn>
            <AlbumCard album={album} priority={index < 2} />
          </FadeIn>
        </StaggerItem>
      ))}
    </Stagger>
  );
}
