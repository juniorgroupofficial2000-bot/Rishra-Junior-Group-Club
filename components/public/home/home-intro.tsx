import { FadeIn } from "@/components/motion/fade-in";
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
      className="border-b border-border-subtle py-16 sm:py-24"
    >
      <SiteContainer>
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <FadeIn className="min-w-0 order-2 lg:order-1">
            <HomeSectionHeading
              eyebrow={content.eyebrow}
              title={content.title}
              titleId="home-intro-heading"
            />
            <div className="mt-6 space-y-4 text-base leading-relaxed text-ink-600">
              {content.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            <div className="mt-8">
              <HomeLink {...content.cta} appearance="solid" />
            </div>
          </FadeIn>
          <FadeIn delay={0.08} className="order-1 min-w-0 lg:order-2" slow>
            <HomeImage
              image={content.image}
              className="aspect-[4/3] w-full rounded-none sm:rounded-xl"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </FadeIn>
        </div>
      </SiteContainer>
    </section>
  );
}
