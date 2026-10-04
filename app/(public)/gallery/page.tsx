import { AlbumGrid } from "@/components/gallery";
import { EditorialPageHero } from "@/components/public/editorial-page-hero";
import { SiteContainer } from "@/components/public/site-container";
import { publicPages } from "@/content/pages";
import { siteMedia } from "@/content/site-media";
import { JsonLd } from "@/lib/json-ld";
import { metadataForPublicPage } from "@/lib/seo/metadata";
import { webPageJsonLd } from "@/lib/seo/structured-data";
import { loadPublishedAlbums } from "@/server/content/public-loaders";

export const metadata = metadataForPublicPage("gallery");

export default async function GalleryPage() {
  const albums = await loadPublishedAlbums();
  const page = publicPages.gallery;

  return (
    <>
      <JsonLd
        data={webPageJsonLd({
          path: page.path,
          name: `${page.title} · Rishra Junior Group Club`,
          description: page.description,
          breadcrumbs: [
            { name: "Home", path: "/" },
            { name: page.title, path: page.path },
          ],
        })}
      />
      <EditorialPageHero
        layout="overlay"
        crumbs={[
          { label: "Home", href: "/" },
          { label: page.title },
        ]}
        eyebrow={page.eyebrow}
        title={page.title}
        description={page.description}
        media={siteMedia.puja}
      />
      <SiteContainer className="pb-20 pt-10 sm:pb-28 sm:pt-14">
        <AlbumGrid albums={albums} />
        {albums.length === 0 ? null : (
          <p className="mt-12 max-w-2xl text-sm text-ink-500">
            Albums are published by the club committee as photographs become
            available.
          </p>
        )}
      </SiteContainer>
    </>
  );
}
