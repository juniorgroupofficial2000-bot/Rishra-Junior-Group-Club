"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";

/**
 * Deferred public chrome that is not required for first paint / LCP.
 * Children render immediately; overlays hydrate after the critical path.
 */
const IntroOverlay = dynamic(
  () =>
    import("@/components/motion/intro-overlay").then((m) => m.IntroOverlay),
  { ssr: false },
);

const ScrollProgress = dynamic(
  () =>
    import("@/components/motion/scroll-progress").then((m) => m.ScrollProgress),
  { ssr: false },
);

const SmoothScroll = dynamic(
  () =>
    import("@/components/motion/smooth-scroll").then((m) => m.SmoothScroll),
  { ssr: false },
);

const CursorHintProvider = dynamic(
  () =>
    import("@/components/motion/cursor-hint").then((m) => m.CursorHintProvider),
  { ssr: false },
);

export function PublicMotionChrome({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <SmoothScroll />
      <ScrollProgress />
      <IntroOverlay />
      <CursorHintProvider>{null}</CursorHintProvider>
    </>
  );
}
