"use client";

import type { SiteMediaSlot } from "@/content/site-media";
import { usePrefersStaticMotion } from "@/lib/hooks/use-media-query";
import { cn } from "@/lib/cn";
import Image from "next/image";
import { useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";

type HeroLcpImageProps = {
  media: Pick<
    SiteMediaSlot,
    | "src"
    | "srcMobile"
    | "videoSrc"
    | "alt"
    | "objectPosition"
    | "width"
    | "height"
  >;
  className?: string;
};

/**
 * LCP-oriented hero media: still image paints immediately for LCP.
 * Optional muted looping video fades in when motion is allowed.
 */
export function HeroLcpImage({ media, className }: HeroLcpImageProps) {
  const isSvg = media.src.endsWith(".svg");
  const mobileSrc =
    media.srcMobile && media.srcMobile !== media.src ? media.srcMobile : null;
  const reduceMotion = useReducedMotion();
  const prefersStatic = usePrefersStaticMotion();
  const allowVideo = Boolean(media.videoSrc) && !reduceMotion && !prefersStatic;
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoReady, setVideoReady] = useState(false);

  useEffect(() => {
    if (!allowVideo) {
      setVideoReady(false);
      return;
    }
    const el = videoRef.current;
    if (!el) return;

    const markReady = () => setVideoReady(true);
    if (el.readyState >= 2) markReady();
    el.addEventListener("loadeddata", markReady);
    el.addEventListener("canplay", markReady);

    const play = () => {
      void el.play().catch(() => {
        /* Autoplay may be blocked; poster image remains. */
      });
    };
    play();

    return () => {
      el.removeEventListener("loadeddata", markReady);
      el.removeEventListener("canplay", markReady);
    };
  }, [allowVideo, media.videoSrc]);

  return (
    <div className="absolute inset-0">
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
          className={cn("object-cover", className)}
          style={{ objectPosition: media.objectPosition }}
        />
      </picture>

      {allowVideo ? (
        <video
          ref={videoRef}
          className={cn(
            "absolute inset-0 h-full w-full object-cover transition-opacity duration-700",
            videoReady ? "opacity-100" : "opacity-0",
            className,
          )}
          style={{ objectPosition: media.objectPosition }}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={media.src}
          aria-hidden
          tabIndex={-1}
        >
          <source src={media.videoSrc} type="video/mp4" />
        </video>
      ) : null}
    </div>
  );
}
