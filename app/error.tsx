"use client";

import {
  RouteErrorFallback,
  type RouteErrorProps,
} from "@/components/errors/route-error-fallback";

export default function RootError({ error, retry, reset }: RouteErrorProps) {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
      <RouteErrorFallback
        error={error}
        retry={retry}
        reset={reset}
        portal="root"
        title="We could not load this page"
        description="Please try again. If the problem continues, contact the club using the details on the Contact page."
      />
    </div>
  );
}
