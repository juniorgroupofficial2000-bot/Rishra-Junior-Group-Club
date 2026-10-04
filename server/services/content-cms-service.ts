import "server-only";

import { AuditActions } from "@/server/audit/actions";
import {
  announcementContentSchema,
  committeePositionSchema,
  eventContentSchema,
  faqItemSchema,
  galleryAlbumSchema,
  galleryMediaSchema,
  publicCommitteeMemberSchema,
  pujaYearSchema,
  siteContentBlockSchema,
  timelineEntrySchema,
} from "@/server/content/validation";
import { prisma } from "@/server/db/prisma";
import { writeAuditEvent } from "@/server/services/audit-service";
import { Prisma, type ContentStatus } from "@prisma/client";
import { z } from "zod";

function jsonOrDbNull(value: unknown): Prisma.InputJsonValue | typeof Prisma.DbNull {
  return value == null ? Prisma.DbNull : (value as Prisma.InputJsonValue);
}

export class ContentCmsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ContentCmsError";
  }
}

function parseOrThrow<T>(schema: z.ZodType<T>, raw: unknown): T {
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    throw new ContentCmsError(
      parsed.error.issues[0]?.message ?? "Invalid content payload.",
    );
  }
  return parsed.data;
}

async function auditContentChange(input: {
  actorUserId: string | null;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: Record<string, unknown>;
}) {
  await writeAuditEvent({
    actorUserId: input.actorUserId,
    action: input.action,
    entityType: input.entityType,
    entityId: input.entityId,
    metadata: input.metadata,
  });
}

type SoftDeletable = {
  id: string;
  historicallyImportant: boolean;
  deletedAt: Date | null;
};

async function softDeleteProtected(
  row: SoftDeletable | null,
  entityLabel: string,
): Promise<void> {
  if (!row || row.deletedAt) {
    throw new ContentCmsError(`${entityLabel} not found.`);
  }
  if (row.historicallyImportant) {
    throw new ContentCmsError(
      `Cannot delete historically important ${entityLabel}. Archive it instead.`,
    );
  }
}

function publishedFlag(status: ContentStatus): boolean {
  return status === "PUBLISHED";
}

// ─── Site content blocks ─────────────────────────────────────────────────────

export async function upsertSiteContentBlock(
  raw: unknown,
  actorUserId: string | null,
  id?: string,
) {
  const data = parseOrThrow(siteContentBlockSchema, raw);
  const body = data.body as Prisma.InputJsonValue;

  const row = id
    ? await prisma.siteContentBlock.update({
        where: { id },
        data: {
          ...data,
          body,
          summary: data.summary ?? null,
          updatedById: actorUserId,
        },
      })
    : await prisma.siteContentBlock.create({
        data: {
          ...data,
          body,
          summary: data.summary ?? null,
          createdById: actorUserId,
          updatedById: actorUserId,
        },
      });

  await auditContentChange({
    actorUserId,
    action: id
      ? AuditActions.CONTENT_UPDATED
      : AuditActions.CONTENT_CREATED,
    entityType: "SiteContentBlock",
    entityId: row.id,
    metadata: { key: row.key, status: row.status },
  });

  return row;
}

export async function softDeleteSiteContentBlock(
  id: string,
  actorUserId: string | null,
) {
  const existing = await prisma.siteContentBlock.findFirst({
    where: { id, deletedAt: null },
  });
  await softDeleteProtected(existing, "homepage block");

  const row = await prisma.siteContentBlock.update({
    where: { id },
    data: { deletedAt: new Date(), updatedById: actorUserId },
  });

  await auditContentChange({
    actorUserId,
    action: AuditActions.CONTENT_DELETED,
    entityType: "SiteContentBlock",
    entityId: row.id,
    metadata: { key: row.key },
  });
  return row;
}

// ─── Timeline ────────────────────────────────────────────────────────────────

export async function upsertTimelineEntry(
  raw: unknown,
  actorUserId: string | null,
  id?: string,
) {
  const data = parseOrThrow(timelineEntrySchema, raw);
  const payload = {
    yearLabel: data.yearLabel,
    date: data.date ?? null,
    title: data.title,
    description: data.description,
    imageJson: jsonOrDbNull(data.imageJson),
    galleryJson: jsonOrDbNull(data.galleryJson),
    milestone: data.milestone,
    sortOrder: data.sortOrder,
    status: data.status,
    provenance: data.provenance,
    historicallyImportant: data.historicallyImportant,
    isSample: data.isSample,
  };

  const row = id
    ? await prisma.timelineEntry.update({
        where: { id },
        data: { ...payload, updatedById: actorUserId },
      })
    : await prisma.timelineEntry.create({
        data: { ...payload, createdById: actorUserId, updatedById: actorUserId },
      });

  await auditContentChange({
    actorUserId,
    action: id
      ? AuditActions.CONTENT_UPDATED
      : AuditActions.CONTENT_CREATED,
    entityType: "TimelineEntry",
    entityId: row.id,
    metadata: { title: row.title, status: row.status },
  });
  return row;
}

