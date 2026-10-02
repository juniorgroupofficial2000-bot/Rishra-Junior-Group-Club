"use client";

import { ClipImageReveal } from "@/components/motion";
import { ProvenanceBadge } from "@/components/heritage/provenance-badge";
import type { GalleryAlbum } from "@/content/gallery";
import { cn } from "@/lib/cn";
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
  const isSvg = cover.src.endsWith(".svg");
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
          "group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border-subtle bg-surface-raised shadow-sm",
          "transition-[transform,box-shadow,border-color] duration-400 ease-[cubic-bezier(0.22,1,0.36,1)]",
          "hover:-translate-y-2 hover:border-marigold-400/50 hover:shadow-lg",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        )}
      >
        <ClipImageReveal className="relative aspect-[16/10] bg-ink-900" delay={index * 0.04}>
          <Image
            src={cover.src}
            alt={cover.alt}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            priority={priority}
            loading={priority ? "eager" : "lazy"}
            unoptimized={isSvg}
            className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-safe:group-hover:scale-[1.06]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950/75 via-transparent to-transparent opacity-80 transition-opacity duration-400 group-hover:opacity-95" />
          <div className="absolute left-3 top-3 flex flex-wrap gap-2">
            <ProvenanceBadge provenance={album.provenance} />
          </div>
          <div className="absolute inset-x-0 bottom-0 p-4 transition-transform duration-400 group-hover:-translate-y-1">
            <div className="flex flex-wrap items-center gap-2 type-caption text-white/75">
              {album.year ? (
                <span className="font-mono text-marigold-400">{album.year}</span>
              ) : null}
              <span>{album.media.length} items</span>
            </div>
            <h2 className="mt-1.5 font-display text-lg font-semibold tracking-tight text-white sm:text-xl">
              {album.title}
            </h2>
          </div>
        </ClipImageReveal>
        {!featured ? (
          <div className="flex flex-1 flex-col gap-2 p-5">
            <p className="type-body-small leading-relaxed text-ink-500 line-clamp-2">
              {album.description}
            </p>
          </div>
        ) : null}
      </Link>
    </motion.div>
  );
}
