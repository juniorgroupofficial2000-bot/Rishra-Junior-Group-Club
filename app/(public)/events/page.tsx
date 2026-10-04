import { EventList } from "@/components/events";
import { CatalogFilterBar } from "@/components/public/catalog-filter-bar";
import { EditorialPageHero } from "@/components/public/editorial-page-hero";
import { SiteContainer } from "@/components/public/site-container";
import { publicPages } from "@/content/pages";
import { JsonLd } from "@/lib/json-ld";
import { metadataForPublicPage } from "@/lib/seo/metadata";
import { webPageJsonLd } from "@/lib/seo/structured-data";
import {
  loadPastEvents,
  loadUpcomingEvents,
} from "@/server/content/public-loaders";

export const metadata = metadataForPublicPage("events");

function filterByQuery<T extends { title: string; summary?: string }>(
  items: T[],
  q?: string,
) {
  if (!q) return items;
  const needle = q.toLowerCase();
  return items.filter((item) => {
    const hay = `${item.title} ${item.summary ?? ""}`.toLowerCase();
    return hay.includes(needle);
  });
}

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const q = params.q?.trim() || undefined;
  const [upcomingRaw, pastRaw] = await Promise.all([
    loadUpcomingEvents(),
    loadPastEvents(),
  ]);
  const upcoming = filterByQuery(upcomingRaw, q);
  const past = filterByQuery(pastRaw, q);
  const page = publicPages.events;

  return (
    <>
      <JsonLd
        data={webPageJsonLd({
          path: page.path,
          name: `${page.title} · Rishra Junior Group Club`,
          description: page.description,
          breadcrumbs: [
            { name: "Home", path: "/" },
            { name: page.title, path: page.path },
          ],
        })}
      />
      <EditorialPageHero
        layout="plain"
        crumbs={[
          { label: "Home", href: "/" },
          { label: page.title },
        ]}
        eyebrow={page.eyebrow}
        title={page.title}
        description={page.description}
      />

      <SiteContainer className="space-y-16 pb-20 sm:pb-28">
        <CatalogFilterBar action="/events" query={q} />

        <section aria-labelledby="upcoming-events-heading">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <h2
              id="upcoming-events-heading"
              className="font-display text-3xl font-semibold tracking-tight text-ink-900"
            >
              Upcoming
            </h2>
            <p className="text-sm text-ink-500">
              Published by the committee — dates from the live calendar.
            </p>
          </div>
          <EventList
            events={upcoming}
            featured
            emptyLabel="No upcoming events match these filters."
          />
        </section>

        <section aria-labelledby="past-events-heading">
          <h2
            id="past-events-heading"
            className="font-display text-3xl font-semibold tracking-tight text-ink-900"
          >
            Archive
          </h2>
          <p className="mt-2 text-sm text-ink-500">
            Previous gatherings kept for the public record.
          </p>
          <div className="mt-6">
            <EventList
              events={past}
              emptyLabel="No past events match these filters."
            />
          </div>
        </section>
      </SiteContainer>
    </>
  );
}