export async function softDeleteTimelineEntry(
  id: string,
  actorUserId: string | null,
) {
  const existing = await prisma.timelineEntry.findFirst({
    where: { id, deletedAt: null },
  });
  await softDeleteProtected(existing, "timeline entry");

  const row = await prisma.timelineEntry.update({
    where: { id },
    data: { deletedAt: new Date(), updatedById: actorUserId },
  });

  await auditContentChange({
    actorUserId,
    action: AuditActions.CONTENT_DELETED,
    entityType: "TimelineEntry",
    entityId: row.id,
    metadata: { title: row.title },
  });
  return row;
}

// ─── FAQs ────────────────────────────────────────────────────────────────────

export async function upsertFaqItem(
  raw: unknown,
  actorUserId: string | null,
  id?: string,
) {
  const data = parseOrThrow(faqItemSchema, raw);
  const row = id
    ? await prisma.faqItem.update({
        where: { id },
        data: { ...data, updatedById: actorUserId },
      })
    : await prisma.faqItem.create({
        data: { ...data, createdById: actorUserId, updatedById: actorUserId },
      });

  await auditContentChange({
    actorUserId,
    action: id
      ? AuditActions.CONTENT_UPDATED
      : AuditActions.CONTENT_CREATED,
    entityType: "FaqItem",
    entityId: row.id,
    metadata: { question: row.question, status: row.status },
  });
  return row;
}

export async function softDeleteFaqItem(
  id: string,
  actorUserId: string | null,
) {
  const existing = await prisma.faqItem.findFirst({
    where: { id, deletedAt: null },
  });
  await softDeleteProtected(existing, "FAQ");

  const row = await prisma.faqItem.update({
    where: { id },
    data: { deletedAt: new Date(), updatedById: actorUserId },
  });

  await auditContentChange({
    actorUserId,
    action: AuditActions.CONTENT_DELETED,
    entityType: "FaqItem",
    entityId: row.id,
  });
  return row;
}

// ─── Puja years ──────────────────────────────────────────────────────────────

export async function upsertPujaYear(
  raw: unknown,
  actorUserId: string | null,
  id?: string,
) {
  const data = parseOrThrow(pujaYearSchema, raw);
  if (data.endsOn && data.startsOn && data.endsOn < data.startsOn) {
    throw new ContentCmsError("Puja end must be after start.");
  }

  const payload = {
    year: data.year,
    title: data.title,
    summary: data.summary,
    theme: data.theme ?? null,
    startsOn: data.startsOn ?? null,
    endsOn: data.endsOn ?? null,
    locationLabel: data.locationLabel ?? null,
    locationDetail: data.locationDetail ?? null,
    committeeNote: data.committeeNote ?? null,
    highlights: jsonOrDbNull(data.highlights),
    coverJson: jsonOrDbNull(data.coverJson),
    coverAssetId: data.coverAssetId ?? null,
    galleryJson: jsonOrDbNull(data.galleryJson),
    videosJson: jsonOrDbNull(data.videosJson),
    documentsJson: jsonOrDbNull(data.documentsJson),
    href: data.href ?? `/saraswati-puja/${data.year}`,
    sortOrder: data.sortOrder,
    status: data.status,
    provenance: data.provenance,
    historicallyImportant: data.historicallyImportant,
    isSample: data.isSample,
  };

  const row = await prisma.$transaction(async (tx) => {
    const saved = id
      ? await tx.pujaYear.update({
          where: { id },
          data: { ...payload, updatedById: actorUserId },
        })
      : await tx.pujaYear.create({
          data: {
            ...payload,
            createdById: actorUserId,
            updatedById: actorUserId,
          },
        });

    if (data.schedule) {
      await tx.pujaScheduleItem.updateMany({
        where: { pujaYearId: saved.id, deletedAt: null },
        data: { deletedAt: new Date() },
      });
      if (data.schedule.length > 0) {
        await tx.pujaScheduleItem.createMany({
          data: data.schedule.map((item, index) => ({
            pujaYearId: saved.id,
            stage: item.stage,
            title: item.title,
            description: item.description ?? null,
            startsAt: item.startsAt ?? null,
            endsAt: item.endsAt ?? null,
            sortOrder: item.sortOrder ?? index,
            status: item.status,
          })),
        });
      }
    }

    return saved;
  });

  await auditContentChange({
    actorUserId,
    action: id
      ? AuditActions.CONTENT_UPDATED
      : AuditActions.CONTENT_CREATED,
    entityType: "PujaYear",
    entityId: row.id,
    metadata: { year: row.year, status: row.status },
  });
  return row;
}

