import { ClubHome } from "@/components/public/club-home";
import { JsonLd } from "@/lib/json-ld";
import { buildMetadata } from "@/lib/seo/metadata";
import { homePageJsonLd } from "@/lib/seo/structured-data";
import { seoDefaults } from "@/lib/seo/config";
import { loadPublishedHomeContent } from "@/server/content/public-loaders";

export async function generateMetadata() {
  const content = await loadPublishedHomeContent();
  return buildMetadata({
    title: seoDefaults.siteName,
    absoluteTitle: true,
    description: content.hero.support,
    path: "/",
    image: {
      url: content.hero.image.src,
      width: content.hero.image.width,
      height: content.hero.image.height,
      alt: content.hero.image.alt,
    },
  });
}

export default function HomePage() {
  return (
    <>
      <JsonLd data={homePageJsonLd()} />
      <ClubHome />
    </>
  );
}
