import { AnnouncementList } from "@/components/announcements";
import { PublicPageShell } from "@/components/public";
import {
  announcementsPageCopy,
  getPublishedAnnouncements,
} from "@/content/announcements";
import { siteConfig } from "@/content/site";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Announcements",
  description: announcementsPageCopy.description,
  alternates: { canonical: "/announcements" },
  openGraph: {
    title: `Announcements · ${siteConfig.name}`,
    description: announcementsPageCopy.description,
    url: "/announcements",
    type: "website",
  },
};

export default function AnnouncementsPage() {
  const items = getPublishedAnnouncements();

  return (
    <PublicPageShell pageKey="announcements">
      <AnnouncementList items={items} />
    </PublicPageShell>
  );
}
