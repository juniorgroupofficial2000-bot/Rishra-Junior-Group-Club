import { cn } from "@/lib/cn";
import type { HTMLAttributes, ReactNode } from "react";

export type StatTileProps = {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  className?: string;
};

/** Dense metric tile for admin/member dashboards — not for public marketing heroes. */
export function StatTile({ label, value, hint, className }: StatTileProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border-subtle bg-surface-raised p-5 shadow-xs",
        className,
      )}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-500">
        {label}
      </p>
      <p className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink-900">
        {value}
      </p>
      {hint ? <p className="mt-1 text-sm text-ink-500">{hint}</p> : null}
    </div>
  );
}

export function DashboardShell({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "min-h-dvh bg-surface-canvas bg-heritage-grain",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function DashboardHeader({
  title,
  description,
  actions,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "flex flex-col gap-4 border-b border-border-subtle bg-surface-raised/90 px-4 py-5 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8",
        className,
      )}
    >
      <div className="min-w-0 space-y-1">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-ink-900 sm:text-3xl">
          {title}
        </h1>
        {description ? (
          <p className="text-sm text-ink-500">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </header>
  );
}

export function DashboardGrid({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "grid gap-4 sm:grid-cols-2 xl:grid-cols-4",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function DashboardPanel({
  title,
  description,
  actions,
  children,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-xl border border-border-subtle bg-surface-raised shadow-xs",
        className,
      )}
    >
      <div className="flex flex-col gap-3 border-b border-border-subtle px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <h2 className="font-display text-lg font-semibold text-ink-900">
            {title}
          </h2>
          {description ? (
            <p className="mt-0.5 text-sm text-ink-500">{description}</p>
          ) : null}
        </div>
        {actions}
      </div>
      <div className="p-5 sm:p-6">{children}</div>
    </section>
  );
}
