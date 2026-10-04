"use client";

import { cn } from "@/lib/cn";
import {
  clipImageScaleVariants,
  clipRevealVariants,
  inViewViewport,
  transitionCinematic,
} from "@/lib/motion";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState, type ReactNode } from "react";

type ClipImageRevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  /** When false, animate on mount instead of whileInView. */
  inView?: boolean;
};

/**
 * Cinematic image reveal: clip-path wipe + inner image scale settle.
 * Failsafe: force visible after a short delay so media never stays blank
 * if IntersectionObserver / smooth-scroll misbehaves.
 */
export function ClipImageReveal({
  children,
  className,
  delay = 0,
  inView = true,
}: ClipImageRevealProps) {
  const reduce = Boolean(useReducedMotion());
  const [forceVisible, setForceVisible] = useState(false);

  useEffect(() => {
    if (reduce || !inView) return;
    const timer = window.setTimeout(() => setForceVisible(true), 1400 + delay * 1000);
    return () => window.clearTimeout(timer);
  }, [reduce, inView, delay]);

  if (reduce) {
    return <div className={cn("overflow-hidden", className)}>{children}</div>;
  }

  const animateProp = forceVisible
    ? ({ animate: "visible" as const })
    : inView
      ? { whileInView: "visible" as const, viewport: inViewViewport }
      : { animate: "visible" as const };

  return (
    <motion.div
      className={cn("overflow-hidden will-change-transform", className)}
      variants={clipRevealVariants}
      initial="hidden"
      {...animateProp}
      transition={{ ...transitionCinematic, delay, duration: 1.15 }}
    >
      <motion.div
        className="h-full w-full will-change-transform"
        variants={clipImageScaleVariants}
        initial="hidden"
        {...animateProp}
        transition={{
          ...transitionCinematic,
          delay: delay + 0.08,
          duration: 1.25,
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
