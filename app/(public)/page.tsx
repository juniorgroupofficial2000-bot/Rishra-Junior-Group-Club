import {
  HomeAnnouncements,
  HomeCommittee,
  HomeEvents,
  HomeGallery,
  HomeHeritage,
  HomeHero,
  HomeIntro,
  HomeLocation,
  HomeMembership,
  HomePuja,
} from "@/components/public/home";
import { homeContent } from "@/content/home";
import { JsonLd } from "@/lib/json-ld";
import { buildMetadata } from "@/lib/seo/metadata";
import { homePageJsonLd } from "@/lib/seo/structured-data";
import { seoDefaults } from "@/lib/seo/config";

export const metadata = buildMetadata({
  title: seoDefaults.siteName,
  absoluteTitle: true,
  description: homeContent.hero.support,
  path: "/",
  image: {
    url: homeContent.hero.image.src,
    width: homeContent.hero.image.width,
    height: homeContent.hero.image.height,
    alt: homeContent.hero.image.alt,
  },
});

export default function HomePage() {
  return (
    <>
      <JsonLd data={homePageJsonLd()} />
      <HomeHero />
      <HomeIntro />
      <HomeHeritage />
      <HomePuja />
      <HomeCommittee />
      <HomeEvents />
      <HomeGallery />
      <HomeAnnouncements />
      <HomeMembership />
      <HomeLocation />
    </>
  );
}
