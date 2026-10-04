"use client";

import { premiumEase } from "@/lib/motion";
import { motion, useReducedMotion } from "motion/react";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/**
 * Lightweight route enter — opacity only (no translate) to avoid CLS.
 * Skips enter animation on first paint via initial={false}.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div className="min-w-0 flex-1">{children}</div>;
  }

  return (
    <motion.div
      key={pathname}
      className="min-w-0 flex-1"
      initial={false}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.28, ease: premiumEase }}
    >
      {children}
    </motion.div>
  );
}
