import {
  includeSampleContent,
  isSampleProvenance,
} from "@/content/include-sample";
import type { ContentProvenance } from "./shared/media";

/**
 * Announcement types + SAMPLE seed fixtures.
 * Runtime pages use Prisma via `loadPublishedAnnouncements()`.
 */

export type AnnouncementCategory =
  | "general"
  | "events"
  | "membership"
  | "puja"
  | "urgent";

export type AnnouncementPriority = "NORMAL" | "HIGH" | "URGENT";

export type Announcement = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  body: string[];
  /** ISO date (date-only or datetime) */
  publishedAt: string;
  category: AnnouncementCategory;
  priority: AnnouncementPriority;
  pinned: boolean;
  sortOrder: number;
  published: boolean;
  provenance: ContentProvenance;
};

export const announcementPriorityLabel: Record<AnnouncementPriority, string> = {
  NORMAL: "Normal",
  HIGH: "High",
  URGENT: "Urgent",
};

export const announcementCategoryLabel: Record<AnnouncementCategory, string> = {
  general: "General",
  events: "Events",
  membership: "Membership",
  puja: "Saraswati Puja",
  urgent: "Urgent",
};

export const announcementsPageCopy = {
  eyebrow: "Updates",
  title: "Announcements",
  description:
    "Official notices for members and the wider community. SAMPLE announcements are labelled.",
} as const;

export const announcements: Announcement[] = [
  {
    id: "ann-sample-pinned",
    slug: "sample-welcome-to-the-digital-platform",
    title: "[SAMPLE] Welcome to the digital platform",
    summary:
      "[SAMPLE] Pinned notice demonstrating how important updates stay at the top of the list.",
    body: [
      "[SAMPLE] This pinned announcement shows the layout for high-priority club notices.",
      "Replace with a verified announcement from the committee. Personal contact details should not be published in announcement bodies.",
    ],
    publishedAt: "2026-01-15",
    category: "general",
    priority: "HIGH",
    pinned: true,
    sortOrder: 10,
    published: true,
    provenance: "sample",
  },
  {
    id: "ann-sample-puja",
    slug: "sample-saraswati-puja-preparations",
    title: "[SAMPLE] Saraswati Puja preparations",
    summary:
      "[SAMPLE] Example category announcement related to the annual celebration.",
    body: [
      "[SAMPLE] Preparation updates, volunteer calls, and schedule notes would appear here once confirmed.",
      "[PLACEHOLDER: Verified puja announcement copy.]",
    ],
    publishedAt: "2025-12-20",
    category: "puja",
    priority: "NORMAL",
    pinned: false,
    sortOrder: 20,
    published: true,
    provenance: "sample",
  },
  {
    id: "ann-sample-membership",
    slug: "sample-membership-enquiries",
    title: "[SAMPLE] Membership enquiries",
    summary:
      "[SAMPLE] Points readers to the membership information page without inventing pricing.",
    body: [
      "[SAMPLE] Those interested in joining can learn about the enquiry process on the Membership page and reach the club via Contact.",
    ],
    publishedAt: "2025-11-02",
    category: "membership",
    priority: "NORMAL",
    pinned: false,
    sortOrder: 30,
    published: true,
    provenance: "sample",
  },
  {
    id: "ann-sample-events",
    slug: "sample-calendar-note",
    title: "[SAMPLE] Calendar note",
    summary: "[SAMPLE] Example events-category announcement.",
    body: [
      "[SAMPLE] Event reminders will link to the Events section when real dates are published.",
    ],
    publishedAt: "2025-10-10",
    category: "events",
    priority: "NORMAL",
    pinned: false,
    sortOrder: 40,
    published: true,
    provenance: "sample",
  },
];

export function formatAnnouncementDate(iso: string): string {
  const date = new Date(iso.includes("T") ? iso : `${iso}T00:00:00+05:30`);
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function getPublishedAnnouncements(): Announcement[] {
  const allowSample = includeSampleContent();
  return [...announcements]
    .filter((item) => item.published)
    .filter((item) => allowSample || !isSampleProvenance(item.provenance))
    .sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      const byDate =
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      if (byDate !== 0) return byDate;
      return a.sortOrder - b.sortOrder;
    });
}

export function getAnnouncementBySlug(slug: string): Announcement | undefined {
  return getPublishedAnnouncements().find((item) => item.slug === slug);
}

export function getPinnedAnnouncements(): Announcement[] {
  return getPublishedAnnouncements().filter((item) => item.pinned);
}
