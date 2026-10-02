import { getPublishedAnnouncements } from "@/content/announcements";
import { getPublishedEvents } from "@/content/events";
import { getPublishedAlbums } from "@/content/gallery";
import { publicPages } from "@/content/pages";
import { getSiteUrl } from "@/lib/seo/config";
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = Object.values(publicPages).map(
    (page) => ({
      url: `${base}${page.path === "/" ? "" : page.path}`,
      lastModified: now,
      changeFrequency: page.key === "home" ? "weekly" : "monthly",
      priority: page.key === "home" ? 1 : page.key === "saraswati-puja" ? 0.9 : 0.7,
    }),
  );

  const events: MetadataRoute.Sitemap = getPublishedEvents().map((event) => ({
    url: `${base}/events/${event.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  const albums: MetadataRoute.Sitemap = getPublishedAlbums().map((album) => ({
    url: `${base}/gallery/${album.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  const announcements: MetadataRoute.Sitemap = getPublishedAnnouncements().map(
    (item) => ({
      url: `${base}/announcements/${item.slug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.5,
    }),
  );

  return [...staticRoutes, ...events, ...albums, ...announcements];
}
