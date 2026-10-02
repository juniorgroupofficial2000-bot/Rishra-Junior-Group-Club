import { AnnouncementDetail } from "@/components/announcements";
import { SiteContainer } from "@/components/public";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import {
  announcementsPageCopy,
  getAnnouncementBySlug,
  getPublishedAnnouncements,
} from "@/content/announcements";
import { JsonLd } from "@/lib/json-ld";
import { buildMetadata } from "@/lib/seo/metadata";
import { breadcrumbJsonLd, organizationJsonLd } from "@/lib/seo/structured-data";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getPublishedAnnouncements().map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const item = getAnnouncementBySlug(slug);
  if (!item) return { title: "Announcement not found", robots: { index: false } };

  return buildMetadata({
    title: item.title,
    description: item.summary,
    path: `/announcements/${item.slug}`,
    ogType: "article",
    noIndex: item.provenance === "sample",
  });
}

export default async function AnnouncementDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const announcement = getAnnouncementBySlug(slug);
  if (!announcement) notFound();

  return (
    <>
      <JsonLd
        data={[
          organizationJsonLd(),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: announcementsPageCopy.title, path: "/announcements" },
            {
              name: announcement.title.replace(/^\[SAMPLE\]\s*/i, ""),
              path: `/announcements/${announcement.slug}`,
            },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "NewsArticle",
            headline: announcement.title.replace(/^\[SAMPLE\]\s*/i, ""),
            datePublished: announcement.publishedAt,
            description: announcement.summary,
            mainEntityOfPage: `/announcements/${announcement.slug}`,
          },
        ]}
      />
      <SiteContainer className="pt-8 sm:pt-10">
        <Breadcrumbs
          className="mb-6"
          items={[
            { label: "Home", href: "/" },
            { label: announcementsPageCopy.title, href: "/announcements" },
            { label: announcement.title },
          ]}
        />
      </SiteContainer>
      <SiteContainer className="min-w-0 pb-16 sm:pb-20">
        <AnnouncementDetail announcement={announcement} />
      </SiteContainer>
    </>
  );
}
