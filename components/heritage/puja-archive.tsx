import { FadeIn, Stagger, StaggerItem } from "@/components/motion/fade-in";
import { EmptyState } from "@/components/public/empty-state";
import { SiteContainer } from "@/components/public/site-container";
import {
  saraswatiPujaContent,
  type PujaArchiveYear,
} from "@/content/heritage";
import { ArchiveYearCard } from "./archive-year-card";

export function PujaArchive({
  years = [],
}: {
  years?: PujaArchiveYear[];
} = {}) {
  const { title, description } = saraswatiPujaContent.archive;

  return (
    <section
      id="annual-archive"
      aria-labelledby="puja-archive-heading"
      className="border-b border-border-subtle bg-surface-raised py-16 sm:py-20"
    >
      <SiteContainer>
        <FadeIn>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-alta-600">
            Archive
          </p>
          <h2
            id="puja-archive-heading"
            className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl"
          >
            {title}
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-ink-500">
            {description}
          </p>
        </FadeIn>
        {years.length === 0 ? (
          <EmptyState
            className="mt-10"
            title="No archive years published yet"
            description="Saraswati Puja years appear here after the committee publishes verified photographs and notes."
            action={{ label: "Contact the club", href: "/contact" }}
          />
        ) : (
          <Stagger className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {years.map((year) => (
              <StaggerItem key={year.id}>
                <ArchiveYearCard year={year} />
              </StaggerItem>
            ))}
          </Stagger>
        )}
      </SiteContainer>
    </section>
  );
}
