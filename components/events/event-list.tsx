"use client";

import { ProvenanceBadge } from "@/components/heritage/provenance-badge";
import { Reveal } from "@/components/motion";
import { EmptyState } from "@/components/public/empty-state";
import {
  formatEventDateRange,
  getEventTemporalStatus,
  type ClubEvent,
} from "@/content/events";
import { cn } from "@/lib/cn";
import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";

export function EventList({
  events,
  emptyLabel,
  featured = false,
}: {
  events: ClubEvent[];
  emptyLabel: string;
  /** First event gets an editorial lead treatment */
  featured?: boolean;
}) {
  const reduce = Boolean(useReducedMotion());

  if (events.length === 0) {
    return (
      <EmptyState
        title={emptyLabel}
        description="Published dates from the club calendar appear here. Nothing is invented when the calendar is empty."
        action={{ label: "View announcements", href: "/announcements" }}
        secondaryAction={{ label: "Contact the club", href: "/contact" }}
      />
    );
  }

  const [lead, ...rest] = featured ? events : [null, ...events];
  const rows = featured ? rest : events;

  return (
    <div className="space-y-10">
      {lead ? (
        <Reveal>
          <Link
            href={`/events/${lead.slug}`}
            className="group grid gap-6 border-y border-border-subtle py-8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:grid-cols-[1fr_1.2fr] lg:gap-12 lg:py-12"
          >
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="type-caption text-alta-600">
                  {getEventTemporalStatus(lead)}
                </span>
                <ProvenanceBadge provenance={lead.provenance} />
              </div>
              <h3 className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink-900 transition-colors group-hover:text-alta-600 sm:text-4xl">
                {lead.title.replace(/^\[SAMPLE\]\s*/i, "")}
              </h3>
              <p className="mt-3 font-mono text-sm text-ink-400">
                {formatEventDateRange(lead)}
              </p>
              <p className="mt-1 text-sm text-ink-500">{lead.venue.name}</p>
            </div>
            <p className="max-w-xl self-center text-base leading-relaxed text-ink-600">
              {lead.summary}
            </p>
          </Link>
        </Reveal>
      ) : null}

      <ul className="divide-y divide-border-subtle border-y border-border-subtle">
        {rows.map((event, index) => {
          if (!event) return null;
          const status = getEventTemporalStatus(event);
          return (
            <motion.li
              key={event.id}
              initial={reduce ? false : { opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-8% 0px" }}
              transition={{ duration: 0.45, delay: index * 0.05 }}
            >
              <Link
                href={`/events/${event.slug}`}
                className={cn(
                  "group grid gap-2 py-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:grid-cols-[8rem_1fr_auto] sm:items-baseline sm:gap-6",
                )}
              >
                <time
                  dateTime={event.startsAt}
                  className="font-mono text-xs text-ink-400 sm:text-sm"
                >
                  {formatEventDateRange(event)}
                </time>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display text-xl font-semibold tracking-tight text-ink-900 transition-colors group-hover:text-alta-600">
                      {event.title.replace(/^\[SAMPLE\]\s*/i, "")}
                    </h3>
                    <ProvenanceBadge provenance={event.provenance} />
                  </div>
                  <p className="mt-1 text-sm text-ink-500">
                    {event.venue.name}
                    <span className="mx-2 text-ink-300">·</span>
                    <span className="capitalize">{status}</span>
                  </p>
                </div>
                <span
                  aria-hidden
                  className="hidden text-sm font-medium text-ink-400 transition-transform group-hover:translate-x-0.5 sm:inline"
                >
                  →
                </span>
              </Link>
            </motion.li>
          );
        })}
      </ul>
    </div>
  );
}
