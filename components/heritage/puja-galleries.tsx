import { FadeIn, Stagger, StaggerItem } from "@/components/motion/fade-in";
import { SiteContainer } from "@/components/public/site-container";
import { saraswatiPujaContent } from "@/content/heritage";
import Image from "next/image";
import { ProvenanceBadge } from "./provenance-badge";

export function PujaGalleries() {
  const { title, description, images } = saraswatiPujaContent.photoGalleries;

  return (
    <section
      id="photo-galleries"
      aria-labelledby="puja-galleries-heading"
      className="border-b border-border-subtle py-16 sm:py-20"
    >
      <SiteContainer>
        <FadeIn>
          <h2
            id="puja-galleries-heading"
            className="font-display text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl"
          >
            {title}
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-ink-500">
            {description}
          </p>
        </FadeIn>
        <Stagger className="mx-auto mt-10 grid max-w-4xl grid-cols-2 gap-2 sm:gap-3 md:grid-cols-4">
          {images.map((image) => {
            const isSvg = image.src.endsWith(".svg");
            return (
              <StaggerItem key={image.id}>
                <figure className="relative aspect-square overflow-hidden rounded-lg bg-ink-900">
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    sizes="(max-width: 768px) 45vw, 180px"
                    unoptimized={isSvg}
                    className="object-cover"
                  />
                  <figcaption className="absolute left-2 top-2">
                    <ProvenanceBadge provenance={image.provenance} />
                  </figcaption>
                </figure>
              </StaggerItem>
            );
          })}
        </Stagger>
      </SiteContainer>
    </section>
  );
}
