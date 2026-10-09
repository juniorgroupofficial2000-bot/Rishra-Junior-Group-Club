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
import type {
  CommitteeSearchHit,
  MemberCommitteeInvolvement,
  PublicCommitteeCard,
  PublicCommitteeDetail,
  PublicCommitteeSeat,
} from "@/content/org-committees";
import { designationLabel } from "@/server/domain/committee-designations";
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

/** Return fallback when Postgres is unset/unreachable (Vercel misconfig, cold boot). */
async function withDbFallback<T>(
  label: string,
  run: () => Promise<T>,
  fallback: T,
): Promise<T> {
  // Skip Prisma entirely when DATABASE_URL is empty — avoids build-time
  // "Validation Error Count: 1" crashes on Vercel prerender.
  if (!process.env.DATABASE_URL?.trim()) {
    return fallback;
  }
  try {
    return await run();
  } catch (error) {
    console.error(`[public-loaders] ${label} failed; using fallback.`, error);
    return fallback;
  }
}

function asProvenance(value: string): ContentProvenance {
  if (value === "verified" || value === "sample" || value === "placeholder") {
    return value;
  }
  return "placeholder";
}

/** Prefer real JPG photography when CMS/seed rows still point at SVG placeholders. */
function resolvePublicImageSrc(src: string): string {
  if (!src.startsWith("/images/") || !src.endsWith(".svg")) return src;
  return src.replace(/\.svg$/i, ".jpg");
}

function asMedia(value: unknown): HeritageMedia | undefined {
  if (!value || typeof value !== "object") return undefined;
  const m = value as Record<string, unknown>;
  if (typeof m.src !== "string" || typeof m.alt !== "string") return undefined;
  return {
    id: typeof m.id === "string" ? m.id : "media",
    src: resolvePublicImageSrc(m.src),
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
 * Prefer brand photography over CMS bodies that still reference SVG placeholders.
 * Preserves brand fields such as hero `videoSrc` when the overlay is incomplete.
 */
function preferBrandMedia(
  brandImage: Record<string, unknown> | undefined,
  overlayImage: unknown,
): Record<string, unknown> | undefined {
  if (!brandImage && (overlayImage == null || typeof overlayImage !== "object")) {
    return undefined;
  }
  const overlay =
    overlayImage && typeof overlayImage === "object" && !Array.isArray(overlayImage)
      ? (overlayImage as Record<string, unknown>)
      : {};
  const brand = brandImage ?? {};
  const overlaySrc = typeof overlay.src === "string" ? overlay.src : "";
  const overlayIsPlaceholder = !overlaySrc || overlaySrc.endsWith(".svg");

  if (overlayIsPlaceholder) {
    return { ...overlay, ...brand };
  }
  return { ...brand, ...overlay };
}

/**
 * Homepage section copy.
 * Brand shell (`content/home.ts`) holds verified club narrative only — not
 * people lists or calendar items. CMS `SiteContentBlock` rows overlay sections
 * once an admin publishes them.
 */
export async function loadPublishedHomeContent() {
  return withDbFallback("loadPublishedHomeContent", async () => {
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
        const body = block.body as Record<string, unknown>;
        const merged: Record<string, unknown> = {
          ...existing,
          ...body,
        };
        // Keep brand photography when CMS still points at SVG placeholders,
        // and preserve hero videoSrc from the brand shell.
        merged.image = preferBrandMedia(
          existing.image as Record<string, unknown> | undefined,
          body.image,
        );
        overlay[sectionKey] = merged;
      }
    }

    // Prefer a READY HERO asset assigned to slot `home.hero` over brand placeholders.
    if (heroAsset) {
      const hero = (overlay.hero ?? base.hero ?? {}) as Record<string, unknown>;
      const image = (hero.image ?? {}) as Record<string, unknown>;
      const brandHeroImage = (base.hero?.image ?? {}) as Record<string, unknown>;
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
          // Keep cinematic brand video unless the managed asset replaces it.
          videoSrc: brandHeroImage.videoSrc,
        },
      };
    }

    return overlay as unknown as typeof brandHomeShell;
  }, brandHomeShell);
}

export async function loadPublishedTimelineEntries(): Promise<TimelineEntry[]> {
  return withDbFallback("loadPublishedTimelineEntries", async () => {
    const rows = await prisma.timelineEntry.findMany({
      where: { deletedAt: null, status: "PUBLISHED" },
      orderBy: [{ sortOrder: "asc" }, { yearLabel: "asc" }],
    });

    return rows
      .filter(
        (row) =>
          allowSample() || !isSampleProvenance(asProvenance(row.provenance)),
      )
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
  }, []);
}

