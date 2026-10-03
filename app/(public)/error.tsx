"use client";

import {
  RouteErrorFallback,
  type RouteErrorProps,
} from "@/components/errors/route-error-fallback";
import { SiteContainer } from "@/components/public";

export default function PublicError({ error, retry, reset }: RouteErrorProps) {
  return (
    <SiteContainer className="py-16 sm:py-24">
      <RouteErrorFallback
        error={error}
        retry={retry}
        reset={reset}
        portal="public"
        title="We could not load this page"
        description="Please try again. If the problem continues, contact the club using the details on the Contact page."
      />
    </SiteContainer>
  );
}
