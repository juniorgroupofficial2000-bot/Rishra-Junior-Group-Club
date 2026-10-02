"use client";

import { Reveal, StaggerChildren, StaggerItem } from "@/components/motion";
import { SiteContainer } from "@/components/public/site-container";
import { homeContent } from "@/content/home";
import { cn } from "@/lib/cn";
import { HomeLink } from "./home-link";
import { HomeSectionHeading } from "./home-section-heading";

const content = homeContent.heritage;

export function HomeHeritage() {
  return (
    <section
      aria-labelledby="home-heritage-heading"
      className="border-b border-border-subtle bg-surface-raised py-20 sm:py-28"
    >
      <SiteContainer>
        <Reveal>
          <HomeSectionHeading
            eyebrow={content.eyebrow}
            title={content.title}
            description={content.description}
            titleId="home-heritage-heading"
            actions={<HomeLink {...content.cta} appearance="outline" />}
          />
        </Reveal>

        <div className="relative mt-14">
          <div
            className="absolute left-[0.85rem] top-2 bottom-2 w-px bg-gradient-to-b from-alta-500 via-marigold-400 to-ink-200 sm:left-1/2 sm:-translate-x-px"
            aria-hidden
          />
          <StaggerChildren className="space-y-10">
            {content.items.map((item, index) => (
              <StaggerItem key={item.id} as="article">
                <div
                  className={cn(
                    "relative grid gap-4 sm:grid-cols-2 sm:gap-10",
                    index % 2 === 1 && "sm:[&>*:first-child]:order-2",
                  )}
                >
                  <div
                    className={cn(
                      "pl-10 sm:pl-0",
                      index % 2 === 0 ? "sm:pr-12 sm:text-right" : "sm:pl-12",
                    )}
                  >
                    <p className="font-display text-3xl font-semibold tabular-nums text-alta-600 sm:text-4xl">
                      {item.year}
                    </p>
                    <h3 className="type-h3 mt-2 text-ink-900">{item.title}</h3>
                    <p className="mt-2 type-body text-ink-500">{item.description}</p>
                  </div>
                  <div className="hidden sm:block" aria-hidden />
                  <span
                    className="absolute left-2 top-2 h-3 w-3 rounded-full border-2 border-marigold-400 bg-surface-raised shadow-sm sm:left-1/2 sm:-translate-x-1/2"
                    aria-hidden
                  />
                </div>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </SiteContainer>
    </section>
  );
}
