import type { Transition, Variants } from "motion/react";

/** Premium easing — use for enter/exit, not continuous loops. */
export const premiumEase = [0.22, 1, 0.36, 1] as const;

export const transitionFast: Transition = {
  duration: 0.15,
  ease: premiumEase,
};

export const transitionNormal: Transition = {
  duration: 0.25,
  ease: premiumEase,
};

export const transitionSlow: Transition = {
  duration: 0.4,
  ease: premiumEase,
};

/** Subtle fade + rise for section content. Respect reduced motion via FadeIn. */
export const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

export const fadeVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export const scaleInVariants: Variants = {
  hidden: { opacity: 0, scale: 0.98 },
  visible: { opacity: 1, scale: 1 },
};
