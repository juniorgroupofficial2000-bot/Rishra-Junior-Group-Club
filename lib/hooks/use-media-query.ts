"use client";

import { useSyncExternalStore } from "react";

function subscribe(query: string, onStoreChange: () => void) {
  const media = window.matchMedia(query);
  media.addEventListener("change", onStoreChange);
  return () => media.removeEventListener("change", onStoreChange);
}

/**
 * SSR-safe media query. `serverSnapshot` defaults to `true` so first paint
 * prefers the mobile-friendly branch (no parallax, no hover-only chrome).
 */
export function useMediaQuery(query: string, serverSnapshot = true): boolean {
  return useSyncExternalStore(
    (onStoreChange) => subscribe(query, onStoreChange),
    () => window.matchMedia(query).matches,
    () => serverSnapshot,
  );
}

/** True when viewport is below Tailwind `md` (768px). */
export function useIsMobileViewport() {
  return useMediaQuery("(max-width: 767px)", true);
}

/** True for touch / coarse pointers — skip expensive scroll-linked motion. */
export function usePrefersStaticMotion() {
  const reduce = useMediaQuery("(prefers-reduced-motion: reduce)", false);
  const coarse = useMediaQuery("(pointer: coarse)", true);
  const narrow = useIsMobileViewport();
  return reduce || coarse || narrow;
}
