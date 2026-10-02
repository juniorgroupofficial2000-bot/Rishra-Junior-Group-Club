import { FadeIn } from "@/components/motion/fade-in";
import { SiteContainer } from "@/components/public/site-container";
import { homeContent } from "@/content/home";
import { HomeImage } from "./home-image";
import { HomeLink } from "./home-link";
import { HomeSectionHeading } from "./home-section-heading";

const content = homeContent.location;

export function HomeLocation() {
  return (
    <section
      aria-labelledby="home-location-heading"
      className="py-16 sm:py-24"
    >
      <SiteContainer>
        <div className="grid items-stretch gap-10 lg:grid-cols-2 lg:gap-14">
          <FadeIn className="min-w-0">
            <HomeSectionHeading
              eyebrow={content.eyebrow}
              title={content.title}
              description={content.description}
              titleId="home-location-heading"
            />
            <address className="mt-8 not-italic">
              <p className="text-sm font-semibold uppercase tracking-[0.12em] text-ink-500">
                Address
              </p>
              <p className="mt-2 text-base leading-relaxed text-ink-800">
                {content.addressLines.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </p>
            </address>
            <dl className="mt-6 space-y-3 text-sm">
              <div>
                <dt className="font-medium text-ink-800">Email</dt>
                <dd className="text-ink-600">{content.email}</dd>
              </div>
              <div>
                <dt className="font-medium text-ink-800">Phone</dt>
                <dd className="text-ink-600">{content.phone}</dd>
              </div>
              <div>
                <dt className="font-medium text-ink-800">Hours</dt>
                <dd className="text-ink-600">{content.hours}</dd>
              </div>
            </dl>
            <div className="mt-8">
              <HomeLink {...content.cta} appearance="solid" />
            </div>
          </FadeIn>
          <FadeIn delay={0.08} slow className="min-w-0">
            <HomeImage
              image={content.image}
              className="h-full min-h-72 w-full sm:rounded-xl lg:min-h-full"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </FadeIn>
        </div>
      </SiteContainer>
    </section>
  );
}
