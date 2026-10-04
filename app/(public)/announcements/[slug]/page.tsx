import { AnnouncementDetail } from "@/components/announcements";
import { SiteContainer } from "@/components/public";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { announcementsPageCopy } from "@/content/announcements";
import { JsonLd } from "@/lib/json-ld";
import { buildMetadata, notFoundMetadata } from "@/lib/seo/metadata";
import {
  announcementJsonLd,
  breadcrumbJsonLd,
  organizationJsonLd,
} from "@/lib/seo/structured-data";
import {
  loadPublishedAnnouncementBySlug,
  loadPublishedAnnouncements,
} from "@/server/content/public-loaders";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  try {
    const items = await loadPublishedAnnouncements();
    return items.map((item) => ({ slug: item.slug }));
  } catch {
    // Build hosts may lack DB access; pages still render on demand.
    return [];
  }
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const item = await loadPublishedAnnouncementBySlug(slug);
  if (!item) return notFoundMetadata("Announcement not found");

  return buildMetadata({
    title: item.title.replace(/^\[SAMPLE\]\s*/i, ""),
    description: item.summary,
    path: `/announcements/${item.slug}`,
    ogType: "article",
    publishedTime: item.publishedAt,
    noIndex: item.provenance === "sample",
  });
}

export default async function AnnouncementDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const announcement = await loadPublishedAnnouncementBySlug(slug);
  if (!announcement) notFound();

  const title = announcement.title.replace(/^\[SAMPLE\]\s*/i, "");

  return (
    <>
      <JsonLd
        data={[
          organizationJsonLd(),
          announcementJsonLd(announcement),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: announcementsPageCopy.title, path: "/announcements" },
            {
              name: title,
              path: `/announcements/${announcement.slug}`,
            },
          ]),
        ]}
      />
      <SiteContainer as="header" className="pt-8 sm:pt-10">
        <Breadcrumbs
          className="mb-6"
          items={[
            { label: "Home", href: "/" },
            { label: announcementsPageCopy.title, href: "/announcements" },
            { label: title },
          ]}
        />
      </SiteContainer>
      <SiteContainer className="min-w-0 pb-16 sm:pb-20">
        <AnnouncementDetail announcement={announcement} />
      </SiteContainer>
    </>
  );
}
