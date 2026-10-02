import { cn } from "@/lib/cn";
import type { ButtonHTMLAttributes, ReactNode } from "react";

const variants = {
  primary:
    "bg-ink-900 text-white hover:bg-ink-800 active:bg-ink-950 shadow-xs",
  secondary:
    "bg-secondary text-secondary-foreground hover:bg-ink-200 active:bg-ink-300",
  accent:
    "bg-alta-500 text-white hover:bg-alta-600 active:bg-alta-700 shadow-xs",
  outline:
    "border border-border-default bg-transparent text-ink-900 hover:bg-ink-50 active:bg-ink-100",
  ghost: "bg-transparent text-ink-800 hover:bg-ink-50 active:bg-ink-100",
  link: "bg-transparent text-ink-800 underline-offset-4 hover:underline px-0 h-auto",
} as const;

const sizes = {
  sm: "h-9 px-3 text-sm gap-1.5 rounded-md",
  md: "h-11 px-4 text-sm gap-2 rounded-md",
  lg: "h-12 px-5 text-base gap-2 rounded-lg",
  icon: "h-11 w-11 rounded-md",
} as const;

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  leftIcon,
  rightIcon,
  children,
  type = "button",
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center font-medium tracking-wide transition-[background-color,color,box-shadow,transform] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface-canvas",
        "disabled:pointer-events-none disabled:opacity-45",
        "active:translate-y-px",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {leftIcon ? <span className="shrink-0">{leftIcon}</span> : null}
      {children}
      {rightIcon ? <span className="shrink-0">{rightIcon}</span> : null}
    </button>
  );
}
