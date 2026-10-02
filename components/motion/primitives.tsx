"use client";

import { cn } from "@/lib/cn";
import {
  fadeUpVariants,
  fadeVariants,
  imageRevealVariants,
  scaleInVariants,
  slideInLeftVariants,
  slideInRightVariants,
  slideUpVariants,
  staggerContainerVariants,
  textRevealVariants,
  transitionNormal,
  transitionSlow,
} from "@/lib/motion";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type Variants,
} from "motion/react";
import { useRef, type ReactNode } from "react";

type MotionTag = "div" | "section" | "li" | "article" | "span" | "header";

type BaseProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: MotionTag;
  once?: boolean;
};

function useMotionSafe() {
  return Boolean(useReducedMotion());
}

function MotionShell({
  children,
  className,
  delay = 0,
  as = "div",
  once = true,
  variants,
  slow = false,
}: BaseProps & { variants: Variants; slow?: boolean }) {
  const reduce = useMotionSafe();
  const Tag = as;

  if (reduce) {
    return <Tag className={className}>{children}</Tag>;
  }

  const Component = motion[as];
  return (
    <Component
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: "-10% 0px -8% 0px" }}
      transition={{ ...(slow ? transitionSlow : transitionNormal), delay }}
    >
      {children}
    </Component>
  );
}

export function FadeIn(props: BaseProps & { slow?: boolean }) {
  return <MotionShell {...props} variants={fadeVariants} />;
}

export function Reveal(props: BaseProps & { slow?: boolean }) {
  return <MotionShell {...props} variants={fadeUpVariants} />;
}

export function SlideUp(props: BaseProps) {
  return <MotionShell {...props} variants={slideUpVariants} slow />;
}

export function SlideIn({
  from = "left",
  ...props
}: BaseProps & { from?: "left" | "right" }) {
  return (
    <MotionShell
      {...props}
      variants={from === "left" ? slideInLeftVariants : slideInRightVariants}
    />
  );
}

export function ScaleIn(props: BaseProps) {
  return <MotionShell {...props} variants={scaleInVariants} />;
}

export function ImageReveal({
  className,
  children,
  delay = 0,
}: {
  className?: string;
  children: ReactNode;
  delay?: number;
}) {
  const reduce = useMotionSafe();
  if (reduce) {
    return <div className={cn("overflow-hidden", className)}>{children}</div>;
  }
  return (
    <motion.div
      className={cn("overflow-hidden", className)}
      variants={imageRevealVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-8%" }}
      transition={{ ...transitionSlow, delay }}
    >
      {children}
    </motion.div>
  );
}

export function TextReveal({
  children,
  className,
  delay = 0,
  as = "div",
}: BaseProps) {
  const reduce = useMotionSafe();
  const Tag = as;
  if (reduce) {
    return <Tag className={className}>{children}</Tag>;
  }
  const Component = motion[as];
  return (
    <Component
      className={cn("overflow-hidden", className)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-8%" }}
    >
      <motion.span
        className="block"
        variants={textRevealVariants}
        transition={{ ...transitionSlow, delay }}
      >
        {children}
      </motion.span>
    </Component>
  );
}

export function StaggerChildren({
  children,
  className,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: MotionTag;
}) {
  const reduce = useMotionSafe();
  const Tag = as;
  if (reduce) {
    return <Tag className={className}>{children}</Tag>;
  }
  const Component = motion[as];
  return (
    <Component
      className={className}
      variants={staggerContainerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-8%" }}
    >
      {children}
    </Component>
  );
}

export function StaggerItem({
  children,
  className,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: MotionTag;
}) {
  const reduce = useMotionSafe();
  const Tag = as;
  if (reduce) {
    return <Tag className={className}>{children}</Tag>;
  }
  const Component = motion[as];
  return (
    <Component
      className={className}
      variants={fadeUpVariants}
      transition={transitionNormal}
    >
      {children}
    </Component>
  );
}

/** Subtle parallax — disabled on reduced motion. */
export function Parallax({
  children,
  className,
  offset = 40,
}: {
  children: ReactNode;
  className?: string;
  offset?: number;
}) {
  const reduce = useMotionSafe();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [-offset, offset]);

  if (reduce) {
    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      ref={ref}
      style={{ y }}
      className={cn("will-change-transform max-md:[transform:none!important]", className)}
    >
      {children}
    </motion.div>
  );
}

/** Back-compat aliases used across the codebase. */
export { FadeIn as FadeInSection };
export const Stagger = StaggerChildren;
