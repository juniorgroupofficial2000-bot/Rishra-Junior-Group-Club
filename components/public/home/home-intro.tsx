"use client";

import { ClipImageReveal, Reveal, SlideIn } from "@/components/motion";
import { SiteContainer } from "@/components/public/site-container";
import { homeContent } from "@/content/home";
import { HomeImage } from "./home-image";
import { HomeLink } from "./home-link";
import { HomeSectionHeading } from "./home-section-heading";

const content = homeContent.intro;

export function HomeIntro() {
  return (
    <section
      aria-labelledby="home-intro-heading"
      className="relative z-10 -mt-8 border-b border-border-subtle bg-surface-canvas py-20 sm:-mt-12 sm:py-28"
    >
      <SiteContainer>
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <Reveal className="order-2 min-w-0 lg:order-1">
            <HomeSectionHeading
              eyebrow={content.eyebrow}
              title={content.title}
              titleId="home-intro-heading"
            />
            <div className="mt-6 space-y-4 type-body leading-relaxed text-ink-600">
              {content.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            <div className="mt-9">
              <HomeLink {...content.cta} appearance="solid" className="group" />
            </div>
          </Reveal>
          <SlideIn
            from="right"
            className="order-1 mx-auto min-w-0 w-full max-w-sm lg:order-2 lg:max-w-md"
          >
            <ClipImageReveal className="rounded-xl shadow-md">
              <HomeImage
                image={content.image}
                className="aspect-[4/3] w-full rounded-xl"
                sizes="(max-width: 1024px) 80vw, 380px"
              />
            </ClipImageReveal>
          </SlideIn>
        </div>
      </SiteContainer>
    </section>
  );
}
