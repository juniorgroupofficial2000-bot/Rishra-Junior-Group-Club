"use client";

import { usePrefersStaticMotion } from "@/lib/hooks/use-media-query";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Production-safe Lenis smooth scrolling for the public site.
 * Disabled when the user prefers reduced motion, on coarse pointers,
 * or when static motion is preferred for mobile stability.
 */
export function SmoothScroll() {
  const pathname = usePathname();
  const staticMotion = usePrefersStaticMotion();

  useEffect(() => {
    if (staticMotion) return;
    if (typeof window === "undefined") return;

    let raf = 0;
    let lenis: { raf: (time: number) => void; destroy: () => void } | null =
      null;
    let cancelled = false;

    void import("lenis").then(({ default: Lenis }) => {
      if (cancelled) return;

      const instance = new Lenis({
        duration: 1.05,
        smoothWheel: true,
        touchMultiplier: 1.1,
        // Avoid fighting native anchors / focus scrolls awkwardly.
        anchors: false,
      });
      lenis = instance;

      const tick = (time: number) => {
        instance.raf(time);
        raf = window.requestAnimationFrame(tick);
      };
      raf = window.requestAnimationFrame(tick);
    });

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(raf);
      lenis?.destroy();
      lenis = null;
    };
  }, [staticMotion, pathname]);

  return null;
}
