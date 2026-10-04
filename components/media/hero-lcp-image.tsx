import type { SiteMediaSlot } from "@/content/site-media";
import Image from "next/image";

type HeroLcpImageProps = {
  media: Pick<
    SiteMediaSlot,
    "src" | "srcMobile" | "alt" | "objectPosition" | "width" | "height"
  >;
  className?: string;
};

/**
 * LCP-oriented hero image: eager decode, high fetch priority, responsive
 * `sizes`, and mobile source when available. Keeps the image painted even
 * while surrounding motion chrome animates.
 */
export function HeroLcpImage({ media, className }: HeroLcpImageProps) {
  const isSvg = media.src.endsWith(".svg");
  const mobileSrc = media.srcMobile && media.srcMobile !== media.src
    ? media.srcMobile
    : null;

  return (
    <picture>
      {mobileSrc ? (
        <source media="(max-width: 768px)" srcSet={mobileSrc} />
      ) : null}
      <Image
        src={media.src}
        alt={media.alt}
        fill
        priority
        fetchPriority="high"
        sizes="100vw"
        quality={isSvg ? undefined : 80}
        unoptimized={isSvg}
        decoding="async"
        className={className ?? "object-cover"}
        style={{ objectPosition: media.objectPosition }}
      />
    </picture>
  );
}
