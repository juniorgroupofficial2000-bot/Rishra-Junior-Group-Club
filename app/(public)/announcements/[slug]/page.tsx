import { AnnouncementDetail } from "@/components/announcements";
import { SiteContainer } from "@/components/public";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import {
  announcementsPageCopy,
  getAnnouncementBySlug,
  getPublishedAnnouncements,
} from "@/content/announcements";
import { siteConfig } from "@/content/site";
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
  if (!item) return { title: "Announcement not found" };

  return {
    title: item.title.replace(/^\[SAMPLE\]\s*/, ""),
    description: item.summary,
    alternates: { canonical: `/announcements/${item.slug}` },
    openGraph: {
      title: `${item.title} · ${siteConfig.name}`,
      description: item.summary,
      url: `/announcements/${item.slug}`,
      type: "article",
      publishedTime: item.publishedAt,
    },
  };
}

export default async function AnnouncementDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const announcement = getAnnouncementBySlug(slug);
  if (!announcement) notFound();

  return (
    <>
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
      <SiteContainer className="pb-16 sm:pb-20">
        <AnnouncementDetail announcement={announcement} />
      </SiteContainer>
    </>
  );
}
