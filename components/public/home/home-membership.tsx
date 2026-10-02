import { FadeIn } from "@/components/motion/fade-in";
import { SiteContainer } from "@/components/public/site-container";
import { homeContent } from "@/content/home";
import { HomeLink } from "./home-link";
import { HomeSectionHeading } from "./home-section-heading";

const content = homeContent.membership;

export function HomeMembership() {
  return (
    <section
      aria-labelledby="home-membership-heading"
      className="border-b border-border-subtle bg-surface-heritage-soft py-16 sm:py-24"
    >
      <SiteContainer>
        <FadeIn className="mx-auto max-w-3xl text-center">
          <HomeSectionHeading
            align="center"
            eyebrow={content.eyebrow}
            title={content.title}
            description={content.description}
            titleId="home-membership-heading"
          />
          <p className="mt-4 text-base leading-relaxed text-ink-600">{content.body}</p>
          <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            {content.ctas.map((cta) => (
              <HomeLink
                key={cta.label}
                {...cta}
                appearance={cta.variant === "primary" ? "solid" : "outline"}
                className="sm:min-w-[12rem]"
              />
            ))}
          </div>
        </FadeIn>
      </SiteContainer>
    </section>
  );
}
