"use client";

import { SiteContainer } from "@/components/public";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect } from "react";

export default function PublicError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <SiteContainer className="py-16 sm:py-24">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-alta-600">
        Something went wrong
      </p>
      <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl">
        We could not load this page
      </h1>
      <p className="mt-4 max-w-prose text-base text-ink-500">
        Please try again. If the problem continues, contact the club using the
        details on the Contact page.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button type="button" onClick={reset}>
          Try again
        </Button>
        <Link
          href="/"
          className="inline-flex h-11 items-center justify-center rounded-md border border-border-default px-4 text-sm font-medium text-ink-900 transition-colors hover:bg-ink-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          Go home
        </Link>
      </div>
      {error.digest ? (
        <p className="mt-6 font-mono text-xs text-ink-400">Ref: {error.digest}</p>
      ) : null}
    </SiteContainer>
  );
}
