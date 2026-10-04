import { EmptyState } from "@/components/public/empty-state";
import type { GalleryAlbum } from "@/content/gallery";
import { AlbumCard } from "./album-card";

export function AlbumGrid({ albums }: { albums: GalleryAlbum[] }) {
  if (albums.length === 0) {
    return (
      <EmptyState
        title="No gallery photos have been published yet"
        description="Albums appear here after the committee publishes photographs from club events and Saraswati Puja."
        action={{ label: "Explore Saraswati Puja", href: "/saraswati-puja" }}
        secondaryAction={{ label: "Contact the club", href: "/contact" }}
      />
    );
  }

  const [lead, ...rest] = albums;

  return (
    <div className="space-y-4 sm:space-y-5">
      {lead ? (
        <AlbumCard album={lead} featured priority index={0} />
      ) : null}
      {rest.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-5">
          {rest.map((album, index) => (
            <AlbumCard
              key={album.id}
              album={album}
              index={index + 1}
              className={
                index % 5 === 0
                  ? "sm:col-span-2 lg:col-span-1"
                  : index % 7 === 0
                    ? "lg:col-span-2"
                    : undefined
              }
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
