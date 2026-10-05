"use client";

import { ClipImageReveal } from "@/components/motion";
import { ProvenanceBadge } from "@/components/heritage/provenance-badge";
import type { GalleryAlbum } from "@/content/gallery";
import { cn } from "@/lib/cn";
import { withMediaVariant } from "@/lib/media/variant";
import { cardRevealVariants, transitionSlow } from "@/lib/motion";
import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import Link from "next/link";

type AlbumCardProps = {
  album: GalleryAlbum;
  priority?: boolean;
  className?: string;
  featured?: boolean;
  index?: number;
};

export function AlbumCard({
  album,
  priority = false,
  className,
  featured = false,
  index = 0,
}: AlbumCardProps) {
  const cover = album.coverImage;
  const coverSrc = cover
    ? withMediaVariant(cover.src, featured ? "md" : "thumb")
    : null;
  const isSvg = Boolean(coverSrc?.endsWith(".svg"));
  const reduce = Boolean(useReducedMotion());

  return (
    <motion.div
      variants={reduce ? undefined : cardRevealVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-10%" }}
      transition={{ ...transitionSlow, delay: index * 0.08 }}
      className={cn("h-full", className)}
    >
      <Link
        href={`/gallery/${album.slug}`}
        data-cursor-label="VIEW"
        className={cn(
          "group relative block h-full overflow-hidden bg-ink-900",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          featured ? "aspect-[16/10] sm:aspect-[21/10]" : "aspect-[4/3]",
        )}
      >
        <ClipImageReveal className="absolute inset-0" delay={index * 0.04}>
          {cover && coverSrc ? (
            <Image
              src={coverSrc}
              alt={cover.alt}
              fill
              sizes={
                featured
                  ? "100vw"
                  : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              }
              priority={priority}
              loading={priority ? "eager" : "lazy"}
              decoding="async"
              quality={isSvg ? undefined : 75}
              unoptimized={isSvg}
              className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-safe:group-hover:scale-[1.04]"
            />
          ) : (
            <div
              className="absolute inset-0 bg-gradient-to-br from-ink-800 via-ink-900 to-ink-950"
              aria-hidden
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950/85 via-ink-950/15 to-transparent" />
          <div className="absolute left-4 top-4">
            <ProvenanceBadge provenance={album.provenance} />
          </div>
          <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
            <div className="flex flex-wrap items-center gap-2 type-caption text-white/70">
              {album.year ? (
                <span className="font-mono text-marigold-400">{album.year}</span>
              ) : null}
              <span>{album.mediaCount ?? album.media.length} items</span>
            </div>
            <h2
              className={cn(
                "mt-2 font-display font-semibold tracking-tight text-white",
                featured ? "text-2xl sm:text-3xl" : "text-lg sm:text-xl",
              )}
            >
              {album.title}
            </h2>
            {!featured && album.description ? (
              <p className="mt-2 line-clamp-2 max-w-md text-sm text-white/70">
                {album.description}
              </p>
            ) : null}
          </div>
        </ClipImageReveal>
      </Link>
    </motion.div>
  );
}
