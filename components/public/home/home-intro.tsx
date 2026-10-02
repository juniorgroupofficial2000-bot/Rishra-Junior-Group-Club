import { ImageReveal, Reveal } from "@/components/motion";
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
      className="border-b border-border-subtle py-20 sm:py-28"
    >
      <SiteContainer>
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <Reveal className="min-w-0 order-2 lg:order-1">
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
              <HomeLink {...content.cta} appearance="solid" />
            </div>
          </Reveal>
          <ImageReveal className="order-1 min-w-0 rounded-2xl shadow-md lg:order-2">
            <HomeImage
              image={content.image}
              className="aspect-[4/3] w-full rounded-2xl"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </ImageReveal>
        </div>
      </SiteContainer>
    </section>
  );
}