export async function softDeletePujaYear(
  id: string,
  actorUserId: string | null,
) {
  const existing = await prisma.pujaYear.findFirst({
    where: { id, deletedAt: null },
  });
  await softDeleteProtected(existing, "puja year");

  const row = await prisma.$transaction(async (tx) => {
    await tx.pujaScheduleItem.updateMany({
      where: { pujaYearId: id, deletedAt: null },
      data: { deletedAt: new Date() },
    });
    return tx.pujaYear.update({
      where: { id },
      data: { deletedAt: new Date(), updatedById: actorUserId },
    });
  });

  await auditContentChange({
    actorUserId,
    action: AuditActions.CONTENT_DELETED,
    entityType: "PujaYear",
    entityId: row.id,
    metadata: { year: row.year },
  });
  return row;
}

// ─── Public committee roster ─────────────────────────────────────────────────

export async function upsertPublicCommitteeMember(
  raw: unknown,
  actorUserId: string | null,
  id?: string,
) {
  const data = parseOrThrow(publicCommitteeMemberSchema, raw);
  const payload = {
    roleKey: data.roleKey,
    roleTitle: data.roleTitle,
    name: data.name,
    familiarName: data.familiarName ?? null,
    displayName: data.displayName,
    biography: data.biography ?? null,
    termYear: data.termYear ?? null,
    sortOrder: data.sortOrder,
    status: data.status,
    historicallyImportant: data.historicallyImportant,
    positionId: data.positionId ?? null,
    portraitAssetId: data.portraitAssetId ?? null,
  };

  const row = id
    ? await prisma.publicCommitteeMember.update({
        where: { id },
        data: { ...payload, updatedById: actorUserId },
      })
    : await prisma.publicCommitteeMember.create({
        data: { ...payload, createdById: actorUserId, updatedById: actorUserId },
      });

  await auditContentChange({
    actorUserId,
    action: id
      ? AuditActions.CONTENT_UPDATED
      : AuditActions.CONTENT_CREATED,
    entityType: "PublicCommitteeMember",
    entityId: row.id,
    metadata: { displayName: row.displayName, roleKey: row.roleKey },
  });
  return row;
}

export async function softDeletePublicCommitteeMember(
  id: string,
  actorUserId: string | null,
) {
  const existing = await prisma.publicCommitteeMember.findFirst({
    where: { id, deletedAt: null },
  });
  await softDeleteProtected(existing, "committee member");

  const row = await prisma.publicCommitteeMember.update({
    where: { id },
    data: { deletedAt: new Date(), updatedById: actorUserId },
  });

  await auditContentChange({
    actorUserId,
    action: AuditActions.CONTENT_DELETED,
    entityType: "PublicCommitteeMember",
    entityId: row.id,
    metadata: { displayName: row.displayName },
  });
  return row;
}

// ─── Committee positions ─────────────────────────────────────────────────────

export async function upsertCommitteePosition(
  raw: unknown,
  actorUserId: string | null,
  id?: string,
) {
  const data = parseOrThrow(committeePositionSchema, raw);
  const payload = {
    code: data.code,
    title: data.title,
    description: data.description ?? null,
    sortOrder: data.sortOrder,
    active: data.active,
    historicallyImportant: data.historicallyImportant,
  };

  const row = id
    ? await prisma.committeePosition.update({
        where: { id },
        data: payload,
      })
    : await prisma.committeePosition.create({ data: payload });

  await auditContentChange({
    actorUserId,
    action: AuditActions.COMMITTEE_UPDATED,
    entityType: "CommitteePosition",
    entityId: row.id,
    metadata: { code: row.code, active: row.active },
  });
  return row;
}

export async function softDeleteCommitteePosition(
  id: string,
  actorUserId: string | null,
) {
  const existing = await prisma.committeePosition.findFirst({
    where: { id, deletedAt: null },
  });
  await softDeleteProtected(existing, "committee position");

  const open = await prisma.committeeAssignment.count({
    where: { positionId: id, isCurrent: true, deletedAt: null },
  });
  if (open > 0) {
    throw new ContentCmsError(
      "Cannot delete a position with current assignments. End assignments first.",
    );
  }

  const row = await prisma.committeePosition.update({
    where: { id },
    data: { deletedAt: new Date(), active: false },
  });

  await auditContentChange({
    actorUserId,
    action: AuditActions.COMMITTEE_UPDATED,
    entityType: "CommitteePosition",
    entityId: row.id,
    metadata: { code: row.code, deleted: true },
  });
  return row;
}

