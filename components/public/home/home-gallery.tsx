import { AlbumCard } from "@/components/gallery";
import { FadeIn, Stagger, StaggerItem } from "@/components/motion/fade-in";
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
      className="border-b border-border-subtle py-16 sm:py-24"
    >
      <SiteContainer>
        <FadeIn>
          <HomeSectionHeading
            eyebrow={content.eyebrow}
            title={content.title}
            description={content.description}
            titleId="home-gallery-heading"
            actions={<HomeLink {...content.cta} appearance="outline" />}
          />
        </FadeIn>
        <Stagger className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {albums.map((album, index) => (
            <StaggerItem key={album.id}>
              <AlbumCard album={album} priority={index < 2} />
            </StaggerItem>
          ))}
        </Stagger>
      </SiteContainer>
    </section>
  );
}
