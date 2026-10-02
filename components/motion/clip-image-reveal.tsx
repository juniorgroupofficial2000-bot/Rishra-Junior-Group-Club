"use client";

import { cn } from "@/lib/cn";
import {
  clipImageScaleVariants,
  clipRevealVariants,
  inViewViewport,
  transitionCinematic,
} from "@/lib/motion";
import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

type ClipImageRevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  /** When false, animate on mount instead of whileInView. */
  inView?: boolean;
};

/**
 * Cinematic image reveal: clip-path wipe + inner image scale settle.
 * Wrap a fill Image (or any media) inside.
 */
export function ClipImageReveal({
  children,
  className,
  delay = 0,
  inView = true,
}: ClipImageRevealProps) {
  const reduce = Boolean(useReducedMotion());

  if (reduce) {
    return <div className={cn("overflow-hidden", className)}>{children}</div>;
  }

  return (
    <motion.div
      className={cn("overflow-hidden will-change-transform", className)}
      variants={clipRevealVariants}
      initial="hidden"
      {...(inView
        ? { whileInView: "visible" as const, viewport: inViewViewport }
        : { animate: "visible" as const })}
      transition={{ ...transitionCinematic, delay, duration: 1.15 }}
    >
      <motion.div
        className="h-full w-full will-change-transform"
        variants={clipImageScaleVariants}
        initial="hidden"
        {...(inView
          ? { whileInView: "visible" as const, viewport: inViewViewport }
          : { animate: "visible" as const })}
        transition={{ ...transitionCinematic, delay: delay + 0.08, duration: 1.25 }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
