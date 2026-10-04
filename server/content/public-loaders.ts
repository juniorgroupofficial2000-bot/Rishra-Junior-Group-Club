import "server-only";

/**
 * Public content loaders — database is the single source of truth.
 *
 * File modules under `content/*` may supply brand shell copy or seed fixtures.
 * They must NOT be used as runtime fallbacks that invent members, events,
 * announcements, gallery albums, or archive years on empty databases.
 */

import {
  type Announcement,
  type AnnouncementCategory,
  type AnnouncementPriority,
} from "@/content/announcements";
import {
  type CommitteeMember,
  type CommitteeRoleKey,
} from "@/content/committee";
import { type ClubEvent } from "@/content/events";
import { type GalleryAlbum } from "@/content/gallery";
import { homeContent as brandHomeShell } from "@/content/home";
import {
  type ContentProvenance,
  type HeritageMedia,
  type PujaArchiveYear,
  type PujaDocumentLink,
  type PujaScheduleItem,
  type PujaVideoLink,
  type TimelineEntry,
} from "@/content/heritage";
import { includeSampleContent, isSampleProvenance } from "@/content/include-sample";
import type { MediaItem } from "@/content/shared/media";
import {
  computeLiveStatus,
  PUJA_STAGE_LABELS,
} from "@/lib/puja/status";
import { prisma } from "@/server/db/prisma";
import { cache } from "react";

function allowSample() {
  return includeSampleContent();
}

function asProvenance(value: string): ContentProvenance {
  if (value === "verified" || value === "sample" || value === "placeholder") {
    return value;
  }
  return "placeholder";
}

function asMedia(value: unknown): HeritageMedia | undefined {
  if (!value || typeof value !== "object") return undefined;
  const m = value as Record<string, unknown>;
  if (typeof m.src !== "string" || typeof m.alt !== "string") return undefined;
  return {
    id: typeof m.id === "string" ? m.id : "media",
    src: m.src,
    alt: m.alt,
    width: typeof m.width === "number" ? m.width : 1600,
    height: typeof m.height === "number" ? m.height : 1000,
    caption: typeof m.caption === "string" ? m.caption : undefined,
    category: typeof m.category === "string" ? m.category : undefined,
    provenance: asProvenance(String(m.provenance ?? "placeholder")),
  };
}

function asMediaList(value: unknown): HeritageMedia[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const items = value.map(asMedia).filter(Boolean) as HeritageMedia[];
  return items.length ? items : undefined;
}

function asHighlights(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  return value.filter((v): v is string => typeof v === "string");
}

function asDocuments(value: unknown): PujaDocumentLink[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const items = value
    .map((row) => {
      if (!row || typeof row !== "object") return null;
      const r = row as Record<string, unknown>;
      if (typeof r.title !== "string" || typeof r.url !== "string") return null;
      return { title: r.title, url: r.url };
    })
    .filter(Boolean) as PujaDocumentLink[];
  return items.length ? items : undefined;
}

function asVideos(value: unknown): PujaVideoLink[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const items = value
    .map((row) => {
      if (!row || typeof row !== "object") return null;
      const r = row as Record<string, unknown>;
      if (typeof r.title !== "string" || typeof r.url !== "string") return null;
      return {
        title: r.title,
        url: r.url,
        poster: typeof r.poster === "string" ? r.poster : undefined,
      };
    })
    .filter(Boolean) as PujaVideoLink[];
  return items.length ? items : undefined;
}

function mapScheduleItems(
  rows: Array<{
    id: string;
    stage: string;
    title: string;
    description: string | null;
    startsAt: Date | null;
    endsAt: Date | null;
    sortOrder: number;
  }>,
  now = new Date(),
): PujaScheduleItem[] {
  return rows.map((item) => ({
    id: item.id,
    stage: item.stage,
    stageLabel: PUJA_STAGE_LABELS[item.stage] ?? item.stage,
    title: item.title,
    description: item.description ?? undefined,
    startsAt: item.startsAt?.toISOString(),
    endsAt: item.endsAt?.toISOString(),
    sortOrder: item.sortOrder,
    liveStatus: computeLiveStatus(item.startsAt, item.endsAt, now),
  }));
}

