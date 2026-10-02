import { FadeIn } from "@/components/motion/fade-in";
import { SiteContainer } from "@/components/public/site-container";
import { homeContent } from "@/content/home";
import Image from "next/image";
import { HomeImage } from "./home-image";
import { HomeLink } from "./home-link";
import { HomeSectionHeading } from "./home-section-heading";

const content = homeContent.puja;
const isSvg = content.image.src.endsWith(".svg");

export function HomePuja() {
  return (
    <section
      aria-labelledby="home-puja-heading"
      className="relative isolate overflow-hidden bg-ink-900 py-16 text-white sm:py-24"
    >
      <div className="absolute inset-0" aria-hidden>
        <Image
          src={content.image.src}
          alt=""
          fill
          sizes="100vw"
          unoptimized={isSvg}
          className="object-cover opacity-45"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink-950 via-ink-950/88 to-ink-950/60" />
      </div>

      <SiteContainer className="relative">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <FadeIn>
            <HomeSectionHeading
              tone="inverse"
              eyebrow={content.eyebrow}
              title={content.title}
              description={content.description}
              titleId="home-puja-heading"
            />
            <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-200">
              {content.body}
            </p>
            <div className="mt-8">
              <HomeLink
                {...content.cta}
                className="bg-alta-500 text-white hover:bg-alta-600 focus-visible:ring-marigold-400 focus-visible:ring-offset-ink-900"
              />
            </div>
          </FadeIn>
          <FadeIn delay={0.1} slow className="min-w-0">
            <HomeImage
              image={content.image}
              className="aspect-[3/2] w-full ring-1 ring-white/15"
              sizes="(max-width: 1024px) 100vw, 40vw"
            />
          </FadeIn>
        </div>
      </SiteContainer>
    </section>
  );
}
