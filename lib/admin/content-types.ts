import { Permissions, type Permission } from "@/server/domain/permissions";

export const CONTENT_TYPES = [
  "homepage",
  "timeline",
  "faqs",
  "puja-years",
  "committee-roster",
  "positions",
  "events",
  "announcements",
  "gallery",
  "gallery-media",
] as const;

export type ContentType = (typeof CONTENT_TYPES)[number];

export type ContentTypeMeta = {
  type: ContentType;
  label: string;
  description: string;
  readPermission: Permission;
  writePermission: Permission;
  supportsStatusFilter: boolean;
};

export const contentTypeMeta: Record<ContentType, ContentTypeMeta> = {
  homepage: {
    type: "homepage",
    label: "Homepage content",
    description: "Editable homepage section blocks (hero, intro, puja, etc.).",
    readPermission: Permissions.CONTENT_READ,
    writePermission: Permissions.CONTENT_WRITE,
    supportsStatusFilter: true,
  },
  timeline: {
    type: "timeline",
    label: "History timeline",
    description: "Club history timeline milestones shown on /history.",
    readPermission: Permissions.CONTENT_READ,
    writePermission: Permissions.CONTENT_WRITE,
    supportsStatusFilter: true,
  },
  faqs: {
    type: "faqs",
    label: "FAQs",
    description: "Frequently asked questions on the public FAQ page.",
    readPermission: Permissions.CONTENT_READ,
    writePermission: Permissions.CONTENT_WRITE,
    supportsStatusFilter: true,
  },
  "puja-years": {
    type: "puja-years",
    label: "Saraswati Puja years",
    description: "Annual archive cards for the Saraswati Puja page.",
    readPermission: Permissions.PUJA_READ,
    writePermission: Permissions.PUJA_WRITE,
    supportsStatusFilter: true,
  },
  "committee-roster": {
    type: "committee-roster",
    label: "Committee members",
    description: "Public roster (names and roles only).",
    readPermission: Permissions.CONTENT_READ,
    writePermission: Permissions.CONTENT_WRITE,
    supportsStatusFilter: true,
  },
  positions: {
    type: "positions",
    label: "Committee positions",
    description: "Operational committee position definitions.",
    readPermission: Permissions.COMMITTEE_READ,
    writePermission: Permissions.COMMITTEE_WRITE,
    supportsStatusFilter: false,
  },
  events: {
    type: "events",
    label: "Events",
    description: "Public calendar events with draft/published/archived states.",
    readPermission: Permissions.EVENTS_READ,
    writePermission: Permissions.EVENTS_WRITE,
    supportsStatusFilter: true,
  },
  announcements: {
    type: "announcements",
    label: "Announcements",
    description: "Official notices for members and the community.",
    readPermission: Permissions.ANNOUNCEMENTS_READ,
    writePermission: Permissions.ANNOUNCEMENTS_WRITE,
    supportsStatusFilter: true,
  },
  gallery: {
    type: "gallery",
    label: "Gallery albums",
    description: "Photo/video albums for the public gallery.",
    readPermission: Permissions.GALLERY_READ,
    writePermission: Permissions.GALLERY_WRITE,
    supportsStatusFilter: true,
  },
  "gallery-media": {
    type: "gallery-media",
    label: "Gallery media",
    description: "Individual media items inside albums.",
    readPermission: Permissions.GALLERY_READ,
    writePermission: Permissions.GALLERY_WRITE,
    supportsStatusFilter: true,
  },
};

export function isContentType(value: string): value is ContentType {
  return (CONTENT_TYPES as readonly string[]).includes(value);
}
