"use client";

import { transitionNormal } from "@/lib/motion";
import { motion, useReducedMotion } from "motion/react";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/**
 * Subtle route enter animation. Disabled under prefers-reduced-motion.
 * Keeps layout stable — opacity + small rise only.
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
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={transitionNormal}
    >
      {children}
    </motion.div>
  );
}
