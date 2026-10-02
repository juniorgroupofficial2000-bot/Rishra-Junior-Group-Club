import { cn } from "@/lib/cn";
import Link from "next/link";
import type { HomeCta } from "@/content/home";

const styles = {
  primary: "bg-alta-500 text-white hover:bg-alta-600 shadow-sm",
  secondary: "border border-current/30 bg-transparent hover:bg-white/10",
  ghost: "bg-transparent underline-offset-4 hover:underline px-0",
  outline:
    "border border-border-default bg-transparent text-ink-900 hover:bg-ink-50 hover:border-ink-300",
  solid: "bg-ink-900 text-white hover:bg-ink-800 shadow-sm",
} as const;

type HomeLinkProps = HomeCta & {
  className?: string;
  appearance?: keyof typeof styles;
};

export function HomeLink({
  href,
  label,
  variant = "primary",
  appearance,
  className,
}: HomeLinkProps) {
  const resolved =
    appearance ??
    (variant === "primary"
      ? "primary"
      : variant === "secondary"
        ? "secondary"
        : "ghost");

  const showArrow = resolved === "primary" || resolved === "solid";

  return (
    <Link
      href={href}
      className={cn(
        "inline-flex min-h-12 items-center justify-center gap-2 rounded-md px-5 type-button transition-[transform,background-color,border-color,box-shadow] duration-300",
        "hover:-translate-y-0.5",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        styles[resolved],
        className,
      )}
    >
      {label}
      {showArrow ? (
        <span
          aria-hidden
          className="inline-block transition-transform duration-300 group-hover:translate-x-1"
        >
          →
        </span>
      ) : null}
    </Link>
  );
}