function mapPujaYearRow(
  row: {
    id: string;
    year: number;
    title: string;
    summary: string;
    theme: string | null;
    startsOn: Date | null;
    endsOn: Date | null;
    locationLabel: string | null;
    locationDetail: string | null;
    committeeNote: string | null;
    highlights: unknown;
    coverJson: unknown;
    galleryJson: unknown;
    videosJson: unknown;
    documentsJson: unknown;
    href: string | null;
    provenance: string;
    coverAsset: {
      id: string;
      deletedAt: Date | null;
      status: string;
      alt: string;
      width: number | null;
      height: number | null;
      caption: string | null;
    } | null;
    scheduleItems?: Array<{
      id: string;
      stage: string;
      title: string;
      description: string | null;
      startsAt: Date | null;
      endsAt: Date | null;
      sortOrder: number;
      status: string;
      deletedAt: Date | null;
    }>;
  },
  now = new Date(),
): PujaArchiveYear {
  const cover =
    row.coverAsset &&
    row.coverAsset.deletedAt == null &&
    row.coverAsset.status === "READY"
      ? row.coverAsset
      : null;
  const schedule = mapScheduleItems(
    (row.scheduleItems ?? [])
      .filter((item) => item.deletedAt == null && item.status === "PUBLISHED")
      .sort((a, b) => a.sortOrder - b.sortOrder || a.title.localeCompare(b.title)),
    now,
  );
  return {
    id: row.id,
    year: row.year,
    title: row.title,
    summary: row.summary,
    theme: row.theme ?? undefined,
    startsOn: row.startsOn?.toISOString(),
    endsOn: row.endsOn?.toISOString(),
    locationLabel: row.locationLabel ?? undefined,
    locationDetail: row.locationDetail ?? undefined,
    committeeNote: row.committeeNote ?? undefined,
    coverImage: cover
      ? {
          id: cover.id,
          // List/card surfaces prefer thumbnails; detail pages may upgrade.
          src: `/api/media/${cover.id}?v=thumb`,
          alt: cover.alt,
          width: cover.width ?? 1600,
          height: cover.height ?? 1000,
          caption: cover.caption ?? undefined,
          provenance: asProvenance(row.provenance),
        }
      : asMedia(row.coverJson),
    highlights: asHighlights(row.highlights),
    gallery: asMediaList(row.galleryJson),
    videos: asVideos(row.videosJson),
    documents: asDocuments(row.documentsJson),
    schedule: schedule.length ? schedule : undefined,
    liveStatus: computeLiveStatus(row.startsOn, row.endsOn, now),
    href: row.href ?? `/saraswati-puja/${row.year}`,
    published: true,
    provenance: asProvenance(row.provenance),
  };
}

/**
 * Homepage section copy.
 * Brand shell (`content/home.ts`) holds verified club narrative only — not
 * people lists or calendar items. CMS `SiteContentBlock` rows overlay sections
 * once an admin publishes them.
 */
export async function loadPublishedHomeContent() {
  const [blocks, heroAsset] = await Promise.all([
    prisma.siteContentBlock.findMany({
      where: { deletedAt: null, status: "PUBLISHED" },
      orderBy: { sortOrder: "asc" },
    }),
    loadHeroMediaBySlot("home.hero"),
  ]);

  const base = brandHomeShell as unknown as Record<
    string,
    Record<string, unknown>
  >;
  const overlay: Record<string, unknown> = { ...base };

  for (const block of blocks) {
    const sectionKey = block.key.replace(/^home\./, "");
    const existing = base[sectionKey];
    if (
      existing &&
      block.body &&
      typeof block.body === "object" &&
      !Array.isArray(block.body)
    ) {
      overlay[sectionKey] = {
        ...existing,
        ...(block.body as Record<string, unknown>),
      };
    }
  }

  // Prefer a READY HERO asset assigned to slot `home.hero` over brand placeholders.
  if (heroAsset) {
    const hero = (overlay.hero ?? base.hero ?? {}) as Record<string, unknown>;
    const image = (hero.image ?? {}) as Record<string, unknown>;
    overlay.hero = {
      ...hero,
      image: {
        ...image,
        id: heroAsset.id,
        src: heroAsset.src,
        srcMobile: heroAsset.srcMobile ?? heroAsset.src,
        alt: heroAsset.alt || String(image.alt ?? "Club hero photograph"),
        width: heroAsset.width,
        height: heroAsset.height,
      },
    };
  }

  return overlay as unknown as typeof brandHomeShell;
}

export async function loadPublishedTimelineEntries(): Promise<TimelineEntry[]> {
  const rows = await prisma.timelineEntry.findMany({
    where: { deletedAt: null, status: "PUBLISHED" },
    orderBy: [{ sortOrder: "asc" }, { yearLabel: "asc" }],
  });

  return rows
    .filter((row) => allowSample() || !isSampleProvenance(asProvenance(row.provenance)))
    .map((row) => ({
      id: row.id,
      year: row.yearLabel,
      date: row.date ?? undefined,
      title: row.title,
      description: row.description,
      image: asMedia(row.imageJson),
      gallery: asMediaList(row.galleryJson),
      milestone: row.milestone,
      sortOrder: row.sortOrder,
      published: true,
      provenance: asProvenance(row.provenance),
    }));
}

