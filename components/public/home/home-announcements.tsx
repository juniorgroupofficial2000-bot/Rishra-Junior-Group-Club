import { FadeIn, Stagger, StaggerItem } from "@/components/motion/fade-in";
import { SiteContainer } from "@/components/public/site-container";
import { homeContent } from "@/content/home";
import Link from "next/link";
import { HomeLink } from "./home-link";
import { HomeSectionHeading } from "./home-section-heading";

const content = homeContent.announcements;

export function HomeAnnouncements() {
  return (
    <section
      aria-labelledby="home-announcements-heading"
      className="border-b border-border-subtle bg-surface-raised py-16 sm:py-24"
    >
      <SiteContainer>
        <FadeIn>
          <HomeSectionHeading
            eyebrow={content.eyebrow}
            title={content.title}
            description={content.description}
            titleId="home-announcements-heading"
            actions={<HomeLink {...content.cta} appearance="outline" />}
          />
        </FadeIn>
        <Stagger className="mt-10 divide-y divide-border-subtle border-y border-border-subtle">
          {content.items.map((item) => (
            <StaggerItem key={item.id}>
              <article>
                <Link
                  href={item.href}
                  className="group flex flex-col gap-2 py-6 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8"
                >
                  <div className="min-w-0">
                    <h3 className="font-display text-xl font-semibold tracking-tight text-ink-900 group-hover:text-alta-600">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-ink-500">
                      {item.summary}
                    </p>
                  </div>
                  <time className="shrink-0 font-mono text-xs text-ink-400 sm:text-sm">
                    {item.dateLabel}
                  </time>
                </Link>
              </article>
            </StaggerItem>
          ))}
        </Stagger>
      </SiteContainer>
    </section>
  );
}