export async function loadPublishedFaqItems(): Promise<
  Array<{ id: string; question: string; answer: string; sortOrder: number }>
> {
  return withDbFallback(
    "loadPublishedFaqItems",
    () =>
      prisma.faqItem.findMany({
        where: { deletedAt: null, status: "PUBLISHED" },
        orderBy: [{ sortOrder: "asc" }, { question: "asc" }],
        select: { id: true, question: true, answer: true, sortOrder: true },
      }),
    [],
  );
}

export async function loadPublishedPujaYears(): Promise<PujaArchiveYear[]> {
  return withDbFallback("loadPublishedPujaYears", async () => {
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
  }, []);
}

export async function loadPublishedPujaYearByYear(
  year: number,
): Promise<PujaArchiveYear | null> {
  return withDbFallback("loadPublishedPujaYearByYear", async () => {
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
    if (!allowSample() && isSampleProvenance(asProvenance(row.provenance))) {
      return null;
    }
    return mapPujaYearRow(row, now);
  }, null);
}

/** Published hero image for a site slot (e.g. home.hero). */
export async function loadHeroMediaBySlot(slotKey: string) {
  return withDbFallback("loadHeroMediaBySlot", async () => {
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
  }, null);
}

function readyMediaSrc(
  asset:
    | {
        id: string;
        alt: string;
        deletedAt: Date | null;
        status: string;
      }
    | null
    | undefined,
  variant: "sm" | "md" | "lg" = "sm",
) {
  if (!asset || asset.deletedAt != null || asset.status !== "READY") {
    return null;
  }
  return {
    src: `/api/media/${asset.id}?v=${variant}`,
    alt: asset.alt,
  };
}

function toExecutiveRoleKey(designation: string): CommitteeRoleKey {
  const known: CommitteeRoleKey[] = [
    "president",
    "vice_president",
    "secretary",
    "treasurer",
    "executive_member",
  ];
  return (known as string[]).includes(designation)
    ? (designation as CommitteeRoleKey)
    : "executive_member";
}

function mapSeat(row: {
  id: string;
  designation: string;
  designationLabel: string | null;
  shortBio: string | null;
  displayOrder: number;
  member: {
    id: string;
    displayName: string;
    firstName: string;
    lastName: string;
    portraitAsset: {
      id: string;
      alt: string;
      deletedAt: Date | null;
      status: string;
    } | null;
  };
  committeeTermYear?: number | null;
}): PublicCommitteeSeat {
  const portrait = readyMediaSrc(row.member.portraitAsset, "sm");
  return {
    id: row.id,
    memberId: row.member.id,
    designation: row.designation,
    role: designationLabel(row.designation, row.designationLabel),
    displayName: row.member.displayName,
    name: `${row.member.firstName} ${row.member.lastName}`.trim(),
    shortBio: row.shortBio ?? undefined,
    displayOrder: row.displayOrder,
    portraitSrc: portrait?.src,
    portraitAlt: portrait?.alt,
    termYear: row.committeeTermYear ?? undefined,
  };
}

/**
 * Executive roster for homepage / legacy consumers.
 * Prefers Committee(kind=EXECUTIVE) memberships; falls back to PublicCommitteeMember.
 */
export const loadPublishedCommitteeMembers = cache(async (): Promise<
  CommitteeMember[]
> => {
  return withDbFallback("loadPublishedCommitteeMembers", async () => {
    const executive = await prisma.committee.findFirst({
      where: {
        kind: "EXECUTIVE",
        deletedAt: null,
        status: "PUBLISHED",
      },
      include: {
        memberships: {
          where: { deletedAt: null, status: "PUBLISHED" },
          include: {
            member: { include: { portraitAsset: true } },
          },
          orderBy: [{ displayOrder: "asc" }],
        },
      },
    });

    if (executive && executive.memberships.length > 0) {
      return executive.memberships.map((row) => {
        const portrait = readyMediaSrc(row.member.portraitAsset, "sm");
        const roleKey = toExecutiveRoleKey(row.designation);
        return {
          id: row.id,
          roleKey,
          role: designationLabel(row.designation, row.designationLabel),
          name: `${row.member.firstName} ${row.member.lastName}`.trim(),
          displayName: row.member.displayName,
          biography: row.shortBio ?? undefined,
          termYear: executive.termYear ?? undefined,
          sortOrder: row.displayOrder,
          published: true,
          portraitSrc: portrait?.src,
          portraitAlt: portrait?.alt,
        } satisfies CommitteeMember;
      });
    }

    const rows = await prisma.publicCommitteeMember.findMany({
      where: { deletedAt: null, status: "PUBLISHED" },
      include: { portraitAsset: true },
      orderBy: [{ sortOrder: "asc" }, { displayName: "asc" }],
    });

    return rows.map((row) => {
      const portrait = readyMediaSrc(row.portraitAsset, "sm");
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
        portraitSrc: portrait?.src,
        portraitAlt: portrait?.alt,
      };
    });
  }, []);
});

