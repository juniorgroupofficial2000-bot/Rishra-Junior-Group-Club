import type { Transition, Variants } from "motion/react";

/** Premium easing — enter/exit only, never for continuous loops. */
export const premiumEase = [0.22, 1, 0.36, 1] as const;

export const transitionFast: Transition = {
  duration: 0.18,
  ease: premiumEase,
};

export const transitionNormal: Transition = {
  duration: 0.32,
  ease: premiumEase,
};

export const transitionSlow: Transition = {
  duration: 0.55,
  ease: premiumEase,
};

export const transitionCinematic: Transition = {
  duration: 0.85,
  ease: premiumEase,
};

export const fadeVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0 },
};

export const slideUpVariants: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
};

export const slideInLeftVariants: Variants = {
  hidden: { opacity: 0, x: -24 },
  visible: { opacity: 1, x: 0 },
};

export const slideInRightVariants: Variants = {
  hidden: { opacity: 0, x: 24 },
  visible: { opacity: 1, x: 0 },
};

export const scaleInVariants: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1 },
};

export const imageRevealVariants: Variants = {
  hidden: { opacity: 0, scale: 1.06 },
  visible: { opacity: 1, scale: 1 },
};

export const textRevealVariants: Variants = {
  hidden: { opacity: 0, y: "0.55em" },
  visible: { opacity: 1, y: "0em" },
};

export const staggerContainerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.04 },
  },
};

export const heroStaggerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.15 },
  },
};