// ─── Events / announcements / gallery ────────────────────────────────────────

export async function upsertEventContent(
  raw: unknown,
  actorUserId: string | null,
  id?: string,
) {
  const data = parseOrThrow(eventContentSchema, raw);
  if (data.endsAt && data.endsAt < data.startsAt) {
    throw new ContentCmsError("Event end must be after start.");
  }

  const previous = id
    ? await prisma.event.findFirst({ where: { id, deletedAt: null } })
    : null;

  const payload = {
    slug: data.slug,
    title: data.title,
    description: data.description ?? null,
    startsAt: data.startsAt,
    endsAt: data.endsAt ?? null,
    venueLabel: data.venueLabel ?? null,
    category: data.category,
    status: data.status,
    contentStatus: data.contentStatus,
    published: publishedFlag(data.contentStatus),
    registrationRequired: data.registrationRequired,
    capacity: data.capacity ?? null,
    coverAssetId: data.coverAssetId ?? null,
    historicallyImportant: data.historicallyImportant,
    isSample: data.isSample,
    updatedById: actorUserId,
  };

  const row = id
    ? await prisma.event.update({ where: { id }, data: payload })
    : await prisma.event.create({
        data: { ...payload, createdById: actorUserId },
      });

  let action: string = id
    ? AuditActions.EVENT_MODIFIED
    : AuditActions.CONTENT_CREATED;
  if (
    previous &&
    previous.contentStatus !== row.contentStatus &&
    row.contentStatus === "PUBLISHED"
  ) {
    action = AuditActions.CONTENT_PUBLISHED;
  } else if (
    previous &&
    previous.contentStatus !== row.contentStatus &&
    row.contentStatus === "ARCHIVED"
  ) {
    action = AuditActions.CONTENT_ARCHIVED;
  }

  await auditContentChange({
    actorUserId,
    action,
    entityType: "Event",
    entityId: row.id,
    metadata: {
      slug: row.slug,
      contentStatus: row.contentStatus,
      status: row.status,
      category: row.category,
    },
  });
  return row;
}

/** One-click lifecycle transitions for the events ops list. */
export async function transitionEventLifecycle(
  id: string,
  transition: "publish" | "unpublish" | "cancel" | "archive",
  actorUserId: string | null,
) {
  const existing = await prisma.event.findFirst({
    where: { id, deletedAt: null },
  });
  if (!existing) {
    throw new ContentCmsError("Event not found.");
  }

  const data =
    transition === "publish"
      ? {
          contentStatus: "PUBLISHED" as const,
          published: true,
          status:
            existing.status === "DRAFT" || existing.status === "CANCELLED"
              ? ("SCHEDULED" as const)
              : existing.status,
        }
      : transition === "unpublish"
        ? {
            contentStatus: "DRAFT" as const,
            published: false,
          }
        : transition === "cancel"
          ? {
              status: "CANCELLED" as const,
              published: false,
              contentStatus: "DRAFT" as const,
            }
          : {
              contentStatus: "ARCHIVED" as const,
              published: false,
              status: "COMPLETED" as const,
            };

  const row = await prisma.event.update({
    where: { id },
    data: { ...data, updatedById: actorUserId },
  });

  await auditContentChange({
    actorUserId,
    action:
      transition === "publish"
        ? AuditActions.CONTENT_PUBLISHED
        : transition === "archive"
          ? AuditActions.CONTENT_ARCHIVED
          : AuditActions.CONTENT_UPDATED,
    entityType: "Event",
    entityId: row.id,
    metadata: {
      slug: row.slug,
      transition,
      contentStatus: row.contentStatus,
      status: row.status,
    },
  });
  return row;
}

export async function softDeleteEventContent(
  id: string,
  actorUserId: string | null,
) {
  const existing = await prisma.event.findFirst({
    where: { id, deletedAt: null },
  });
  await softDeleteProtected(existing, "event");

  const row = await prisma.event.update({
    where: { id },
    data: {
      deletedAt: new Date(),
      published: false,
      contentStatus: "ARCHIVED",
      updatedById: actorUserId,
    },
  });

  await auditContentChange({
    actorUserId,
    action: AuditActions.CONTENT_DELETED,
    entityType: "Event",
    entityId: row.id,
    metadata: { slug: row.slug },
  });
  return row;
}

