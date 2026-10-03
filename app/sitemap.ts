import { publicPages } from "@/content/pages";
import { absoluteUrl } from "@/lib/seo/config";
import {
  loadPublishedAlbums,
  loadPublishedAnnouncements,
  loadPublishedEvents,
  loadPublishedPujaYears,
} from "@/server/content/public-loaders";
import type { MetadataRoute } from "next";

function priorityForPage(key: string): number {
  if (key === "home") return 1;
  if (key === "saraswati-puja") return 0.9;
  if (key === "privacy" || key === "terms") return 0.3;
  if (key === "faq" || key === "about") return 0.6;
  return 0.7;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = Object.values(publicPages).map(
    (page) => ({
      url: absoluteUrl(page.path),
      lastModified: now,
      changeFrequency: page.key === "home" ? "weekly" : "monthly",
      priority: priorityForPage(page.key),
    }),
  );

  const [publishedEvents, albums, announcements, pujaYears] = await Promise.all([
    loadPublishedEvents(),
    loadPublishedAlbums(),
    loadPublishedAnnouncements(),
    loadPublishedPujaYears(),
  ]);

  // SAMPLE / demo content stays out of the sitemap even if published for UI demos.
  const events: MetadataRoute.Sitemap = publishedEvents
    .filter((event) => event.provenance !== "sample")
    .map((event) => ({
      url: absoluteUrl(`/events/${event.slug}`),
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));

  const albumRoutes: MetadataRoute.Sitemap = albums
    .filter((album) => album.provenance !== "sample")
    .map((album) => ({
      url: absoluteUrl(`/gallery/${album.slug}`),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    }));

  const announcementRoutes: MetadataRoute.Sitemap = announcements
    .filter((item) => item.provenance !== "sample")
    .map((item) => ({
      url: absoluteUrl(`/announcements/${item.slug}`),
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.5,
    }));

  const pujaYearRoutes: MetadataRoute.Sitemap = pujaYears
    .filter((year) => year.provenance !== "sample")
    .map((year) => ({
      url: absoluteUrl(`/saraswati-puja/${year.year}`),
      lastModified: now,
      changeFrequency: "yearly" as const,
      priority: 0.8,
    }));

  return [
    ...staticRoutes,
    ...events,
    ...albumRoutes,
    ...announcementRoutes,
    ...pujaYearRoutes,
  ];
}
