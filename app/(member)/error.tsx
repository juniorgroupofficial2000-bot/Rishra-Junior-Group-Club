"use client";

import {
  RouteErrorFallback,
  type RouteErrorProps,
} from "@/components/errors/route-error-fallback";

export default function MemberError({ error, retry, reset }: RouteErrorProps) {
  return (
    <div className="p-6 sm:p-8">
      <RouteErrorFallback
        error={error}
        retry={retry}
        reset={reset}
        portal="member"
        title="Something went wrong in the member portal"
        description="Your session may still be active. Try again, or sign out and sign back in."
        homeHref="/member/dashboard"
        homeLabel="Member dashboard"
      />
    </div>
  );
}
