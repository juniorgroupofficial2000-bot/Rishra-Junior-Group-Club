"use client";

import { cn } from "@/lib/cn";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState, useSyncExternalStore } from "react";

function subscribeFinePointer(onStoreChange: () => void) {
  const fine = window.matchMedia("(pointer: fine)");
  const hover = window.matchMedia("(hover: hover)");
  fine.addEventListener("change", onStoreChange);
  hover.addEventListener("change", onStoreChange);
  return () => {
    fine.removeEventListener("change", onStoreChange);
    hover.removeEventListener("change", onStoreChange);
  };
}

function getFinePointerSnapshot() {
  return (
    window.matchMedia("(pointer: fine)").matches &&
    window.matchMedia("(hover: hover)").matches
  );
}

/**
 * Desktop-only soft cursor label for interactive media.
 * Disabled on touch / coarse pointers and reduced motion.
 */
export function CursorHintProvider({ children }: { children: React.ReactNode }) {
  const reduce = Boolean(useReducedMotion());
  const finePointer = useSyncExternalStore(
    subscribeFinePointer,
    getFinePointerSnapshot,
    () => false,
  );
  const enabled = finePointer && !reduce;
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const onMove = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY });
    const onOver = (e: MouseEvent) => {
      const target = (e.target as HTMLElement | null)?.closest?.(
        "[data-cursor-label]",
      ) as HTMLElement | null;
      setLabel(target?.dataset.cursorLabel ?? null);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseover", onOver, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
    };
  }, [enabled]);

  return (
    <>
      {children}
      {enabled && label ? (
        <motion.div
          aria-hidden
          className={cn(
            "pointer-events-none fixed z-[var(--z-modal)] hidden md:flex",
            "h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center",
            "rounded-full border border-white/40 bg-ink-950/70 text-[0.65rem] font-semibold tracking-[0.14em] text-white backdrop-blur-sm",
          )}
          style={{ left: pos.x, top: pos.y }}
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.18 }}
        >
          {label}
        </motion.div>
      ) : null}
    </>
  );
}