export const loadPublishedCommittees = cache(async (): Promise<
  PublicCommitteeCard[]
> => {
  return withDbFallback("loadPublishedCommittees", async () => {
    const rows = await prisma.committee.findMany({
      where: { deletedAt: null, status: "PUBLISHED" },
      include: {
        coverAsset: true,
        imageAsset: true,
        _count: {
          select: {
            memberships: {
              where: { deletedAt: null, status: "PUBLISHED" },
            },
          },
        },
      },
      orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
    });

    return rows.map((row) => {
      const cover = readyMediaSrc(row.coverAsset, "lg");
      const image = readyMediaSrc(row.imageAsset, "lg") ?? cover;
      return {
        id: row.id,
        slug: row.slug,
        name: row.name,
        summary: row.summary ?? undefined,
        description: row.description ?? undefined,
        iconKey: row.iconKey ?? undefined,
        kind: row.kind,
        termYear: row.termYear ?? undefined,
        memberCount: row._count.memberships,
        displayOrder: row.displayOrder,
        coverSrc: cover?.src,
        coverAlt: cover?.alt,
        imageSrc: image?.src,
        imageAlt: image?.alt,
      };
    });
  }, []);
});

export const loadPublishedSubCommittees = cache(async (): Promise<
  PublicCommitteeDetail[]
> => {
  return withDbFallback("loadPublishedSubCommittees", async () => {
    const rows = await prisma.committee.findMany({
      where: { deletedAt: null, status: "PUBLISHED", kind: "SUB" },
      include: {
        coverAsset: true,
        imageAsset: true,
        memberships: {
          where: { deletedAt: null, status: "PUBLISHED" },
          include: {
            member: { include: { portraitAsset: true } },
          },
          orderBy: [{ displayOrder: "asc" }],
        },
      },
      orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
    });

    return rows.map((row) => {
      const seats = row.memberships.map((membership) =>
        mapSeat({ ...membership, committeeTermYear: row.termYear }),
      );
      const cover = readyMediaSrc(row.coverAsset, "lg");
      const image = readyMediaSrc(row.imageAsset, "lg") ?? cover;
      return {
        id: row.id,
        slug: row.slug,
        name: row.name,
        summary: row.summary ?? undefined,
        description: row.description ?? undefined,
        responsibilities: row.responsibilities ?? undefined,
        iconKey: row.iconKey ?? undefined,
        kind: row.kind,
        termYear: row.termYear ?? undefined,
        memberCount: seats.length,
        displayOrder: row.displayOrder,
        coverSrc: cover?.src,
        coverAlt: cover?.alt,
        imageSrc: image?.src,
        imageAlt: image?.alt,
        seats,
        chairperson: seats.find((seat) => seat.designation === "chairperson"),
        convenor: seats.find((seat) => seat.designation === "convenor"),
        events: [],
        announcements: [],
      };
    });
  }, []);
});

export const loadPublishedCommitteeBySlug = cache(
  async (slug: string): Promise<PublicCommitteeDetail | null> => {
    return withDbFallback(
      "loadPublishedCommitteeBySlug",
      async () => {
        const row = await prisma.committee.findFirst({
          where: { slug, deletedAt: null, status: "PUBLISHED" },
          include: {
            coverAsset: true,
            imageAsset: true,
            memberships: {
              where: { deletedAt: null, status: "PUBLISHED" },
              include: {
                member: { include: { portraitAsset: true } },
              },
              orderBy: [{ displayOrder: "asc" }],
            },
            events: {
              where: {
                deletedAt: null,
                published: true,
                contentStatus: "PUBLISHED",
              },
              orderBy: { startsAt: "desc" },
              take: 8,
              select: {
                id: true,
                slug: true,
                title: true,
                startsAt: true,
              },
            },
            announcements: {
              where: {
                deletedAt: null,
                status: "PUBLISHED",
              },
              orderBy: { publishedAt: "desc" },
              take: 8,
              select: {
                id: true,
                slug: true,
                title: true,
                publishedAt: true,
              },
            },
          },
        });

        if (!row) return null;

        const seats = row.memberships.map((m) =>
          mapSeat({ ...m, committeeTermYear: row.termYear }),
        );
        const cover = readyMediaSrc(row.coverAsset, "lg");
        const image = readyMediaSrc(row.imageAsset, "lg") ?? cover;

        return {
          id: row.id,
          slug: row.slug,
          name: row.name,
          summary: row.summary ?? undefined,
          description: row.description ?? undefined,
          responsibilities: row.responsibilities ?? undefined,
          iconKey: row.iconKey ?? undefined,
          kind: row.kind,
          termYear: row.termYear ?? undefined,
          memberCount: seats.length,
          displayOrder: row.displayOrder,
          coverSrc: cover?.src,
          coverAlt: cover?.alt,
          imageSrc: image?.src,
          imageAlt: image?.alt,
          seats,
          chairperson: seats.find((s) => s.designation === "chairperson"),
          convenor: seats.find((s) => s.designation === "convenor"),
          events: row.events.map((event) => ({
            id: event.id,
            slug: event.slug,
            title: event.title,
            startsAt: event.startsAt.toISOString(),
          })),
          announcements: row.announcements.map((item) => ({
            id: item.id,
            slug: item.slug,
            title: item.title,
            publishedAt: item.publishedAt?.toISOString(),
          })),
        };
      },
      null,
    );
  },
);

