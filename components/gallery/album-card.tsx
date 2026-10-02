import { ProvenanceBadge } from "@/components/heritage/provenance-badge";
import type { GalleryAlbum } from "@/content/gallery";
import { cn } from "@/lib/cn";
import Image from "next/image";
import Link from "next/link";

type AlbumCardProps = {
  album: GalleryAlbum;
  priority?: boolean;
  className?: string;
};

export function AlbumCard({ album, priority = false, className }: AlbumCardProps) {
  const cover = album.coverImage;
  const isSvg = cover.src.endsWith(".svg");

  return (
    <Link
      href={`/gallery/${album.slug}`}
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-xl border border-border-subtle bg-surface-raised shadow-xs",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className,
      )}
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-ink-900">
        <Image
          src={cover.src}
          alt={cover.alt}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          priority={priority}
          loading={priority ? "eager" : "lazy"}
          unoptimized={isSvg}
          className="object-cover transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-safe:group-hover:scale-[1.03]"
        />
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          <ProvenanceBadge provenance={album.provenance} />
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <div className="flex flex-wrap items-center gap-2 text-xs text-ink-500">
          {album.year ? (
            <span className="font-mono font-semibold text-alta-600">{album.year}</span>
          ) : null}
          {album.event ? <span>{album.event}</span> : null}
          <span className="text-ink-400">{album.media.length} items</span>
        </div>
        <h2 className="font-display text-xl font-semibold tracking-tight text-ink-900">
          {album.title}
        </h2>
        <p className="text-sm leading-relaxed text-ink-500">{album.description}</p>
      </div>
    </Link>
  );
}