export async function upsertAnnouncementContent(
  raw: unknown,
  actorUserId: string | null,
  id?: string,
) {
  const data = parseOrThrow(announcementContentSchema, raw);
  const publishedAt =
    data.status === "PUBLISHED"
      ? (data.publishedAt ?? new Date())
      : data.status === "SCHEDULED"
        ? (data.publishedAt ?? null)
        : data.publishedAt ?? null;

  if (data.status === "SCHEDULED" && !publishedAt) {
    throw new ContentCmsError(
      "Scheduled announcements require a publish date.",
    );
  }

  const existing = id
    ? await prisma.announcement.findFirst({ where: { id, deletedAt: null } })
    : null;

  const payload = {
    slug: data.slug,
    title: data.title,
    summary: data.summary ?? null,
    body: data.body,
    status: data.status,
    priority: data.priority,
    category: data.category,
    pinned: data.pinned,
    publishedAt,
    sortOrder: data.sortOrder,
    coverAssetId: data.coverAssetId ?? null,
    historicallyImportant: data.historicallyImportant,
    isSample: data.isSample,
  };

  const row = id
    ? await prisma.announcement.update({ where: { id }, data: payload })
    : await prisma.announcement.create({
        data: { ...payload, createdById: actorUserId },
      });

  const becamePublished =
    data.status === "PUBLISHED" &&
    (!existing || existing.status !== "PUBLISHED");

  await auditContentChange({
    actorUserId,
    action:
      data.status === "PUBLISHED"
        ? AuditActions.ANNOUNCEMENT_PUBLISHED
        : data.status === "ARCHIVED"
          ? AuditActions.CONTENT_ARCHIVED
          : id
            ? AuditActions.CONTENT_UPDATED
            : AuditActions.CONTENT_CREATED,
    entityType: "Announcement",
    entityId: row.id,
    metadata: { slug: row.slug, status: row.status, priority: row.priority },
  });

  if (becamePublished) {
    const { fanOutAnnouncementPublished } = await import(
      "@/server/notifications/ops"
    );
    await fanOutAnnouncementPublished({
      announcementId: row.id,
      actorUserId,
    });
  }

  return row;
}

export async function transitionAnnouncementLifecycle(
  id: string,
  transition: "publish" | "unpublish" | "schedule" | "archive",
  actorUserId: string | null,
  scheduledAt?: Date | null,
) {
  const existing = await prisma.announcement.findFirst({
    where: { id, deletedAt: null },
  });
  if (!existing) {
    throw new ContentCmsError("Announcement not found.");
  }

  const data =
    transition === "publish"
      ? {
          status: "PUBLISHED" as const,
          publishedAt: existing.publishedAt ?? new Date(),
        }
      : transition === "unpublish"
        ? { status: "DRAFT" as const }
        : transition === "schedule"
          ? {
              status: "SCHEDULED" as const,
              publishedAt: scheduledAt ?? existing.publishedAt,
            }
          : { status: "ARCHIVED" as const };

  if (transition === "schedule" && !data.publishedAt) {
    throw new ContentCmsError(
      "Scheduled announcements require a publish date.",
    );
  }

  const row = await prisma.announcement.update({
    where: { id },
    data,
  });

  await auditContentChange({
    actorUserId,
    action:
      transition === "publish"
        ? AuditActions.ANNOUNCEMENT_PUBLISHED
        : transition === "archive"
          ? AuditActions.CONTENT_ARCHIVED
          : AuditActions.CONTENT_UPDATED,
    entityType: "Announcement",
    entityId: row.id,
    metadata: { slug: row.slug, transition, status: row.status },
  });

  if (transition === "publish" && existing.status !== "PUBLISHED") {
    const { fanOutAnnouncementPublished } = await import(
      "@/server/notifications/ops"
    );
    await fanOutAnnouncementPublished({
      announcementId: row.id,
      actorUserId,
    });
  }

  return row;
}

export async function softDeleteAnnouncementContent(
  id: string,
  actorUserId: string | null,
) {
  const existing = await prisma.announcement.findFirst({
    where: { id, deletedAt: null },
  });
  await softDeleteProtected(existing, "announcement");

  const row = await prisma.announcement.update({
    where: { id },
    data: { deletedAt: new Date(), status: "ARCHIVED" },
  });

  await auditContentChange({
    actorUserId,
    action: AuditActions.CONTENT_DELETED,
    entityType: "Announcement",
    entityId: row.id,
    metadata: { slug: row.slug },
  });
  return row;
}

