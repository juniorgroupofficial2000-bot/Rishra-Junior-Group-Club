"use client";

import { cn } from "@/lib/cn";
import {
  cardRevealVariants,
  fadeUpVariants,
  fadeVariants,
  inViewViewport,
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
import { ClipImageReveal } from "./clip-image-reveal";

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
      viewport={{ ...inViewViewport, once }}
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
  return <MotionShell {...props} variants={fadeUpVariants} slow />;
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
      slow
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
  inView = true,
}: {
  className?: string;
  children: ReactNode;
  delay?: number;
  inView?: boolean;
}) {
  return (
    <ClipImageReveal className={className} delay={delay} inView={inView}>
      {children}
    </ClipImageReveal>
  );
}

/** Alternate card entrance: left / right by index. */
export function AlternatingReveal({
  index,
  children,
  className,
  as = "div",
}: BaseProps & { index: number }) {
  const reduce = useMotionSafe();
  const Tag = as;
  const variants = index % 2 === 0 ? slideInLeftVariants : slideInRightVariants;
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
      viewport={inViewViewport}
      transition={{ ...transitionSlow, delay: index * 0.06 }}
    >
      {children}
    </Component>
  );
}

export function CardReveal(props: BaseProps & { slow?: boolean }) {
  return <MotionShell {...props} variants={cardRevealVariants} slow />;
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
      viewport={inViewViewport}
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
      viewport={inViewViewport}
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
      transition={transitionSlow}
    >
      {children}
    </Component>
  );
}

/** Subtle parallax — disabled on reduced motion. */
export function Parallax({
  children,
  className,
  offset = 56,
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

/** Animated underline that grows when the section enters view. */
export function OrnamentLine({ className }: { className?: string }) {
  const reduce = useMotionSafe();
  if (reduce) {
    return (
      <div
        className={cn("h-px w-16 bg-gradient-to-r from-alta-500 to-marigold-400", className)}
        aria-hidden
      />
    );
  }
  return (
    <motion.div
      className={cn(
        "h-px origin-left bg-gradient-to-r from-alta-500 to-marigold-400",
        className,
      )}
      initial={{ scaleX: 0, opacity: 0 }}
      whileInView={{ scaleX: 1, opacity: 1 }}
      viewport={inViewViewport}
      transition={transitionSlow}
      aria-hidden
    />
  );
}

/** Back-compat aliases used across the codebase. */
export { FadeIn as FadeInSection };
export const Stagger = StaggerChildren;