export const loadCommitteeSearchIndex = cache(
  async (): Promise<CommitteeSearchHit[]> => {
    return withDbFallback("loadCommitteeSearchIndex", async () => {
      const rows = await prisma.committeeMembership.findMany({
        where: {
          deletedAt: null,
          status: "PUBLISHED",
          committee: { deletedAt: null, status: "PUBLISHED" },
        },
        include: {
          member: { select: { displayName: true } },
          committee: { select: { name: true, slug: true } },
        },
        orderBy: [{ displayOrder: "asc" }],
      });

      return rows.map((row) => ({
        id: row.id,
        displayName: row.member.displayName,
        role: designationLabel(row.designation, row.designationLabel),
        committeeName: row.committee.name,
        committeeSlug: row.committee.slug,
      }));
    }, []);
  },
);

export const loadMemberCommitteeInvolvement = cache(
  async (memberId: string): Promise<MemberCommitteeInvolvement[]> => {
    return withDbFallback(
      "loadMemberCommitteeInvolvement",
      async () => {
        const rows = await prisma.committeeMembership.findMany({
          where: {
            memberId,
            deletedAt: null,
            status: "PUBLISHED",
            committee: { deletedAt: null, status: "PUBLISHED" },
          },
          include: {
            committee: {
              select: {
                id: true,
                slug: true,
                name: true,
                termYear: true,
                termStart: true,
                termEnd: true,
              },
            },
          },
          orderBy: [{ displayOrder: "asc" }],
        });

        return rows.map((row) => {
          let termLabel: string | undefined;
          if (row.committee.termYear) {
            termLabel = `Term ${row.committee.termYear}`;
          } else if (row.committee.termStart || row.committee.termEnd) {
            const start = row.committee.termStart
              ? row.committee.termStart.getFullYear()
              : null;
            const end = row.committee.termEnd
              ? row.committee.termEnd.getFullYear()
              : null;
            if (start && end) termLabel = `${start}–${end}`;
            else if (start) termLabel = `From ${start}`;
          }
          return {
            committeeId: row.committee.id,
            committeeSlug: row.committee.slug,
            committeeName: row.committee.name,
            designation: row.designation,
            role: designationLabel(row.designation, row.designationLabel),
            termLabel,
          };
        });
      },
      [],
    );
  },
);

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
  return withDbFallback("loadPublishedAlbums", async () => {
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
  }, []);
});

export const loadPublishedAlbumBySlug = cache(
  async (slug: string): Promise<GalleryAlbum | null> => {
    return withDbFallback("loadPublishedAlbumBySlug", async () => {
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
    }, null);
  },
);

export const loadPublishedEvents = cache(async (): Promise<ClubEvent[]> => {
  return withDbFallback("loadPublishedEvents", async () => {
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
  }, []);
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
    return withDbFallback("loadPublishedEventBySlug", async () => {
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
    }, null);
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
    return withDbFallback("loadPublishedAnnouncements", async () => {
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
    }, []);
  },
);

export const loadPublishedAnnouncementBySlug = cache(
  async (slug: string): Promise<Announcement | null> => {
    return withDbFallback("loadPublishedAnnouncementBySlug", async () => {
      const now = new Date();
      const row = await prisma.announcement.findFirst({
        where: {
          slug,
          ...announcementPublicWhere(now),
        },
      });

      if (!row) return null;
      return mapAnnouncementRow(row);
    }, null);
  },
);
