import { FadeIn, Stagger, StaggerItem } from "@/components/motion/fade-in";
import { SiteContainer } from "@/components/public/site-container";
import {
  getPublishedPujaGalleryImages,
  saraswatiPujaContent,
} from "@/content/heritage";
import Image from "next/image";
import Link from "next/link";
import { ProvenanceBadge } from "./provenance-badge";

export function PujaGalleries() {
  const { title, description } = saraswatiPujaContent.photoGalleries;
  const images = getPublishedPujaGalleryImages();

  if (images.length === 0) {
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
            <p className="mt-8 rounded-xl border border-dashed border-border-strong px-5 py-8 text-sm text-ink-500">
              Photographs will be published here when available. Browse the{" "}
              <Link
                href="/gallery"
                className="font-medium text-ink-800 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                gallery
              </Link>{" "}
              for albums.
            </p>
          </FadeIn>
        </SiteContainer>
      </section>
    );
  }

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
