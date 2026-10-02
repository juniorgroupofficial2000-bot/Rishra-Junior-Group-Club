import { FadeIn } from "@/components/motion/fade-in";
import { SiteContainer } from "@/components/public/site-container";
import {
  getPublishedArchiveYears,
  saraswatiPujaContent,
} from "@/content/heritage";
import { cn } from "@/lib/cn";
import { ProvenanceBadge } from "./provenance-badge";

export function PujaPreviousYears() {
  const years = getPublishedArchiveYears();
  const { title, description } = saraswatiPujaContent.previousYears;

  return (
    <section
      id="previous-years"
      aria-labelledby="puja-previous-heading"
      className="border-b border-border-subtle bg-surface-raised py-16 sm:py-20"
    >
      <SiteContainer>
        <FadeIn>
          <h2
            id="puja-previous-heading"
            className="font-display text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl"
          >
            {title}
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-ink-500">
            {description}
          </p>
          <ul className="mt-8 divide-y divide-border-subtle border-y border-border-subtle">
            {years.map((year) => (
              <li
                key={year.id}
                className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-mono text-sm font-semibold tabular-nums text-alta-600">
                    {year.year}
                  </span>
                  <span className="font-display text-lg font-semibold text-ink-900">
                    {year.title}
                  </span>
                  <ProvenanceBadge provenance={year.provenance} />
                </div>
                <p
                  className={cn(
                    "max-w-xl text-sm text-ink-500 sm:text-right",
                  )}
                >
                  {year.summary}
                </p>
              </li>
            ))}
          </ul>
        </FadeIn>
      </SiteContainer>
    </section>
  );
}