export async function upsertGalleryAlbum(
  raw: unknown,
  actorUserId: string | null,
  id?: string,
) {
  const data = parseOrThrow(galleryAlbumSchema, raw);
  const payload = {
    slug: data.slug,
    title: data.title,
    description: data.description ?? null,
    contentStatus: data.contentStatus,
    published: publishedFlag(data.contentStatus),
    historicallyImportant: data.historicallyImportant,
    year: data.year ?? null,
    coverUrl: data.coverUrl ?? null,
    coverAlt: data.coverAlt ?? null,
    sortOrder: data.sortOrder,
    isSample: data.isSample,
  };

  const row = id
    ? await prisma.galleryAlbum.update({ where: { id }, data: payload })
    : await prisma.galleryAlbum.create({
        data: { ...payload, createdById: actorUserId },
      });

  await auditContentChange({
    actorUserId,
    action: id
      ? AuditActions.CONTENT_UPDATED
      : AuditActions.CONTENT_CREATED,
    entityType: "GalleryAlbum",
    entityId: row.id,
    metadata: { slug: row.slug, contentStatus: row.contentStatus },
  });
  return row;
}

export async function softDeleteGalleryAlbum(
  id: string,
  actorUserId: string | null,
) {
  const existing = await prisma.galleryAlbum.findFirst({
    where: { id, deletedAt: null },
    include: {
      media: {
        where: { deletedAt: null, historicallyImportant: true },
        select: { id: true },
        take: 1,
      },
    },
  });
  await softDeleteProtected(existing, "gallery album");
  if (existing && existing.media.length > 0) {
    throw new ContentCmsError(
      "Cannot delete an album that contains historically important media. Archive media first.",
    );
  }

  const row = await prisma.$transaction(async (tx) => {
    await tx.galleryMedia.updateMany({
      where: { albumId: id, deletedAt: null },
      data: { deletedAt: new Date(), contentStatus: "ARCHIVED" },
    });
    return tx.galleryAlbum.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        published: false,
        contentStatus: "ARCHIVED",
      },
    });
  });

  await auditContentChange({
    actorUserId,
    action: AuditActions.CONTENT_DELETED,
    entityType: "GalleryAlbum",
    entityId: row.id,
    metadata: { slug: row.slug },
  });
  return row;
}

export async function upsertGalleryMedia(
  raw: unknown,
  actorUserId: string | null,
  id?: string,
) {
  const data = parseOrThrow(galleryMediaSchema, raw);
  const album = await prisma.galleryAlbum.findFirst({
    where: { id: data.albumId, deletedAt: null },
  });
  if (!album) {
    throw new ContentCmsError("Gallery album not found.");
  }

  const mediaAssetId = data.mediaAssetId ?? null;
  if (mediaAssetId) {
    const asset = await prisma.mediaAsset.findFirst({
      where: { id: mediaAssetId, deletedAt: null, status: "READY" },
      select: { id: true },
    });
    if (!asset) {
      throw new ContentCmsError(
        "Media asset not found or not ready. Upload it under Admin → Media first.",
      );
    }
  }

  const url =
    mediaAssetId != null
      ? `/api/media/${mediaAssetId}?v=sm`
      : (data.url?.trim() ?? "");
  if (!url) {
    throw new ContentCmsError("Provide a media asset ID or a URL.");
  }

  // If the album is already public, default new/updated items to PUBLISHED
  // unless the editor explicitly chose DRAFT/ARCHIVED.
  const contentStatus =
    data.contentStatus === "DRAFT" &&
    album.contentStatus === "PUBLISHED" &&
    !id
      ? "PUBLISHED"
      : data.contentStatus;

  const payload = {
    albumId: data.albumId,
    type: data.type,
    url,
    mediaAssetId,
    alt: data.alt ?? null,
    caption: data.caption ?? null,
    sortOrder: data.sortOrder,
    contentStatus,
    historicallyImportant: data.historicallyImportant,
    isSample: data.isSample,
  };

  const row = id
    ? await prisma.galleryMedia.update({ where: { id }, data: payload })
    : await prisma.galleryMedia.create({ data: payload });

  await auditContentChange({
    actorUserId,
    action: id
      ? AuditActions.CONTENT_UPDATED
      : AuditActions.CONTENT_CREATED,
    entityType: "GalleryMedia",
    entityId: row.id,
    metadata: { albumId: row.albumId, contentStatus: row.contentStatus },
  });
  return row;
}

export async function softDeleteGalleryMedia(
  id: string,
  actorUserId: string | null,
) {
  const existing = await prisma.galleryMedia.findFirst({
    where: { id, deletedAt: null },
  });
  await softDeleteProtected(existing, "gallery media");

  const row = await prisma.galleryMedia.update({
    where: { id },
    data: { deletedAt: new Date(), contentStatus: "ARCHIVED" },
  });

  await auditContentChange({
    actorUserId,
    action: AuditActions.MEDIA_DELETED,
    entityType: "GalleryMedia",
    entityId: row.id,
    metadata: { albumId: row.albumId },
  });
  return row;
}

