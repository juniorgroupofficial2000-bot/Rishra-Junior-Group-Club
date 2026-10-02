import { SiteContainer } from "@/components/public";
import { publicPages } from "@/content/pages";
import { formatAddressLines, siteConfig } from "@/content/site";
import { metadataForPage } from "@/lib/public-metadata";
import Link from "next/link";

export const metadata = metadataForPage("home");

export default function HomePage() {
  const page = publicPages.home;

  return (
    <>
      <section className="relative isolate overflow-hidden border-b border-border-subtle bg-ink-900 text-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          aria-hidden
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, rgb(201 67 42 / 0.35), transparent 45%), radial-gradient(circle at 80% 0%, rgb(196 154 26 / 0.2), transparent 40%)",
          }}
        />
        <SiteContainer className="relative py-16 sm:py-24 lg:py-28">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-marigold-400">
            {siteConfig.establishedLabel}
          </p>
          <h1 className="mt-4 max-w-3xl font-display text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
            {page.title}
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-200">
            {page.description}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              href="/saraswati-puja"
              className="inline-flex min-h-12 items-center justify-center rounded-md bg-alta-500 px-5 text-sm font-medium text-white transition-colors hover:bg-alta-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marigold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-900"
            >
              Saraswati Puja
            </Link>
            <Link
              href="/membership"
              className="inline-flex min-h-12 items-center justify-center rounded-md border border-ink-500 bg-transparent px-5 text-sm font-medium text-white transition-colors hover:bg-ink-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marigold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-900"
            >
              Membership
            </Link>
            <Link
              href="/about"
              className="inline-flex min-h-12 items-center justify-center rounded-md px-5 text-sm font-medium text-ink-100 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marigold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-900"
            >
              About the club
            </Link>
          </div>
        </SiteContainer>
      </section>

      <SiteContainer as="section" className="py-12 sm:py-16" aria-labelledby="home-visit">
        <h2
          id="home-visit"
          className="font-display text-2xl font-semibold tracking-tight text-ink-900"
        >
          Visit
        </h2>
        <address className="mt-4 not-italic text-base leading-relaxed text-ink-600">
          {formatAddressLines().map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </address>
        <p className="mt-6 max-w-prose text-sm text-ink-500">
          {siteConfig.registrationNote}
        </p>
      </SiteContainer>
    </>
  );
}
