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
import { siteConfig } from "@/content/site";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    absolute: siteConfig.name,
  },
  description: homeContent.hero.support,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: siteConfig.name,
    description: homeContent.hero.support,
    type: "website",
    locale: "en_IN",
    siteName: siteConfig.name,
    images: [
      {
        url: homeContent.hero.image.src,
        width: homeContent.hero.image.width,
        height: homeContent.hero.image.height,
        alt: homeContent.hero.image.alt,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: homeContent.hero.support,
    images: [homeContent.hero.image.src],
  },
};

export default function HomePage() {
  return (
    <>
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
