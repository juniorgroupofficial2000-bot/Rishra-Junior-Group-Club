import { cn } from "@/lib/cn";
import Link from "next/link";
import type { ReactNode } from "react";

type EmptyAction = {
  label: string;
  href: string;
};

/**
 * Calm empty state for catalog pages and portal lists.
 * Never invent placeholder statistics or fake records here.
 */
export function EmptyState({
  title,
  description,
  action,
  secondaryAction,
  className,
  children,
}: {
  title: string;
  description?: string;
  action?: EmptyAction;
  secondaryAction?: EmptyAction;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div
      role="status"
      className={cn(
        "rounded-2xl border border-dashed border-border-strong bg-surface-muted/40 px-6 py-12 text-center sm:px-10 sm:py-16",
        className,
      )}
    >
      <h2 className="font-display text-xl font-semibold tracking-tight text-ink-900 sm:text-2xl">
        {title}
      </h2>
      {description ? (
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink-500 sm:text-base">
          {description}
        </p>
      ) : null}
      {children}
      {action || secondaryAction ? (
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          {action ? (
            <Link
              href={action.href}
              className="inline-flex min-h-11 items-center justify-center rounded-md bg-ink-900 px-5 text-sm font-medium text-white transition-colors hover:bg-ink-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {action.label}
            </Link>
          ) : null}
          {secondaryAction ? (
            <Link
              href={secondaryAction.href}
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-border-default px-5 text-sm font-medium text-ink-800 transition-colors hover:bg-ink-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {secondaryAction.label}
            </Link>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
