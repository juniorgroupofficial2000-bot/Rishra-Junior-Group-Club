import { Reveal, StaggerChildren, StaggerItem } from "@/components/motion";
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

  const [featured, ...rest] = albums;

  return (
    <div className="space-y-5">
      {featured ? (
        <Reveal>
          <div className="grid gap-5 lg:grid-cols-2 lg:grid-rows-1">
            <AlbumCard album={featured} priority featured className="lg:min-h-[28rem]" />
            <StaggerChildren className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1 lg:content-start">
              {rest.slice(0, 2).map((album, index) => (
                <StaggerItem key={album.id}>
                  <AlbumCard album={album} priority={index === 0} />
                </StaggerItem>
              ))}
            </StaggerChildren>
          </div>
        </Reveal>
      ) : null}

      {rest.length > 2 ? (
        <StaggerChildren className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {rest.slice(2).map((album) => (
            <StaggerItem key={album.id}>
              <AlbumCard album={album} />
            </StaggerItem>
          ))}
        </StaggerChildren>
      ) : null}
    </div>
  );
}
