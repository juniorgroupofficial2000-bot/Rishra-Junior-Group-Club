import {
  PageTransition,
  SiteContainer,
  SiteFooter,
  SiteHeader,
  SkipLink,
} from "@/components/public";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh min-w-0 flex-col overflow-x-hidden bg-heritage-grain">
      <SkipLink />
      <SiteHeader />
      <PageTransition>
        <main id="main-content" tabIndex={-1} className="flex flex-1 flex-col outline-none">
          <SiteContainer className="py-16 sm:py-24">
            <p className="font-mono text-sm font-semibold text-alta-600">404</p>
            <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl">
              Page not found
            </h1>
            <p className="mt-4 max-w-prose text-base text-ink-500">
              The page you requested does not exist or may have moved. Use the
              navigation to continue browsing the club website.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/"
                className="inline-flex min-h-11 items-center justify-center rounded-md bg-ink-900 px-4 text-sm font-medium text-white shadow-xs transition-colors hover:bg-ink-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                Back to home
              </Link>
              <Link
                href="/contact"
                className="inline-flex min-h-11 items-center justify-center rounded-md border border-border-default px-4 text-sm font-medium text-ink-900 transition-colors hover:bg-ink-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                Contact
              </Link>
            </div>
          </SiteContainer>
        </main>
      </PageTransition>
      <SiteFooter />
    </div>
  );
}
