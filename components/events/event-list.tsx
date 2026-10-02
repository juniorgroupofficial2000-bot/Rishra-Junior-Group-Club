"use client";

import { EventCard } from "@/components/club/event-card";
import { ProvenanceBadge } from "@/components/heritage/provenance-badge";
import { AlternatingReveal } from "@/components/motion";
import {
  formatEventDateRange,
  getEventTemporalStatus,
  type ClubEvent,
} from "@/content/events";
import { motion, useReducedMotion } from "motion/react";

export function EventList({
  events,
  emptyLabel,
}: {
  events: ClubEvent[];
  emptyLabel: string;
}) {
  const reduce = Boolean(useReducedMotion());

  if (events.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border-strong px-5 py-8 text-sm text-ink-500">
        {emptyLabel}
      </p>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {events.map((event, index) => {
        const status = getEventTemporalStatus(event);
        return (
          <AlternatingReveal key={event.id} index={index}>
            <motion.div
              className="relative"
              whileHover={reduce ? undefined : { y: -4 }}
              transition={{ duration: 0.28 }}
            >
              <motion.div
                className="absolute right-4 top-4 z-10"
                initial={reduce ? false : { scale: 0.85, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.15, type: "spring", stiffness: 260, damping: 18 }}
              >
                <ProvenanceBadge provenance={event.provenance} />
              </motion.div>
              <EventCard
                title={event.title}
                description={event.summary}
                dateLabel={formatEventDateRange(event)}
                locationLabel={event.venue.name}
                status={status}
                href={`/events/${event.slug}`}
              />
            </motion.div>
          </AlternatingReveal>
        );
      })}
    </div>
  );
}
