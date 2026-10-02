import { EventCard } from "@/components/club/event-card";
import { ProvenanceBadge } from "@/components/heritage/provenance-badge";
import { FadeIn, Stagger, StaggerItem } from "@/components/motion/fade-in";
import {
  formatEventDateRange,
  getEventTemporalStatus,
  type ClubEvent,
} from "@/content/events";

export function EventList({
  events,
  emptyLabel,
}: {
  events: ClubEvent[];
  emptyLabel: string;
}) {
  if (events.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border-strong px-5 py-8 text-sm text-ink-500">
        {emptyLabel}
      </p>
    );
  }

  return (
    <Stagger className="grid gap-4 md:grid-cols-2">
      {events.map((event) => {
        const status = getEventTemporalStatus(event);
        return (
          <StaggerItem key={event.id}>
            <FadeIn>
              <div className="relative">
                <div className="absolute right-4 top-4 z-10">
                  <ProvenanceBadge provenance={event.provenance} />
                </div>
                <EventCard
                  title={event.title}
                  description={event.summary}
                  dateLabel={formatEventDateRange(event)}
                  locationLabel={event.venue.name}
                  status={status}
                  href={`/events/${event.slug}`}
                />
              </div>
            </FadeIn>
          </StaggerItem>
        );
      })}
    </Stagger>
  );
}
