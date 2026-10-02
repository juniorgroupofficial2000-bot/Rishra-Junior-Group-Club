import { AlbumCard } from "@/components/gallery";
import { Reveal, StaggerChildren, StaggerItem } from "@/components/motion";
import { SiteContainer } from "@/components/public/site-container";
import { getPublishedAlbums } from "@/content/gallery";
import { homeContent } from "@/content/home";
import { HomeLink } from "./home-link";
import { HomeSectionHeading } from "./home-section-heading";

const content = homeContent.gallery;

export function HomeGallery() {
  const albums = getPublishedAlbums().slice(0, content.previewLimit);

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
        <StaggerChildren className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {albums.map((album, index) => (
            <StaggerItem key={album.id}>
              <AlbumCard
                album={album}
                priority={index < 2}
                featured={index === 0}
                className={index === 0 ? "sm:col-span-2 lg:col-span-1" : undefined}
              />
            </StaggerItem>
          ))}
        </StaggerChildren>
      </SiteContainer>
    </section>
  );
}