export async function loadPublishedFaqItems(): Promise<
  Array<{ id: string; question: string; answer: string; sortOrder: number }>
> {
  return prisma.faqItem.findMany({
    where: { deletedAt: null, status: "PUBLISHED" },
    orderBy: [{ sortOrder: "asc" }, { question: "asc" }],
    select: { id: true, question: true, answer: true, sortOrder: true },
  });
}

export async function loadPublishedPujaYears(): Promise<PujaArchiveYear[]> {
  const now = new Date();
  const rows = await prisma.pujaYear.findMany({
    where: { deletedAt: null, status: "PUBLISHED" },
    include: {
      coverAsset: true,
      scheduleItems: {
        where: { deletedAt: null, status: "PUBLISHED" },
        orderBy: [{ sortOrder: "asc" }, { startsAt: "asc" }],
      },
    },
    orderBy: [{ year: "desc" }, { sortOrder: "asc" }],
  });

  return rows
    .filter(
      (row) =>
        allowSample() || !isSampleProvenance(asProvenance(row.provenance)),
    )
    .map((row) => mapPujaYearRow(row, now));
}

export async function loadPublishedPujaYearByYear(
  year: number,
): Promise<PujaArchiveYear | null> {
  const now = new Date();
  const row = await prisma.pujaYear.findFirst({
    where: {
      year,
      deletedAt: null,
      status: "PUBLISHED",
      ...(allowSample() ? {} : { isSample: false }),
    },
    include: {
      coverAsset: true,
      scheduleItems: {
        where: { deletedAt: null, status: "PUBLISHED" },
        orderBy: [{ sortOrder: "asc" }, { startsAt: "asc" }],
      },
    },
  });

  if (!row) return null;
  if (
    !allowSample() &&
    isSampleProvenance(asProvenance(row.provenance))
  ) {
    return null;
  }
  return mapPujaYearRow(row, now);
}

/** Published hero image for a site slot (e.g. home.hero). */
export async function loadHeroMediaBySlot(slotKey: string) {
  const asset = await prisma.mediaAsset.findFirst({
    where: {
      slotKey,
      purpose: "HERO",
      status: "READY",
      deletedAt: null,
    },
  });
  if (!asset) return null;
  return {
    id: asset.id,
    src: `/api/media/${asset.id}?v=lg`,
    srcMobile: `/api/media/${asset.id}?v=md`,
    alt: asset.alt,
    width: asset.width ?? 2400,
    height: asset.height ?? 1600,
    caption: asset.caption,
  };
}

export const loadPublishedCommitteeMembers = cache(async (): Promise<
  CommitteeMember[]
> => {
  const rows = await prisma.publicCommitteeMember.findMany({
    where: { deletedAt: null, status: "PUBLISHED" },
    include: { portraitAsset: true },
    orderBy: [{ sortOrder: "asc" }, { displayName: "asc" }],
  });

  return rows.map((row) => {
    const portrait =
      row.portraitAsset &&
      row.portraitAsset.deletedAt == null &&
      row.portraitAsset.status === "READY"
        ? row.portraitAsset
        : null;
    return {
      id: row.id,
      roleKey: row.roleKey as CommitteeRoleKey,
      role: row.roleTitle,
      name: row.name,
      familiarName: row.familiarName ?? undefined,
      displayName: row.displayName,
      biography: row.biography ?? undefined,
      termYear: row.termYear ?? undefined,
      sortOrder: row.sortOrder,
      published: true,
      portraitSrc: portrait ? `/api/media/${portrait.id}?v=sm` : undefined,
      portraitAlt: portrait?.alt,
    };
  });
});

function mediaFromAlbum(input: {
  id: string;
  url: string;
  alt: string | null;
  caption: string | null;
  type: string;
}): MediaItem {
  return {
    id: input.id,
    kind: input.type === "VIDEO" ? "video" : "image",
    src: input.url,
    alt: input.alt ?? input.caption ?? "Gallery media",
    width: 1600,
    height: 1000,
    caption: input.caption ?? undefined,
    provenance: "verified",
  };
}

