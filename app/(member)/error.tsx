"use client";

import { Button } from "@/components/ui/button";
import { useEffect } from "react";

export default function MemberError({
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
    <div className="p-6 sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-alta-600">
        Error
      </p>
      <h1 className="mt-2 font-display text-2xl font-semibold text-ink-900">
        Something went wrong in the member portal
      </h1>
      <p className="mt-2 max-w-prose text-sm text-ink-500">
        Your session may still be active. Try again, or sign out and sign back
        in.
      </p>
      <div className="mt-6">
        <Button type="button" onClick={reset}>
          Try again
        </Button>
      </div>
    </div>
  );
}
