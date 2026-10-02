import { FadeIn } from "@/components/motion/fade-in";
import { SiteContainer } from "@/components/public/site-container";
import { saraswatiPujaContent } from "@/content/heritage";
import Link from "next/link";
import { ProvenanceBadge } from "./provenance-badge";

export function PujaUpcoming() {
  const content = saraswatiPujaContent.upcoming;

  return (
    <section
      id="upcoming"
      aria-labelledby="puja-upcoming-heading"
      className="bg-surface-heritage-soft py-16 sm:py-20"
    >
      <SiteContainer>
        <FadeIn className="mx-auto max-w-3xl text-center">
          <div className="flex justify-center">
            <ProvenanceBadge provenance={content.provenance} />
          </div>
          <h2
            id="puja-upcoming-heading"
            className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl"
          >
            {content.title}
          </h2>
          <div className="mt-5 space-y-4 text-base leading-relaxed text-ink-600">
            {content.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <p className="mt-6 text-sm text-ink-500">
            Expected venue area: {content.venueNote}
          </p>
          <Link
            href={content.cta.href}
            className="mt-8 inline-flex min-h-12 items-center justify-center rounded-md bg-ink-900 px-5 text-sm font-medium text-white shadow-xs transition-colors hover:bg-ink-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {content.cta.label}
          </Link>
        </FadeIn>
      </SiteContainer>
    </section>
  );
}