function mapEventRow(row: {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  startsAt: Date;
  endsAt: Date | null;
  venueLabel: string | null;
  registrationRequired?: boolean;
  capacity?: number | null;
  isSample: boolean;
  coverAsset: {
    id: string;
    deletedAt: Date | null;
    status: string;
    alt: string;
    width: number | null;
    height: number | null;
    caption: string | null;
  } | null;
}): ClubEvent {
  const cover =
    row.coverAsset &&
    row.coverAsset.deletedAt == null &&
    row.coverAsset.status === "READY"
      ? row.coverAsset
      : null;
  const registrationEnabled = Boolean(row.registrationRequired);
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    summary: row.description?.slice(0, 180) ?? "",
    description: row.description ? [row.description] : [],
    startsAt: row.startsAt.toISOString(),
    endsAt: row.endsAt?.toISOString(),
    venue: {
      name: row.venueLabel ?? "Club premises",
      addressLines: [],
    },
    coverImage: cover
      ? {
          id: cover.id,
          kind: "image" as const,
          src: `/api/media/${cover.id}?v=md`,
          alt: cover.alt,
          width: cover.width ?? 1600,
          height: cover.height ?? 1000,
          caption: cover.caption ?? undefined,
          provenance: "verified" as ContentProvenance,
        }
      : undefined,
    gallery: [],
    registration: registrationEnabled
      ? {
          enabled: true,
          label: "Register in member portal",
          href: "/member/events",
          note:
            row.capacity != null
              ? `Capacity ${row.capacity}. Active members can register after signing in.`
              : "Active members can register after signing in.",
        }
      : {
          enabled: false,
          label: "Enquire",
          href: "/contact",
          note: "Online registration is not required for this event.",
        },
    sortOrder: 0,
    published: true,
    provenance: (row.isSample ? "sample" : "verified") as ContentProvenance,
  };
}

function albumCoverFromRow(row: {
  id: string;
  title: string;
  coverUrl: string | null;
  coverAlt: string | null;
  isSample: boolean;
  media: Array<{
    id: string;
    url: string;
    alt: string | null;
    caption: string | null;
    type: string;
    mediaAsset: {
      id: string;
      deletedAt: Date | null;
      status: string;
      alt: string;
      caption: string | null;
    } | null;
  }>;
}): MediaItem | null {
  if (row.coverUrl) {
    return {
      id: `${row.id}-cover`,
      kind: "image",
      src: row.coverUrl,
      alt: row.coverAlt ?? row.title,
      width: 1600,
      height: 1000,
      provenance: row.isSample ? "sample" : "verified",
    };
  }
  const first = row.media[0];
  if (first) {
    const asset =
      first.mediaAsset &&
      first.mediaAsset.deletedAt == null &&
      first.mediaAsset.status === "READY"
        ? first.mediaAsset
        : null;
    return mediaFromAlbum({
      id: first.id,
      url: asset ? `/api/media/${asset.id}?v=thumb` : first.url,
      alt: asset?.alt ?? first.alt,
      caption: asset?.caption ?? first.caption,
      type: first.type,
    });
  }
  // No invented cover art — list UI renders a cover-less empty surface.
  return null;
}

/**
 * Album list/summary — cover + count only (no full media join).
 * Use `loadPublishedAlbumBySlug` for detail pages.
 */
export const loadPublishedAlbums = cache(async (): Promise<GalleryAlbum[]> => {
  const rows = await prisma.galleryAlbum.findMany({
    where: {
      deletedAt: null,
      contentStatus: "PUBLISHED",
      ...(allowSample() ? {} : { isSample: false }),
    },
    include: {
      media: {
        where: {
          deletedAt: null,
          contentStatus: "PUBLISHED",
        },
        include: { mediaAsset: true },
        orderBy: { sortOrder: "asc" },
        take: 1,
      },
      _count: {
        select: {
          media: {
            where: { deletedAt: null, contentStatus: "PUBLISHED" },
          },
        },
      },
    },
    orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
  });

  return rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description ?? "",
    year: row.year ?? undefined,
    coverImage: albumCoverFromRow(row) ?? undefined,
    media: [],
    mediaCount: row._count.media,
    sortOrder: row.sortOrder,
    published: true,
    provenance: (row.isSample ? "sample" : "verified") as ContentProvenance,
  }));
});

