import { Timeline } from "@/components/club/timeline";
import { FadeIn } from "@/components/motion/fade-in";
import { SiteContainer } from "@/components/public/site-container";
import { homeContent } from "@/content/home";
import { HomeLink } from "./home-link";
import { HomeSectionHeading } from "./home-section-heading";

const content = homeContent.heritage;

export function HomeHeritage() {
  return (
    <section
      aria-labelledby="home-heritage-heading"
      className="border-b border-border-subtle bg-surface-raised py-16 sm:py-24"
    >
      <SiteContainer>
        <FadeIn>
          <HomeSectionHeading
            eyebrow={content.eyebrow}
            title={content.title}
            description={content.description}
            titleId="home-heritage-heading"
            actions={<HomeLink {...content.cta} appearance="outline" />}
          />
        </FadeIn>
        <FadeIn delay={0.06} className="mt-12 max-w-3xl">
          <Timeline items={[...content.items]} />
        </FadeIn>
      </SiteContainer>
    </section>
  );
}
