import {
  HomeHero,
  HomeIntro,
  HomeHeritage,
} from "@/components/public/home";
import { homeContent as brandHomeShell } from "@/content/home";
import { JsonLd } from "@/lib/json-ld";
import { buildMetadata } from "@/lib/seo/metadata";
import { homePageJsonLd } from "@/lib/seo/structured-data";
import { seoDefaults } from "@/lib/seo/config";
import {
  loadPublishedAlbums,
  loadPublishedAnnouncements,
  loadPublishedCommitteeMembers,
  loadPublishedHomeContent,
  loadUpcomingEvents,
} from "@/server/content/public-loaders";
import dynamic from "next/dynamic";

/** Below-the-fold home sections — code-split client motion bundles. */
const HomePuja = dynamic(() =>
  import("@/components/public/home/home-puja").then((m) => m.HomePuja),
);
const HomeCommittee = dynamic(() =>
  import("@/components/public/home/home-committee").then((m) => m.HomeCommittee),
);
const HomeEvents = dynamic(() =>
  import("@/components/public/home/home-events").then((m) => m.HomeEvents),
);
const HomeGallery = dynamic(() =>
  import("@/components/public/home/home-gallery").then((m) => m.HomeGallery),
);
const HomeAnnouncements = dynamic(() =>
  import("@/components/public/home/home-announcements").then(
    (m) => m.HomeAnnouncements,
  ),
);
const HomeMembership = dynamic(() =>
  import("@/components/public/home/home-membership").then(
    (m) => m.HomeMembership,
  ),
);
const HomeLocation = dynamic(() =>
  import("@/components/public/home/home-location").then((m) => m.HomeLocation),
);

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

export default async function HomePage() {
  let content: typeof brandHomeShell = brandHomeShell;
  let committee: Awaited<ReturnType<typeof loadPublishedCommitteeMembers>> = [];
  let events: Awaited<ReturnType<typeof loadUpcomingEvents>> = [];
  let albums: Awaited<ReturnType<typeof loadPublishedAlbums>> = [];
  let announcements: Awaited<ReturnType<typeof loadPublishedAnnouncements>> =
    [];

  try {
    [content, committee, events, albums, announcements] = await Promise.all([
      loadPublishedHomeContent(),
      loadPublishedCommitteeMembers(),
      loadUpcomingEvents(),
      loadPublishedAlbums(),
      loadPublishedAnnouncements(),
    ]);
  } catch (error) {
    console.error("[home] public loaders failed; using brand shell.", error);
  }

  const previewAlbums = albums.slice(0, content.gallery.previewLimit);
  const previewAnnouncements = announcements.slice(
    0,
    content.announcements.previewLimit,
  );
  const previewEvents = events.slice(0, content.events.previewLimit);

  return (
    <>
      <JsonLd data={homePageJsonLd()} />
      <HomeHero content={content.hero} />
      <HomeIntro content={content.intro} />
      <HomeHeritage content={content.heritage} />
      <HomePuja content={content.puja} />
      <HomeCommittee members={committee} content={content.committee} />
      <HomeEvents events={previewEvents} content={content.events} />
      <HomeGallery albums={previewAlbums} content={content.gallery} />
      <HomeAnnouncements
        items={previewAnnouncements}
        content={content.announcements}
      />
      <HomeMembership content={content.membership} />
      <HomeLocation content={content.location} />
    </>
  );
}
