import { cn } from "@/lib/cn";
import Link from "next/link";
import type { ReactNode } from "react";

export type RecordField = {
  label: string;
  value: ReactNode;
};

/**
 * Mobile-first card for dense admin/member records.
 * Prefer this under `md` instead of forcing horizontal table scroll.
 */
export function RecordCard({
  title,
  subtitle,
  badge,
  fields,
  actions,
  href,
  className,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  badge?: ReactNode;
  fields?: RecordField[];
  actions?: ReactNode;
  href?: string;
  className?: string;
}) {
  const heading = (
    <div className="min-w-0 flex-1">
      {href ? (
        <Link
          href={href}
          className="block truncate font-medium text-ink-900 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {title}
        </Link>
      ) : (
        <p className="truncate font-medium text-ink-900">{title}</p>
      )}
      {subtitle ? (
        <p className="mt-0.5 break-words text-xs text-ink-500">{subtitle}</p>
      ) : null}
    </div>
  );

  return (
    <article
      className={cn(
        "rounded-xl border border-border-subtle bg-surface-raised p-4 shadow-xs",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        {heading}
        {badge ? <div className="shrink-0">{badge}</div> : null}
      </div>

      {fields && fields.length > 0 ? (
        <dl className="mt-3 grid gap-2 border-t border-border-subtle pt-3 text-sm">
          {fields.map((field) => (
            <div
              key={field.label}
              className="grid grid-cols-[minmax(0,7.5rem)_1fr] gap-2"
            >
              <dt className="text-xs font-medium uppercase tracking-wide text-ink-500">
                {field.label}
              </dt>
              <dd className="min-w-0 break-words text-ink-800">{field.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}

      {actions ? (
        <div className="mt-3 flex flex-wrap gap-2 border-t border-border-subtle pt-3">
          {actions}
        </div>
      ) : null}
    </article>
  );
}

/** Show card stack on small screens; table (or other) from `md` up. */
export function ResponsiveRecords({
  mobile,
  desktop,
  className,
}: {
  mobile: ReactNode;
  desktop: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="space-y-3 md:hidden">{mobile}</div>
      <div className="hidden md:block">{desktop}</div>
    </div>
  );
}

export function EmptyRecords({ message }: { message: string }) {
  return (
    <p className="rounded-xl border border-dashed border-border-strong bg-surface-muted px-4 py-6 text-sm text-ink-500">
      {message}
    </p>
  );
}
