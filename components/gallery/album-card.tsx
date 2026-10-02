import { ProvenanceBadge } from "@/components/heritage/provenance-badge";
import type { GalleryAlbum } from "@/content/gallery";
import { cn } from "@/lib/cn";
import Image from "next/image";
import Link from "next/link";

type AlbumCardProps = {
  album: GalleryAlbum;
  priority?: boolean;
  className?: string;
  featured?: boolean;
};

export function AlbumCard({
  album,
  priority = false,
  className,
  featured = false,
}: AlbumCardProps) {
  const cover = album.coverImage;
  const isSvg = cover.src.endsWith(".svg");

  return (
    <Link
      href={`/gallery/${album.slug}`}
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border-subtle bg-surface-raised shadow-sm",
        "transition-[transform,box-shadow,border-color] duration-400 ease-[cubic-bezier(0.22,1,0.36,1)]",
        "hover:-translate-y-1 hover:border-marigold-400/40 hover:shadow-md",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        featured && "sm:col-span-2 sm:row-span-2",
        className,
      )}
    >
      <div
        className={cn(
          "relative overflow-hidden bg-ink-900",
          featured ? "aspect-[16/11] min-h-[16rem] sm:aspect-auto sm:min-h-full sm:flex-1" : "aspect-[16/10]",
        )}
      >
        <Image
          src={cover.src}
          alt={cover.alt}
          fill
          sizes={
            featured
              ? "(max-width: 640px) 100vw, 66vw"
              : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          }
          priority={priority}
          loading={priority ? "eager" : "lazy"}
          unoptimized={isSvg}
          className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-safe:group-hover:scale-[1.05]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/70 via-transparent to-transparent opacity-80" />
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          <ProvenanceBadge provenance={album.provenance} />
        </div>
        <div className="absolute inset-x-0 bottom-0 p-5">
          <div className="flex flex-wrap items-center gap-2 type-caption text-white/75">
            {album.year ? (
              <span className="font-mono text-marigold-400">{album.year}</span>
            ) : null}
            <span>{album.media.length} items</span>
          </div>
          <h2
            className={cn(
              "mt-2 font-display font-semibold tracking-tight text-white",
              featured ? "text-2xl sm:text-3xl" : "text-xl",
            )}
          >
            {album.title}
          </h2>
        </div>
      </div>
      {!featured ? (
        <div className="flex flex-1 flex-col gap-2 p-5">
          <p className="type-body-small leading-relaxed text-ink-500 line-clamp-2">
            {album.description}
          </p>
        </div>
      ) : null}
    </Link>
  );
}
