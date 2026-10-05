import { BrandMark } from "@/components/brand/brand-mark";
import { siteConfig } from "@/content/site";
import { privatePageMetadata } from "@/lib/seo/metadata";
import Link from "next/link";
import type { ReactNode } from "react";

export const metadata = privatePageMetadata(
  "Sign in",
  "Sign in to the Rishra Junior Group Club member or admin portal.",
);

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-heritage-grain">
      <header className="border-b border-border-subtle bg-surface-raised/90">
        <div className="mx-auto flex w-full max-w-lg items-center justify-between px-4 py-4 sm:px-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 font-display text-base font-semibold text-ink-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <BrandMark size={32} />
            <span className="truncate">{siteConfig.name}</span>
          </Link>
          <Link
            href="/contact"
            className="text-sm text-ink-600 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Help
          </Link>
        </div>
      </header>
      <main id="main-content" className="flex flex-1 items-center justify-center px-4 py-12">
        {children}
      </main>
    </div>
  );
}
