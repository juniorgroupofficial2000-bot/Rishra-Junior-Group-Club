import { cn } from "@/lib/cn";
import type { HTMLAttributes } from "react";

const variants = {
  neutral: "bg-ink-100 text-ink-800",
  accent: "bg-alta-100 text-alta-700",
  heritage: "bg-marigold-100 text-marigold-700",
  success: "bg-success-100 text-success-600",
  warning: "bg-warning-100 text-warning-600",
  danger: "bg-danger-100 text-danger-600",
  outline: "border border-border-default bg-transparent text-ink-700",
} as const;

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: keyof typeof variants;
};

export function Badge({
  className,
  variant = "neutral",
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-sm px-2 py-0.5 text-xs font-medium tracking-wide",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
