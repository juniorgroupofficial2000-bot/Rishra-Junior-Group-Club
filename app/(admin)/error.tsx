"use client";

import {
  RouteErrorFallback,
  type RouteErrorProps,
} from "@/components/errors/route-error-fallback";

export default function AdminError({ error, retry, reset }: RouteErrorProps) {
  return (
    <div className="space-y-4 p-6 sm:p-8">
      <RouteErrorFallback
        error={error}
        retry={retry}
        reset={reset}
        portal="admin"
        title="The admin portal could not load this view"
        description="Your session permissions were still checked on the server. Try again, or return to the dashboard."
        homeHref="/admin/dashboard"
        homeLabel="Admin dashboard"
      />
    </div>
  );
}
