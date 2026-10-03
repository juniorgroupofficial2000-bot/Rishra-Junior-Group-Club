import {
  includeSampleContent,
  isSampleProvenance,
} from "@/content/include-sample";
import { siteConfig } from "./site";
import type { ContentProvenance, MediaItem } from "./shared/media";

/**
 * Event types + SAMPLE seed fixtures.
 * Runtime pages use Prisma via `loadPublishedEvents()` — not these arrays.
 */

export type EventRegistration = {
  /** When false, CTA invites enquiry / waitlist messaging */
  enabled: boolean;
  label: string;
  href: string;
  note?: string;
};

export type ClubEvent = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description: string[];
  /** ISO 8601 start */
  startsAt: string;
  /** ISO 8601 end (optional) */
  endsAt?: string;
  venue: {
    name: string;
    addressLines: string[];
  };
  coverImage?: MediaItem;
  gallery: MediaItem[];
  registration: EventRegistration;
  sortOrder: number;
  published: boolean;
  provenance: ContentProvenance;
};

export type EventTemporalStatus = "upcoming" | "ongoing" | "past";

export const eventsPageCopy = {
  eyebrow: "Calendar",
  title: "Events",
  description:
    "Upcoming and past club events. SAMPLE entries are labelled and not confirmed schedule.",
} as const;

const sampleImg = (
  id: string,
  src: string,
  alt: string,
): MediaItem => ({
  id,
  kind: "image",
  src,
  alt,
  width: 1600,
  height: 1000,
  provenance: "sample",
});

export const clubEvents: ClubEvent[] = [
  {
    id: "evt-sample-upcoming-puja",
    slug: "sample-saraswati-puja-gathering",
    title: "[SAMPLE] Saraswati Puja gathering",
    summary:
      "[SAMPLE] Illustrative upcoming celebration entry for listing and detail pages.",
    description: [
      "[SAMPLE] Full event description would appear here — programme notes, participation guidance, and hospitality details once confirmed by the committee.",
      "[PLACEHOLDER: Verified event copy.]",
    ],
    startsAt: "2026-02-01T09:00:00+05:30",
    endsAt: "2026-02-01T18:00:00+05:30",
    venue: {
      name: siteConfig.name,
      addressLines: [
        siteConfig.address.line1,
        siteConfig.address.line2,
        siteConfig.address.line3,
      ],
    },
    coverImage: sampleImg(
      "evt-up-cover",
      "/images/events/cover-upcoming.svg",
      "SAMPLE cover for upcoming event",
    ),
    gallery: [
      {
        id: "evt-up-g1",
        kind: "image",
        src: "/images/events/media-01.svg",
        alt: "SAMPLE event gallery image",
        width: 1200,
        height: 900,
        caption: "[SAMPLE] Caption",
        provenance: "sample",
      },
    ],
    registration: {
      enabled: false,
      label: "Enquire about attending",
      href: "/contact",
      note: "Online event registration is not enabled yet.",
    },
    sortOrder: 10,
    published: true,
    provenance: "sample",
  },
  {
    id: "evt-sample-upcoming-meet",
    slug: "sample-members-meeting",
    title: "[SAMPLE] Members meeting",
    summary: "[SAMPLE] Example upcoming members meeting card.",
    description: [
      "[SAMPLE] Agenda and attendance notes will be published when confirmed.",
    ],
    startsAt: "2026-04-12T17:00:00+05:30",
    venue: {
      name: siteConfig.name,
      addressLines: [siteConfig.address.line1, siteConfig.address.line2],
    },
    coverImage: sampleImg(
      "evt-meet-cover",
      "/images/events/cover-upcoming.svg",
      "SAMPLE cover for members meeting",
    ),
    gallery: [],
    registration: {
      enabled: false,
      label: "Contact for details",
      href: "/contact",
    },
    sortOrder: 20,
    published: true,
    provenance: "sample",
  },
  {
    id: "evt-sample-past-cultural",
    slug: "sample-cultural-evening",
    title: "[SAMPLE] Cultural evening",
    summary: "[SAMPLE] Example past event for archive listing.",
    description: [
      "[SAMPLE] Recap of a past cultural programme. Replace with verified notes and photographs.",
    ],
    startsAt: "2024-11-16T16:00:00+05:30",
    endsAt: "2024-11-16T21:00:00+05:30",
    venue: {
      name: siteConfig.name,
      addressLines: [
        siteConfig.address.line1,
        siteConfig.address.line2,
        siteConfig.address.line3,
      ],
    },
    coverImage: sampleImg(
      "evt-past-cover",
      "/images/events/cover-past.svg",
      "SAMPLE cover for past event",
    ),
    gallery: [
      {
        id: "evt-past-g1",
        kind: "image",
        src: "/images/events/media-01.svg",
        alt: "SAMPLE past event gallery image",
        width: 1200,
        height: 900,
        provenance: "sample",
      },
    ],
    registration: {
      enabled: false,
      label: "View related gallery",
      href: "/gallery/cultural-program",
      note: "Registration closed for past events.",
    },
    sortOrder: 30,
    published: true,
    provenance: "sample",
  },
];

export function getEventTemporalStatus(
  event: ClubEvent,
  now = new Date(),
): EventTemporalStatus {
  const start = new Date(event.startsAt);
  const end = event.endsAt ? new Date(event.endsAt) : start;
  if (now < start) return "upcoming";
  if (now > end) return "past";
  return "ongoing";
}

export function formatEventDateRange(event: ClubEvent): string {
  const start = new Date(event.startsAt);
  const end = event.endsAt ? new Date(event.endsAt) : null;
  const dateFmt = new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const timeFmt = new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  });

  const datePart = dateFmt.format(start);
  const timePart = end
    ? `${timeFmt.format(start)} – ${timeFmt.format(end)}`
    : timeFmt.format(start);
  return `${datePart} · ${timePart}`;
}

export function getPublishedEvents(): ClubEvent[] {
  const allowSample = includeSampleContent();
  return [...clubEvents]
    .filter((event) => event.published)
    .filter(
      (event) => allowSample || !isSampleProvenance(event.provenance),
    )
    .sort(
      (a, b) =>
        new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime(),
    );
}

export function getUpcomingEvents(now = new Date()): ClubEvent[] {
  return getPublishedEvents()
    .filter((event) => getEventTemporalStatus(event, now) !== "past")
    .sort(
      (a, b) =>
        new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
    );
}

export function getPastEvents(now = new Date()): ClubEvent[] {
  return getPublishedEvents().filter(
    (event) => getEventTemporalStatus(event, now) === "past",
  );
}

export function getEventBySlug(slug: string): ClubEvent | undefined {
  return getPublishedEvents().find((event) => event.slug === slug);
}
