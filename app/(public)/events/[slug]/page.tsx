import { EventDetail } from "@/components/events";
import { SiteContainer } from "@/components/public";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import {
  eventsPageCopy,
  getEventBySlug,
  getPublishedEvents,
} from "@/content/events";
import { JsonLd } from "@/lib/json-ld";
import { buildMetadata } from "@/lib/seo/metadata";
import {
  breadcrumbJsonLd,
  eventJsonLd,
  organizationJsonLd,
} from "@/lib/seo/structured-data";
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
  if (!event) return { title: "Event not found", robots: { index: false } };

  return buildMetadata({
    title: event.title.replace(/^\[SAMPLE\]\s*/i, ""),
    description: event.summary,
    path: `/events/${event.slug}`,
    ogType: "article",
    image: event.coverImage
      ? {
          url: event.coverImage.src,
          width: event.coverImage.width,
          height: event.coverImage.height,
          alt: event.coverImage.alt,
        }
      : undefined,
  });
}

export default async function EventDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const event = getEventBySlug(slug);
  if (!event) notFound();

  return (
    <>
      <JsonLd
        data={[
          organizationJsonLd(),
          eventJsonLd(event),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: eventsPageCopy.title, path: "/events" },
            { name: event.title.replace(/^\[SAMPLE\]\s*/i, ""), path: `/events/${event.slug}` },
          ]),
        ]}
      />
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
      <SiteContainer className="min-w-0 pb-16 sm:pb-20">
        <EventDetail event={event} />
      </SiteContainer>
    </>
  );
}
