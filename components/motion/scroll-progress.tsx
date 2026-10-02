"use client";

import { motion, useReducedMotion, useScroll, useSpring } from "motion/react";

/** Top-of-viewport scroll progress — thin but clearly visible. */
export function ScrollProgress() {
  const reduce = Boolean(useReducedMotion());
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 26,
    restDelta: 0.001,
  });

  if (reduce) return null;

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[3px] origin-left bg-gradient-to-r from-alta-500 via-marigold-400 to-lotus-500"
      style={{ scaleX }}
    />
  );
}