export const loadPublishedAlbumBySlug = cache(
  async (slug: string): Promise<GalleryAlbum | null> => {
    const row = await prisma.galleryAlbum.findFirst({
      where: {
        slug,
        deletedAt: null,
        contentStatus: "PUBLISHED",
        ...(allowSample() ? {} : { isSample: false }),
      },
      include: {
        media: {
          where: {
            deletedAt: null,
            contentStatus: "PUBLISHED",
          },
          include: { mediaAsset: true },
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    if (!row) return null;

    const media = row.media.map((m) => {
      const asset =
        m.mediaAsset &&
        m.mediaAsset.deletedAt == null &&
        m.mediaAsset.status === "READY"
          ? m.mediaAsset
          : null;
      return mediaFromAlbum({
        id: m.id,
        // Album grids use sm; lightbox/detail can request larger via UI.
        url: asset ? `/api/media/${asset.id}?v=sm` : m.url,
        alt: asset?.alt ?? m.alt,
        caption: asset?.caption ?? m.caption,
        type: m.type,
      });
    });

    return {
      id: row.id,
      slug: row.slug,
      title: row.title,
      description: row.description ?? "",
      year: row.year ?? undefined,
      coverImage: albumCoverFromRow(row) ?? undefined,
      media,
      mediaCount: media.length,
      sortOrder: row.sortOrder,
      published: true,
      provenance: (row.isSample ? "sample" : "verified") as ContentProvenance,
    };
  },
);

export const loadPublishedEvents = cache(async (): Promise<ClubEvent[]> => {
  const rows = await prisma.event.findMany({
    where: {
      deletedAt: null,
      contentStatus: "PUBLISHED",
      ...(allowSample() ? {} : { isSample: false }),
    },
    include: { coverAsset: true },
    orderBy: { startsAt: "asc" },
  });

  return rows.map(mapEventRow);
});

export const loadUpcomingEvents = cache(async (): Promise<ClubEvent[]> => {
  const events = await loadPublishedEvents();
  const now = Date.now();
  return events
    .filter((e) => new Date(e.endsAt ?? e.startsAt).getTime() >= now)
    .sort(
      (a, b) =>
        new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
    );
});

export const loadPastEvents = cache(async (): Promise<ClubEvent[]> => {
  const events = await loadPublishedEvents();
  const now = Date.now();
  return events
    .filter((e) => new Date(e.endsAt ?? e.startsAt).getTime() < now)
    .sort(
      (a, b) =>
        new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime(),
    );
});

export const loadPublishedEventBySlug = cache(
  async (slug: string): Promise<ClubEvent | null> => {
    const row = await prisma.event.findFirst({
      where: {
        slug,
        deletedAt: null,
        contentStatus: "PUBLISHED",
        ...(allowSample() ? {} : { isSample: false }),
      },
      include: { coverAsset: true },
    });

    if (!row) return null;
    return mapEventRow(row);
  },
);

function announcementPublicWhere(now: Date) {
  return {
    deletedAt: null as null,
    ...(allowSample() ? {} : { isSample: false }),
    OR: [
      { status: "PUBLISHED" as const },
      {
        status: "SCHEDULED" as const,
        publishedAt: { lte: now },
      },
    ],
  };
}

function mapAnnouncementRow(row: {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  body: string;
  publishedAt: Date | null;
  createdAt: Date;
  category: string;
  priority: string;
  pinned: boolean;
  sortOrder: number;
  isSample: boolean;
}): Announcement {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    summary: row.summary ?? row.body.slice(0, 160),
    body: row.body.split(/\n\n+/).filter(Boolean),
    publishedAt: (row.publishedAt ?? row.createdAt).toISOString(),
    category: (row.category as AnnouncementCategory) || "general",
    priority: (row.priority as AnnouncementPriority) || "NORMAL",
    pinned: row.pinned,
    sortOrder: row.sortOrder,
    published: true,
    provenance: (row.isSample ? "sample" : "verified") as ContentProvenance,
  };
}

export const loadPublishedAnnouncements = cache(
  async (filters?: {
    category?: string;
    q?: string;
  }): Promise<Announcement[]> => {
    const now = new Date();
    const category = filters?.category?.trim();
    const q = filters?.q?.trim();
    const rows = await prisma.announcement.findMany({
      where: {
        ...announcementPublicWhere(now),
        ...(category ? { category } : {}),
        ...(q
          ? {
              OR: [
                { title: { contains: q, mode: "insensitive" } },
                { summary: { contains: q, mode: "insensitive" } },
                { body: { contains: q, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      orderBy: [
        { pinned: "desc" },
        { priority: "desc" },
        { sortOrder: "asc" },
        { publishedAt: "desc" },
      ],
    });

    return rows.map(mapAnnouncementRow);
  },
);

export const loadPublishedAnnouncementBySlug = cache(
  async (slug: string): Promise<Announcement | null> => {
    const now = new Date();
    const row = await prisma.announcement.findFirst({
      where: {
        slug,
        ...announcementPublicWhere(now),
      },
    });

    if (!row) return null;
    return mapAnnouncementRow(row);
  },
);