export async function reorderGalleryMedia(
  id: string,
  direction: "up" | "down",
  actorUserId: string | null,
) {
  const current = await prisma.galleryMedia.findFirst({
    where: { id, deletedAt: null },
  });
  if (!current) {
    throw new ContentCmsError("Gallery media not found.");
  }

  const neighbor = await prisma.galleryMedia.findFirst({
    where: {
      albumId: current.albumId,
      deletedAt: null,
      sortOrder:
        direction === "up"
          ? { lt: current.sortOrder }
          : { gt: current.sortOrder },
    },
    orderBy: { sortOrder: direction === "up" ? "desc" : "asc" },
  });
  if (!neighbor) {
    return current;
  }

  const [row] = await prisma.$transaction([
    prisma.galleryMedia.update({
      where: { id: current.id },
      data: { sortOrder: neighbor.sortOrder },
    }),
    prisma.galleryMedia.update({
      where: { id: neighbor.id },
      data: { sortOrder: current.sortOrder },
    }),
  ]);

  await auditContentChange({
    actorUserId,
    action: AuditActions.CONTENT_UPDATED,
    entityType: "GalleryMedia",
    entityId: row.id,
    metadata: { albumId: row.albumId, direction, sortOrder: row.sortOrder },
  });
  return row;
}

// ─── List helpers for admin ──────────────────────────────────────────────────

