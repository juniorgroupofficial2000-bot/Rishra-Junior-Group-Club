import { cn } from "@/lib/cn";
import Image from "next/image";
import type { ReactNode } from "react";

export type GalleryItem = {
  id: string;
  src?: string;
  alt: string;
  caption?: ReactNode;
  aspect?: "square" | "video" | "portrait";
  /** Demo/fallback tone when media is not yet available */
  tone?: "ink" | "alta" | "marigold" | "lotus";
};

export type GalleryGridProps = {
  items: GalleryItem[];
  className?: string;
};

const aspectClass = {
  square: "aspect-square",
  video: "aspect-video",
  portrait: "aspect-[3/4]",
} as const;

const toneClass = {
  ink: "bg-ink-800",
  alta: "bg-alta-500",
  marigold: "bg-marigold-500",
  lotus: "bg-lotus-500",
} as const;

export function GalleryGrid({ items, className }: GalleryGridProps) {
  return (
    <ul
      className={cn(
        "grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4",
        className,
      )}
    >
      {items.map((item) => (
        <li key={item.id} className="group min-w-0">
          <figure className="overflow-hidden rounded-lg bg-surface-sunken">
            <div
              className={cn(
                "relative w-full overflow-hidden",
                aspectClass[item.aspect ?? "square"],
              )}
            >
              {item.src ? (
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  className="object-cover transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
              ) : (
                <div
                  className={cn(
                    "absolute inset-0 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100",
                    toneClass[item.tone ?? "ink"],
                  )}
                  role="img"
                  aria-label={item.alt}
                />
              )}
            </div>
            {item.caption ? (
              <figcaption className="border-t border-border-subtle px-3 py-2 text-xs text-ink-500">
                {item.caption}
              </figcaption>
            ) : null}
          </figure>
        </li>
      ))}
    </ul>
  );
}

export type GalleryFeatureProps = {
  src?: string;
  alt: string;
  caption?: ReactNode;
  className?: string;
  tone?: "ink" | "alta" | "marigold" | "lotus";
};

/** Full-bleed archival frame — not a floating media card. */
export function GalleryFeature({
  src,
  alt,
  caption,
  className,
  tone = "ink",
}: GalleryFeatureProps) {
  return (
    <figure className={cn("relative w-full", className)}>
      <div className="relative mx-auto aspect-[16/9] w-full max-w-4xl overflow-hidden bg-ink-900">
        {src ? (
          <Image
            src={src}
            alt={alt}
            fill
            className="object-cover opacity-95"
            sizes="100vw"
            priority
          />
        ) : (
          <div
            className={cn("absolute inset-0", toneClass[tone])}
            role="img"
            aria-label={alt}
          />
        )}
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-950/55 via-transparent to-transparent"
          aria-hidden
        />
      </div>
      {caption ? (
        <figcaption className="mt-3 text-sm text-ink-500">{caption}</figcaption>
      ) : null}
    </figure>
  );
}
