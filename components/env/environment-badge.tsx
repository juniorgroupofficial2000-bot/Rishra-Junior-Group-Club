import {
  environmentBadgeLabel,
  showsEnvironmentIndicator,
  type AppEnv,
} from "@/config/app-env";
import { cn } from "@/lib/cn";

/**
 * Subtle non-production environment indicator.
 * Renders nothing when APP_ENV=production.
 */
export function EnvironmentBadge({
  appEnv,
  className,
  compact = false,
}: {
  appEnv: AppEnv;
  className?: string;
  /** When true, show only the env word (for tight headers). */
  compact?: boolean;
}) {
  if (!showsEnvironmentIndicator(appEnv)) return null;
  const label = environmentBadgeLabel(appEnv);
  if (!label) return null;

  const tone =
    appEnv === "staging"
      ? "border-warning-200 bg-warning-100/90 text-warning-700"
      : appEnv === "development"
        ? "border-alta-200 bg-alta-100/90 text-alta-700"
        : "border-border-default bg-ink-100/90 text-ink-700";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em]",
        tone,
        className,
      )}
      title={`${label} environment — not production`}
    >
      {compact ? label : label}
    </span>
  );
}

/** Thin top ribbon for public/member shells — never in production. */
export function EnvironmentRibbon({
  appEnv,
  brandName,
}: {
  appEnv: AppEnv;
  brandName?: string;
}) {
  if (!showsEnvironmentIndicator(appEnv)) return null;
  const label = environmentBadgeLabel(appEnv);
  if (!label) return null;

  return (
    <div
      role="status"
      aria-label={`${label} environment`}
      className={cn(
        "border-b text-center text-[11px] font-medium uppercase tracking-[0.16em]",
        appEnv === "staging"
          ? "border-warning-200/80 bg-warning-100/70 text-warning-700"
          : appEnv === "development"
            ? "border-alta-200/80 bg-alta-100/70 text-alta-700"
            : "border-border-subtle bg-ink-100/80 text-ink-600",
      )}
    >
      <div className="mx-auto max-w-7xl px-4 py-1 sm:px-6">
        {brandName ? `${label} · ${brandName}` : label}
      </div>
    </div>
  );
}