export async function listContentCollection(
  type:
    | "homepage"
    | "timeline"
    | "faqs"
    | "puja-years"
    | "committee-roster"
    | "positions"
    | "events"
    | "announcements"
    | "gallery"
    | "gallery-media",
  opts?: { query?: string; status?: string; page?: number; pageSize?: number },
) {
  const page = opts?.page ?? 1;
  const pageSize = Math.min(opts?.pageSize ?? 20, 100);
  const q = opts?.query?.trim();
  const status = opts?.status as ContentStatus | undefined;

  switch (type) {
    case "homepage": {
      const where: Prisma.SiteContentBlockWhereInput = {
        deletedAt: null,
        ...(status ? { status } : {}),
        ...(q
          ? {
              OR: [
                { key: { contains: q, mode: "insensitive" } },
                { title: { contains: q, mode: "insensitive" } },
              ],
            }
          : {}),
      };
      const [total, items] = await prisma.$transaction([
        prisma.siteContentBlock.count({ where }),
        prisma.siteContentBlock.findMany({
          where,
          orderBy: [{ sortOrder: "asc" }, { key: "asc" }],
          skip: (page - 1) * pageSize,
          take: pageSize,
        }),
      ]);
      return { total, items, page, pageSize };
    }
    case "timeline": {
      const where: Prisma.TimelineEntryWhereInput = {
        deletedAt: null,
        ...(status ? { status } : {}),
        ...(q
          ? {
              OR: [
                { title: { contains: q, mode: "insensitive" } },
                { yearLabel: { contains: q, mode: "insensitive" } },
              ],
            }
          : {}),
      };
      const [total, items] = await prisma.$transaction([
        prisma.timelineEntry.count({ where }),
        prisma.timelineEntry.findMany({
          where,
          orderBy: [{ sortOrder: "asc" }, { yearLabel: "asc" }],
          skip: (page - 1) * pageSize,
          take: pageSize,
        }),
      ]);
      return { total, items, page, pageSize };
    }
    case "faqs": {
      const where: Prisma.FaqItemWhereInput = {
        deletedAt: null,
        ...(status ? { status } : {}),
        ...(q
          ? {
              OR: [
                { question: { contains: q, mode: "insensitive" } },
                { answer: { contains: q, mode: "insensitive" } },
              ],
            }
          : {}),
      };
      const [total, items] = await prisma.$transaction([
        prisma.faqItem.count({ where }),
        prisma.faqItem.findMany({
          where,
          orderBy: [{ sortOrder: "asc" }, { question: "asc" }],
          skip: (page - 1) * pageSize,
          take: pageSize,
        }),
      ]);
      return { total, items, page, pageSize };
    }
    case "puja-years": {
      const where: Prisma.PujaYearWhereInput = {
        deletedAt: null,
        ...(status ? { status } : {}),
        ...(q
          ? {
              OR: [
                { title: { contains: q, mode: "insensitive" } },
                { summary: { contains: q, mode: "insensitive" } },
              ],
            }
          : {}),
      };
      const [total, items] = await prisma.$transaction([
        prisma.pujaYear.count({ where }),
        prisma.pujaYear.findMany({
          where,
          orderBy: [{ year: "desc" }, { sortOrder: "asc" }],
          skip: (page - 1) * pageSize,
          take: pageSize,
        }),
      ]);
      return { total, items, page, pageSize };
    }
    case "committee-roster": {
      const where: Prisma.PublicCommitteeMemberWhereInput = {
        deletedAt: null,
        ...(status ? { status } : {}),
        ...(q
          ? {
              OR: [
                { displayName: { contains: q, mode: "insensitive" } },
                { roleTitle: { contains: q, mode: "insensitive" } },
              ],
            }
          : {}),
      };
      const [total, items] = await prisma.$transaction([
        prisma.publicCommitteeMember.count({ where }),
        prisma.publicCommitteeMember.findMany({
          where,
          orderBy: [{ sortOrder: "asc" }, { displayName: "asc" }],
          skip: (page - 1) * pageSize,
          take: pageSize,
        }),
      ]);
      return { total, items, page, pageSize };
    }
    case "positions": {
      const where: Prisma.CommitteePositionWhereInput = {
        deletedAt: null,
        ...(q
          ? {
              OR: [
                { code: { contains: q, mode: "insensitive" } },
                { title: { contains: q, mode: "insensitive" } },
              ],
            }
          : {}),
      };
      const [total, items] = await prisma.$transaction([
        prisma.committeePosition.count({ where }),
        prisma.committeePosition.findMany({
          where,
          orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
          skip: (page - 1) * pageSize,
          take: pageSize,
        }),
      ]);
      return { total, items, page, pageSize };
    }
    case "events": {
      const where: Prisma.EventWhereInput = {
        deletedAt: null,
        ...(status ? { contentStatus: status } : {}),
        ...(q
          ? {
              OR: [
                { title: { contains: q, mode: "insensitive" } },
                { slug: { contains: q, mode: "insensitive" } },
              ],
            }
          : {}),
      };
      const [total, items] = await prisma.$transaction([
        prisma.event.count({ where }),
        prisma.event.findMany({
          where,
          orderBy: [{ startsAt: "desc" }],
          skip: (page - 1) * pageSize,
          take: pageSize,
        }),
      ]);
      return { total, items, page, pageSize };
    }
    case "announcements": {
      const where: Prisma.AnnouncementWhereInput = {
        deletedAt: null,
        ...(status ? { status } : {}),
        ...(q
          ? {
              OR: [
                { title: { contains: q, mode: "insensitive" } },
                { slug: { contains: q, mode: "insensitive" } },
              ],
            }
          : {}),
      };
      const [total, items] = await prisma.$transaction([
        prisma.announcement.count({ where }),
        prisma.announcement.findMany({
          where,
          orderBy: [{ pinned: "desc" }, { sortOrder: "asc" }, { publishedAt: "desc" }],
          skip: (page - 1) * pageSize,
          take: pageSize,
        }),
      ]);
      return { total, items, page, pageSize };
    }
    case "gallery": {
      const where: Prisma.GalleryAlbumWhereInput = {
        deletedAt: null,
        ...(status ? { contentStatus: status } : {}),
        ...(q
          ? {
              OR: [
                { title: { contains: q, mode: "insensitive" } },
                { slug: { contains: q, mode: "insensitive" } },
              ],
            }
          : {}),
      };
      const [total, items] = await prisma.$transaction([
        prisma.galleryAlbum.count({ where }),
        prisma.galleryAlbum.findMany({
          where,
          include: { _count: { select: { media: true } } },
          orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
          skip: (page - 1) * pageSize,
          take: pageSize,
        }),
      ]);
      return { total, items, page, pageSize };
    }
    case "gallery-media": {
      const where: Prisma.GalleryMediaWhereInput = {
        deletedAt: null,
        ...(status ? { contentStatus: status } : {}),
        ...(q
          ? {
              OR: [
                { caption: { contains: q, mode: "insensitive" } },
                { url: { contains: q, mode: "insensitive" } },
                { album: { title: { contains: q, mode: "insensitive" } } },
              ],
            }
          : {}),
      };
      const [total, items] = await prisma.$transaction([
        prisma.galleryMedia.count({ where }),
        prisma.galleryMedia.findMany({
          where,
          include: { album: { select: { id: true, title: true, slug: true } } },
          orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
          skip: (page - 1) * pageSize,
          take: pageSize,
        }),
      ]);
      return { total, items, page, pageSize };
    }
    default:
      throw new ContentCmsError("Unknown content collection.");
  }
}
