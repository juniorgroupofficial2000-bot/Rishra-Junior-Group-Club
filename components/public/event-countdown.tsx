"use client";

import { computeLiveStatus, liveStatusLabel } from "@/lib/puja/status";
import { cn } from "@/lib/cn";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Unit = { label: string; value: number };

function splitRemaining(ms: number): Unit[] {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [
    { label: "Days", value: days },
    { label: "Hours", value: hours },
    { label: "Minutes", value: minutes },
    { label: "Seconds", value: seconds },
  ];
}

export function EventCountdown({
  title,
  href,
  startsAt,
  endsAt,
  className,
  compact = false,
  nextEventLabel = false,
}: {
  title: string;
  href: string;
  startsAt: string;
  endsAt?: string | null;
  className?: string;
  compact?: boolean;
  /** When true, show “Next Event — {title}” while upcoming. */
  nextEventLabel?: boolean;
}) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const status = useMemo(
    () => computeLiveStatus(startsAt, endsAt, new Date(now)),
    [startsAt, endsAt, now],
  );

  const remainingMs = new Date(startsAt).getTime() - now;
  const units = splitRemaining(remainingMs);
  const label =
    status === "live"
      ? "Live Now"
      : status === "completed"
        ? "Completed"
        : status === "today"
          ? "Today"
          : "Upcoming";

  const displayTitle =
    nextEventLabel && (status === "upcoming" || status === "today")
      ? `Next Event — ${title}`
      : title;

  return (
    <div
      className={cn(
        "rounded-xl border border-border-subtle bg-surface-raised/95",
        compact ? "px-3 py-2.5" : "px-4 py-4 sm:px-5",
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-400">
            {label}
          </p>
          <Link
            href={href}
            className="mt-0.5 block truncate font-medium text-ink-900 underline-offset-4 hover:underline"
          >
            {displayTitle}
          </Link>
        </div>
        {status ? (
          <span
            className={cn(
              "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide",
              status === "live"
                ? "border-alta-200 bg-alta-50 text-alta-700"
                : status === "completed"
                  ? "border-lotus-100 bg-lotus-50 text-lotus-700"
                  : "border-ink-200 bg-ink-50 text-ink-700",
            )}
          >
            {status === "live" ? "Live Now" : liveStatusLabel(status)}
          </span>
        ) : null}
      </div>

      {status === "upcoming" || status === "today" ? (
        <dl
          className={cn(
            "mt-3 grid grid-cols-4 gap-2",
            compact ? "text-center" : "",
          )}
        >
          {units.map((unit) => (
            <div
              key={unit.label}
              className="rounded-lg bg-ink-50 px-1.5 py-2 sm:px-2"
            >
              <dt className="text-[10px] uppercase tracking-wide text-ink-400">
                {unit.label}
              </dt>
              <dd className="font-mono text-base font-semibold tabular-nums text-ink-900 sm:text-lg">
                {String(unit.value).padStart(2, "0")}
              </dd>
            </div>
          ))}
        </dl>
      ) : null}
    </div>
  );
}
