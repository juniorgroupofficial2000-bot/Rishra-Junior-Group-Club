import { StaggerChildren, StaggerItem } from "@/components/motion";
import type { GalleryAlbum } from "@/content/gallery";
import { AlbumCard } from "./album-card";

export function AlbumGrid({ albums }: { albums: GalleryAlbum[] }) {
  if (albums.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-border-strong px-5 py-8 type-body-small text-ink-500">
        No published albums yet.
      </p>
    );
  }

  return (
    <StaggerChildren className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {albums.map((album, index) => (
        <StaggerItem key={album.id}>
          <AlbumCard album={album} priority={index < 2} />
        </StaggerItem>
      ))}
    </StaggerChildren>
  );
}
