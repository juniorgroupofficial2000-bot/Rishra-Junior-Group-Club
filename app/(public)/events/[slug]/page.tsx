import { EventDetail } from "@/components/events";
import { SiteContainer } from "@/components/public";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import {
  eventsPageCopy,
  getEventBySlug,
  getPublishedEvents,
} from "@/content/events";
import { siteConfig } from "@/content/site";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getPublishedEvents().map((event) => ({ slug: event.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = getEventBySlug(slug);
  if (!event) return { title: "Event not found" };

  return {
    title: event.title.replace(/^\[SAMPLE\]\s*/, ""),
    description: event.summary,
    alternates: { canonical: `/events/${event.slug}` },
    openGraph: {
      title: `${event.title} · ${siteConfig.name}`,
      description: event.summary,
      url: `/events/${event.slug}`,
      type: "article",
      images: event.coverImage
        ? [
            {
              url: event.coverImage.src,
              width: event.coverImage.width,
              height: event.coverImage.height,
              alt: event.coverImage.alt,
            },
          ]
        : undefined,
    },
  };
}

export default async function EventDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const event = getEventBySlug(slug);
  if (!event) notFound();

  return (
    <>
      <SiteContainer className="pt-8 sm:pt-10">
        <Breadcrumbs
          className="mb-6"
          items={[
            { label: "Home", href: "/" },
            { label: eventsPageCopy.title, href: "/events" },
            { label: event.title },
          ]}
        />
      </SiteContainer>
      <SiteContainer className="pb-16 sm:pb-20">
        <EventDetail event={event} />
      </SiteContainer>
    </>
  );
}
