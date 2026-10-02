"use client";

import { Button } from "@/components/ui/button";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="space-y-4 p-6 sm:p-8">
      <h1 className="font-display text-2xl font-semibold text-ink-900">
        Something went wrong
      </h1>
      <p className="max-w-xl text-sm text-ink-600">
        The admin portal could not load this view. Your session permissions were
        still checked on the server.
      </p>
      <p className="font-mono text-xs text-ink-400">{error.digest ?? error.message}</p>
      <Button type="button" onClick={reset}>
        Try again
      </Button>
    </div>
  );
}
