import type { Transition, Variants } from "motion/react";

/** Premium easing — enter/exit only, never for continuous loops. */
export const premiumEase = [0.22, 1, 0.36, 1] as const;

export const transitionFast: Transition = {
  duration: 0.22,
  ease: premiumEase,
};

export const transitionNormal: Transition = {
  duration: 0.55,
  ease: premiumEase,
};

export const transitionSlow: Transition = {
  duration: 0.85,
  ease: premiumEase,
};

export const transitionCinematic: Transition = {
  duration: 1.2,
  ease: premiumEase,
};

export const fadeVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 56 },
  visible: { opacity: 1, y: 0 },
};

export const slideUpVariants: Variants = {
  hidden: { opacity: 0, y: 72 },
  visible: { opacity: 1, y: 0 },
};

export const slideInLeftVariants: Variants = {
  hidden: { opacity: 0, x: -72 },
  visible: { opacity: 1, x: 0 },
};

export const slideInRightVariants: Variants = {
  hidden: { opacity: 0, x: 72 },
  visible: { opacity: 1, x: 0 },
};

export const scaleInVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1 },
};

export const imageRevealVariants: Variants = {
  hidden: { opacity: 0, scale: 1.14 },
  visible: { opacity: 1, scale: 1 },
};

/** Clip-path wipe for cinematic image containers. */
export const clipRevealVariants: Variants = {
  hidden: {
    clipPath: "inset(0 100% 0 0)",
    opacity: 0.35,
  },
  visible: {
    clipPath: "inset(0 0% 0 0)",
    opacity: 1,
  },
};

export const clipImageScaleVariants: Variants = {
  hidden: { scale: 1.16, opacity: 0.55 },
  visible: { scale: 1, opacity: 1 },
};

export const textRevealVariants: Variants = {
  hidden: { opacity: 0, y: "0.85em" },
  visible: { opacity: 1, y: "0em" },
};

export const lineRevealVariants: Variants = {
  hidden: { opacity: 0, y: 64 },
  visible: { opacity: 1, y: 0 },
};

export const cardRevealVariants: Variants = {
  hidden: { opacity: 0, y: 56, scale: 0.94 },
  visible: { opacity: 1, y: 0, scale: 1 },
};

export const staggerContainerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.14, delayChildren: 0.08 },
  },
};

export const heroStaggerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.14, delayChildren: 0.12 },
  },
};

export const navItemVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
};

/** Shared viewport so section entrances fire when content is clearly on screen. */
export const inViewViewport = {
  once: true,
  amount: 0.28,
  margin: "0px 0px -12% 0px",
} as const;
