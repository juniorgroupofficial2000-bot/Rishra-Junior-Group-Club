"use client";

import { usePrefersStaticMotion } from "@/lib/hooks/use-media-query";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Production-safe Lenis smooth scrolling for the public site.
 * Disabled when the user prefers reduced motion, on coarse pointers,
 * or when static motion is preferred for mobile stability.
 *
 * Imports Lenis CSS so document height stays auto (viewport-locked html
 * height otherwise traps scroll mid-page).
 */
export function SmoothScroll() {
  const pathname = usePathname();
  const staticMotion = usePrefersStaticMotion();

  useEffect(() => {
    if (staticMotion) return;
    if (typeof window === "undefined") return;

    let cancelled = false;
    let lenis: {
      raf: (time: number) => void;
      resize: () => void;
      destroy: () => void;
    } | null = null;
    let raf = 0;
    let resizeObserver: ResizeObserver | null = null;
    const timers: number[] = [];

    const refresh = () => {
      lenis?.resize();
    };

    void Promise.all([import("lenis"), import("lenis/dist/lenis.css")]).then(
      ([{ default: Lenis }]) => {
        if (cancelled) return;

        const instance = new Lenis({
          duration: 1.05,
          smoothWheel: true,
          touchMultiplier: 1.1,
          anchors: false,
          autoRaf: false,
        });
        lenis = instance;

        const tick = (time: number) => {
          instance.raf(time);
          raf = window.requestAnimationFrame(tick);
        };
        raf = window.requestAnimationFrame(tick);

        window.addEventListener("load", refresh);
        window.addEventListener("resize", refresh);
        resizeObserver = new ResizeObserver(() => refresh());
        resizeObserver.observe(document.documentElement);
        timers.push(
          window.setTimeout(refresh, 250),
          window.setTimeout(refresh, 1000),
          window.setTimeout(refresh, 2500),
        );
      },
    );

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(raf);
      window.removeEventListener("load", refresh);
      window.removeEventListener("resize", refresh);
      resizeObserver?.disconnect();
      for (const id of timers) window.clearTimeout(id);
      lenis?.destroy();
      lenis = null;
    };
  }, [staticMotion, pathname]);

  return null;
}
