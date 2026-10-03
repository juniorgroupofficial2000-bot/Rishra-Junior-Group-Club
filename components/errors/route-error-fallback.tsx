"use client";

import { Button } from "@/components/ui/button";
import { reportClientError } from "@/lib/observability/client-report";
import Link from "next/link";
import { useEffect } from "react";

export type RouteErrorProps = {
  error: Error & { digest?: string };
  /** Next.js 16 preferred recovery. */
  retry?: () => void;
  /** Legacy prop still supplied by some runtimes. */
  reset?: () => void;
};

type Portal = "public" | "member" | "admin" | "root";

type RouteErrorFallbackProps = RouteErrorProps & {
  portal: Portal;
  title: string;
  description: string;
  homeHref?: string;
  homeLabel?: string;
};

export function RouteErrorFallback({
  error,
  retry,
  reset,
  portal,
  title,
  description,
  homeHref = "/",
  homeLabel = "Go home",
}: RouteErrorFallbackProps) {
  const recover = retry ?? reset;

  useEffect(() => {
    reportClientError(error, {
      event: "route_error_boundary",
      portal,
    });
  }, [error, portal]);

  return (
    <div className="space-y-4">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-alta-600">
        Something went wrong
      </p>
      <h1 className="font-display text-2xl font-semibold tracking-tight text-ink-900 sm:text-3xl">
        {title}
      </h1>
      <p className="max-w-prose text-sm text-ink-500 sm:text-base">{description}</p>
      <div className="flex flex-wrap gap-3 pt-2">
        {recover ? (
          <Button type="button" onClick={() => recover()}>
            Try again
          </Button>
        ) : null}
        <Link
          href={homeHref}
          className="inline-flex h-11 items-center justify-center rounded-md border border-border-default px-4 text-sm font-medium text-ink-900 transition-colors hover:bg-ink-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          {homeLabel}
        </Link>
      </div>
      {error.digest ? (
        <p className="font-mono text-xs text-ink-400">Ref: {error.digest}</p>
      ) : null}
    </div>
  );
}
