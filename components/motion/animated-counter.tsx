"use client";

import { cn } from "@/lib/cn";
import { animate, useInView, useMotionValue, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";

type AnimatedCounterProps = {
  value: number;
  suffix?: string;
  prefix?: string;
  className?: string;
  durationMs?: number;
};

/** Counts once from 0 → value when entering the viewport. */
export function AnimatedCounter({
  value,
  suffix = "",
  prefix = "",
  className,
  durationMs = 1600,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduce = Boolean(useReducedMotion());
  const count = useMotionValue(value);
  // SSR / no-JS / reduced-motion: show the final value (never flash "0").
  const [display, setDisplay] = useState(value);
  const started = useRef(false);
  const label = `${prefix}${value}${suffix}`;

  useEffect(() => {
    const unsub = count.on("change", (latest) => {
      setDisplay(Math.round(latest));
    });
    return unsub;
  }, [count]);

  useEffect(() => {
    if (!inView || started.current) return;
    started.current = true;

    if (reduce) {
      count.set(value);
      return;
    }

    count.set(0);
    const controls = animate(count, value, {
      duration: durationMs / 1000,
      ease: [0.22, 1, 0.36, 1],
    });
    return () => controls.stop();
  }, [inView, reduce, value, durationMs, count]);

  return (
    <span
      ref={ref}
      className={cn("tabular-nums", className)}
      aria-label={label}
    >
      <span aria-hidden="true">
        {prefix}
        {display}
        {suffix}
      </span>
    </span>
  );
}
