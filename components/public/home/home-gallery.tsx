"use client";

import { AlbumCard } from "@/components/gallery";
import { Reveal, StaggerChildren, StaggerItem } from "@/components/motion";
import { SiteContainer } from "@/components/public/site-container";
import type { GalleryAlbum } from "@/content/gallery";
import { homeContent, type HomeContent } from "@/content/home";
import { HomeLink } from "./home-link";
import { HomeSectionHeading } from "./home-section-heading";

export function HomeGallery({
  albums = [],
  content = homeContent.gallery,
}: {
  albums?: GalleryAlbum[];
  content?: HomeContent["gallery"];
} = {}) {
  if (albums.length === 0) return null;

  return (
    <section
      aria-labelledby="home-gallery-heading"
      className="border-b border-border-subtle py-20 sm:py-28"
    >
      <SiteContainer>
        <Reveal>
          <HomeSectionHeading
            eyebrow={content.eyebrow}
            title={content.title}
            description={content.description}
            titleId="home-gallery-heading"
            actions={<HomeLink {...content.cta} appearance="outline" />}
          />
        </Reveal>
        <StaggerChildren className="mx-auto mt-10 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {albums.map((album, index) => (
            <StaggerItem key={album.id}>
              <AlbumCard album={album} index={index} />
            </StaggerItem>
          ))}
        </StaggerChildren>
      </SiteContainer>
    </section>
  );
}
