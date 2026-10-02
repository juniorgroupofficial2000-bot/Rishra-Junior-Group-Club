import { ImageReveal, Reveal } from "@/components/motion";
import { SiteContainer } from "@/components/public/site-container";
import { homeContent } from "@/content/home";
import { siteMedia } from "@/content/site-media";
import Image from "next/image";
import { HomeLink } from "./home-link";
import { HomeSectionHeading } from "./home-section-heading";

const content = homeContent.puja;
const media = siteMedia.puja;
const isSvg = media.src.endsWith(".svg");

export function HomePuja() {
  return (
    <section
      aria-labelledby="home-puja-heading"
      className="relative isolate overflow-hidden bg-ink-900 py-20 text-white sm:py-28"
    >
      <div className="absolute inset-0" aria-hidden>
        <Image
          src={media.src}
          alt=""
          fill
          sizes="100vw"
          unoptimized={isSvg}
          className="object-cover opacity-40"
          style={{ objectPosition: media.objectPosition }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink-950 via-ink-950/90 to-ink-950/55" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_20%,rgba(196,154,26,0.22),transparent_50%)]" />
      </div>

      <SiteContainer className="relative">
        <div className="grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <Reveal>
            <HomeSectionHeading
              tone="inverse"
              eyebrow={content.eyebrow}
              title={content.title}
              description={content.description}
              titleId="home-puja-heading"
            />
            <p className="mt-6 max-w-xl type-body-large text-ink-100">
              {content.body}
            </p>
            <div className="mt-9">
              <HomeLink
                {...content.cta}
                className="bg-alta-500 text-white hover:bg-alta-600 focus-visible:ring-marigold-400 focus-visible:ring-offset-ink-900"
              />
            </div>
          </Reveal>
          <ImageReveal className="min-w-0 rounded-2xl ring-1 ring-white/15 shadow-lg">
            <div className="relative aspect-[3/2] w-full overflow-hidden rounded-2xl">
              <Image
                src={media.src}
                alt={media.alt}
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                unoptimized={isSvg}
                className="object-cover"
                style={{ objectPosition: media.objectPosition }}
              />
            </div>
          </ImageReveal>
        </div>
      </SiteContainer>
    </section>
  );
}
