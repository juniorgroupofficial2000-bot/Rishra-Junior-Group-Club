import { BrandMark } from "@/components/brand/brand-mark";
import { siteConfig } from "@/content/site";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Offline",
  description: "You are offline. Some pages may be unavailable until you reconnect.",
  robots: { index: false, follow: false },
};

export default function OfflinePage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-heritage-grain px-6 py-16 text-center">
      <BrandMark size={64} decorative={false} />
      <h1 className="mt-6 font-display text-3xl font-semibold tracking-tight text-ink-900">
        You are offline
      </h1>
      <p className="mt-3 max-w-md text-base leading-relaxed text-ink-500">
        {siteConfig.name} needs a network connection for live content. Cached
        pages may still open; try again when you are back online.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-flex min-h-11 items-center justify-center rounded-md bg-ink-900 px-4 text-sm font-medium text-white hover:bg-ink-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Back to home
        </Link>
        <Link
          href="/gallery"
          className="inline-flex min-h-11 items-center justify-center rounded-md border border-border-default px-4 text-sm font-medium text-ink-900 hover:bg-ink-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Gallery
        </Link>
      </div>
    </div>
  );
}
