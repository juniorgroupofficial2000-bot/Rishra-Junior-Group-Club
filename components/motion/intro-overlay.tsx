"use client";

import { siteConfig } from "@/content/site";
import { useIsMobileViewport } from "@/lib/hooks/use-media-query";
import { premiumEase } from "@/lib/motion";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { usePathname } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";

export const INTRO_DONE_EVENT = "rjgc-intro-done";
const STORAGE_KEY = "rjgc-intro-seen";

function subscribeIntroSeen(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(INTRO_DONE_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(INTRO_DONE_EVENT, onStoreChange);
  };
}

function getIntroSeenSnapshot() {
  try {
    return sessionStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

/**
 * Short cinematic intro on first homepage visit per session (~1.6s).
 * Skipped under reduced motion, on mobile/narrow viewports, and interior routes.
 */
export function IntroOverlay() {
  const pathname = usePathname();
  const reduce = Boolean(useReducedMotion());
  const isMobile = useIsMobileViewport();
  const alreadySeen = useSyncExternalStore(
    subscribeIntroSeen,
    getIntroSeenSnapshot,
    () => false,
  );
  const shouldPlay =
    pathname === "/" && !reduce && !isMobile && !alreadySeen;
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!shouldPlay) {
      window.dispatchEvent(new Event(INTRO_DONE_EVENT));
      return;
    }

    const show = window.setTimeout(() => setVisible(true), 16);
    const hide = window.setTimeout(() => {
      setVisible(false);
      try {
        sessionStorage.setItem(STORAGE_KEY, "1");
      } catch {
        /* ignore */
      }
      window.dispatchEvent(new Event(INTRO_DONE_EVENT));
    }, 1550);

    return () => {
      window.clearTimeout(show);
      window.clearTimeout(hide);
    };
  }, [shouldPlay]);

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          key="intro"
          className="fixed inset-0 z-[var(--z-modal)] flex items-center justify-center bg-ink-950"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: premiumEase }}
          aria-hidden
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-b from-ink-950 via-[#1a1510] to-ink-950"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25 }}
          />
          <motion.div
            className="relative px-6 text-center"
            initial={{ opacity: 0, scale: 0.82, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: -20 }}
            transition={{ duration: 0.85, ease: premiumEase }}
          >
            <p className="font-display text-3xl font-semibold tracking-[0.28em] text-marigold-400 sm:text-4xl">
              RJGC
            </p>
            <motion.div
              className="mx-auto mt-4 h-px w-16 origin-center bg-gradient-to-r from-transparent via-marigold-400 to-transparent"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.6, delay: 0.25, ease: premiumEase }}
            />
            <p className="mt-4 font-display text-lg text-white/90 sm:text-xl">
              {siteConfig.shortName}
            </p>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
