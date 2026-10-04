import { EventDetail } from "@/components/events";
import { SiteContainer } from "@/components/public";
import { EventCountdown } from "@/components/public/event-countdown";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { eventsPageCopy } from "@/content/events";
import { JsonLd } from "@/lib/json-ld";
import { buildMetadata, notFoundMetadata } from "@/lib/seo/metadata";
import {
  breadcrumbJsonLd,
  eventJsonLd,
  organizationJsonLd,
} from "@/lib/seo/structured-data";
import {
  loadPublishedEventBySlug,
  loadPublishedEvents,
} from "@/server/content/public-loaders";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  try {
    const events = await loadPublishedEvents();
    return events.map((event) => ({ slug: event.slug }));
  } catch {
    // Build hosts may lack DB access; pages still render on demand.
    return [];
  }
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = await loadPublishedEventBySlug(slug);
  if (!event) return notFoundMetadata("Event not found");

  return buildMetadata({
    title: event.title.replace(/^\[SAMPLE\]\s*/i, ""),
    description: event.summary,
    path: `/events/${event.slug}`,
    ogType: "article",
    publishedTime: event.startsAt,
    noIndex: event.provenance === "sample",
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
  const event = await loadPublishedEventBySlug(slug);
  if (!event) notFound();

  const title = event.title.replace(/^\[SAMPLE\]\s*/i, "");

  return (
    <>
      <JsonLd
        data={[
          organizationJsonLd(),
          eventJsonLd(event),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: eventsPageCopy.title, path: "/events" },
            { name: title, path: `/events/${event.slug}` },
          ]),
        ]}
      />
      <SiteContainer as="header" className="pt-8 sm:pt-10">
        <Breadcrumbs
          className="mb-6"
          items={[
            { label: "Home", href: "/" },
            { label: eventsPageCopy.title, href: "/events" },
            { label: title },
          ]}
        />
      </SiteContainer>
      <SiteContainer className="min-w-0 space-y-8 pb-16 sm:pb-20">
        <EventCountdown
          title={title}
          href={`/events/${event.slug}`}
          startsAt={event.startsAt}
          endsAt={event.endsAt}
        />
        <EventDetail event={event} />
      </SiteContainer>
    </>
  );
}
