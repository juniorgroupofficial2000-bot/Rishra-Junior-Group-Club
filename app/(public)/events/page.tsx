import { EventList } from "@/components/events";
import { PublicPageShell } from "@/components/public";
import {
  eventsPageCopy,
  getPastEvents,
  getUpcomingEvents,
} from "@/content/events";
import { siteConfig } from "@/content/site";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Events",
  description: eventsPageCopy.description,
  alternates: { canonical: "/events" },
  openGraph: {
    title: `Events · ${siteConfig.name}`,
    description: eventsPageCopy.description,
    url: "/events",
    type: "website",
  },
};

export default function EventsPage() {
  const upcoming = getUpcomingEvents();
  const past = getPastEvents();

  return (
    <PublicPageShell pageKey="events">
      <div className="space-y-14">
        <section aria-labelledby="upcoming-events-heading">
          <h2
            id="upcoming-events-heading"
            className="font-display text-2xl font-semibold tracking-tight text-ink-900"
          >
            Upcoming events
          </h2>
          <p className="mt-2 text-sm text-ink-500">
            Confirmed and SAMPLE upcoming listings.
          </p>
          <div className="mt-6">
            <EventList
              events={upcoming}
              emptyLabel="No upcoming events published yet."
            />
          </div>
        </section>

        <section aria-labelledby="past-events-heading">
          <h2
            id="past-events-heading"
            className="font-display text-2xl font-semibold tracking-tight text-ink-900"
          >
            Past events
          </h2>
          <p className="mt-2 text-sm text-ink-500">
            Archive of previous gatherings.
          </p>
          <div className="mt-6">
            <EventList
              events={past}
              emptyLabel="No past events published yet."
            />
          </div>
        </section>
      </div>
    </PublicPageShell>
  );
}
