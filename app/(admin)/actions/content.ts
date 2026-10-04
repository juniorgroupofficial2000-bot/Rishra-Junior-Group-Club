"use server";

import {
  AuthorizationError,
  assertPermission,
} from "@/server/auth/authorize";
import { requireAdminSession } from "@/server/auth/session";
import { Permissions, type Permission } from "@/server/domain/permissions";
import {
  ContentCmsError,
  softDeleteAnnouncementContent,
  softDeleteCommitteePosition,
  softDeleteEventContent,
  softDeleteFaqItem,
  softDeleteGalleryAlbum,
  softDeleteGalleryMedia,
  softDeletePublicCommitteeMember,
  softDeletePujaYear,
  softDeleteSiteContentBlock,
  softDeleteTimelineEntry,
  reorderGalleryMedia,
  transitionAnnouncementLifecycle,
  transitionEventLifecycle,
  upsertAnnouncementContent,
  upsertCommitteePosition,
  upsertEventContent,
  upsertFaqItem,
  upsertGalleryAlbum,
  upsertGalleryMedia,
  upsertPublicCommitteeMember,
  upsertPujaYear,
  upsertSiteContentBlock,
  upsertTimelineEntry,
} from "@/server/services/content-cms-service";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

async function requireContentPermission(permission: Permission) {
  const session = await requireAdminSession("/admin/content");
  try {
    assertPermission(session.user.role, permission);
  } catch (error) {
    if (error instanceof AuthorizationError) {
      throw new Error("Forbidden");
    }
    throw error;
  }
  return session;
}

function bool(formData: FormData, key: string) {
  return formData.get(key) === "on" || formData.get(key) === "true";
}

function str(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function optStr(formData: FormData, key: string) {
  const v = str(formData, key);
  return v.length ? v : null;
}

function parseJsonField(formData: FormData, key: string): unknown {
  const raw = optStr(formData, key);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    throw new ContentCmsError(`Invalid JSON in ${key}.`);
  }
}

function failRedirect(type: string, id: string | undefined, message: string) {
  const base = id
    ? `/admin/content/${type}/${id}`
    : `/admin/content/${type}/new`;
  redirect(`${base}?error=${encodeURIComponent(message)}`);
}

function successRedirect(type: string, id?: string) {
  revalidatePath("/admin/content");
  revalidatePath(`/admin/content/${type}`);
  revalidatePath("/");
  revalidatePath("/history");
  revalidatePath("/committee");
  revalidatePath("/faq");
  revalidatePath("/saraswati-puja");
  revalidatePath("/events");
  revalidatePath("/gallery");
  revalidatePath("/announcements");
  if (id) {
    redirect(`/admin/content/${type}/${id}?updated=1`);
  }
  redirect(`/admin/content/${type}?updated=1`);
}

export async function saveHomepageBlockAction(formData: FormData) {
  const session = await requireContentPermission(Permissions.CONTENT_WRITE);
  const id = optStr(formData, "id") ?? undefined;
  try {
    const body = parseJsonField(formData, "bodyJson");
    if (!body || typeof body !== "object") {
      throw new ContentCmsError("Body must be a JSON object.");
    }
    const row = await upsertSiteContentBlock(
      {
        key: str(formData, "key"),
        title: str(formData, "title"),
        summary: optStr(formData, "summary"),
        body,
        status: str(formData, "status") || "DRAFT",
        historicallyImportant: bool(formData, "historicallyImportant"),
        sortOrder: Number(formData.get("sortOrder") ?? 0),
      },
      session.user.id,
      id,
    );
    successRedirect("homepage", row.id);
  } catch (error) {
    failRedirect(
      "homepage",
      id,
      error instanceof ContentCmsError ? error.message : "Could not save block.",
    );
  }
}

export async function deleteHomepageBlockAction(id: string) {
  const session = await requireContentPermission(Permissions.CONTENT_WRITE);
  try {
    await softDeleteSiteContentBlock(id, session.user.id);
  } catch (error) {
    failRedirect(
      "homepage",
      id,
      error instanceof ContentCmsError ? error.message : "Could not delete.",
    );
  }
  successRedirect("homepage");
}

export async function saveTimelineEntryAction(formData: FormData) {
  const session = await requireContentPermission(Permissions.CONTENT_WRITE);
  const id = optStr(formData, "id") ?? undefined;
  try {
    const row = await upsertTimelineEntry(
      {
        yearLabel: str(formData, "yearLabel"),
        date: optStr(formData, "date"),
        title: str(formData, "title"),
        description: str(formData, "description"),
        imageJson: parseJsonField(formData, "imageJson"),
        galleryJson: parseJsonField(formData, "galleryJson"),
        milestone: bool(formData, "milestone"),
        sortOrder: Number(formData.get("sortOrder") ?? 0),
        status: str(formData, "status") || "DRAFT",
        provenance: str(formData, "provenance") || "placeholder",
        historicallyImportant: bool(formData, "historicallyImportant"),
        isSample: bool(formData, "isSample"),
      },
      session.user.id,
      id,
    );
    successRedirect("timeline", row.id);
  } catch (error) {
    failRedirect(
      "timeline",
      id,
      error instanceof ContentCmsError ? error.message : "Could not save entry.",
    );
  }
}

export async function deleteTimelineEntryAction(id: string) {
  const session = await requireContentPermission(Permissions.CONTENT_WRITE);
  try {
    await softDeleteTimelineEntry(id, session.user.id);
  } catch (error) {
    failRedirect(
      "timeline",
      id,
      error instanceof ContentCmsError ? error.message : "Could not delete.",
    );
  }
  successRedirect("timeline");
}

export async function saveFaqItemAction(formData: FormData) {
  const session = await requireContentPermission(Permissions.CONTENT_WRITE);
  const id = optStr(formData, "id") ?? undefined;
  try {
    const row = await upsertFaqItem(
      {
        question: str(formData, "question"),
        answer: str(formData, "answer"),
        sortOrder: Number(formData.get("sortOrder") ?? 0),
        status: str(formData, "status") || "DRAFT",
        historicallyImportant: bool(formData, "historicallyImportant"),
      },
      session.user.id,
      id,
    );
    successRedirect("faqs", row.id);
  } catch (error) {
    failRedirect(
      "faqs",
      id,
      error instanceof ContentCmsError ? error.message : "Could not save FAQ.",
    );
  }
}

export async function deleteFaqItemAction(id: string) {
  const session = await requireContentPermission(Permissions.CONTENT_WRITE);
  try {
    await softDeleteFaqItem(id, session.user.id);
  } catch (error) {
    failRedirect(
      "faqs",
      id,
      error instanceof ContentCmsError ? error.message : "Could not delete.",
    );
  }
  successRedirect("faqs");
}

export async function savePujaYearAction(formData: FormData) {
  const session = await requireContentPermission(Permissions.PUJA_WRITE);
  const id = optStr(formData, "id") ?? undefined;
  try {
    const highlightsRaw = optStr(formData, "highlights");
    const highlights = highlightsRaw
      ? highlightsRaw
          .split("\n")
          .map((l) => l.trim())
          .filter(Boolean)
      : null;
    const startsOn = optStr(formData, "startsOn");
    const endsOn = optStr(formData, "endsOn");
    const schedule = parseJsonField(formData, "scheduleJson");
    const row = await upsertPujaYear(
      {
        year: Number(formData.get("year")),
        title: str(formData, "title"),
        summary: str(formData, "summary"),
        theme: optStr(formData, "theme"),
        startsOn: startsOn || null,
        endsOn: endsOn || null,
        locationLabel: optStr(formData, "locationLabel"),
        locationDetail: optStr(formData, "locationDetail"),
        committeeNote: optStr(formData, "committeeNote"),
        highlights,
        coverJson: parseJsonField(formData, "coverJson"),
        galleryJson: parseJsonField(formData, "galleryJson"),
        videosJson: parseJsonField(formData, "videosJson"),
        documentsJson: parseJsonField(formData, "documentsJson"),
        schedule: Array.isArray(schedule) ? schedule : null,
        href: optStr(formData, "href"),
        sortOrder: Number(formData.get("sortOrder") ?? 0),
        status: str(formData, "status") || "DRAFT",
        provenance: str(formData, "provenance") || "placeholder",
        historicallyImportant: bool(formData, "historicallyImportant"),
        isSample: bool(formData, "isSample"),
        coverAssetId: optStr(formData, "coverAssetId"),
      },
      session.user.id,
      id,
    );
    revalidatePath(`/saraswati-puja/${row.year}`);
    successRedirect("puja-years", row.id);
  } catch (error) {
    failRedirect(
      "puja-years",
      id,
      error instanceof ContentCmsError ? error.message : "Could not save year.",
    );
  }
}

export async function deletePujaYearAction(id: string) {
  const session = await requireContentPermission(Permissions.PUJA_WRITE);
  try {
    await softDeletePujaYear(id, session.user.id);
  } catch (error) {
    failRedirect(
      "puja-years",
      id,
      error instanceof ContentCmsError ? error.message : "Could not delete.",
    );
  }
  successRedirect("puja-years");
}

export async function saveCommitteeRosterAction(formData: FormData) {
  const session = await requireContentPermission(Permissions.CONTENT_WRITE);
  const id = optStr(formData, "id") ?? undefined;
  try {
    const termYear = optStr(formData, "termYear");
    const row = await upsertPublicCommitteeMember(
      {
        roleKey: str(formData, "roleKey"),
        roleTitle: str(formData, "roleTitle"),
        name: str(formData, "name"),
        familiarName: optStr(formData, "familiarName"),
        displayName: str(formData, "displayName"),
        biography: optStr(formData, "biography"),
        termYear: termYear ? Number(termYear) : null,
        sortOrder: Number(formData.get("sortOrder") ?? 0),
        status: str(formData, "status") || "DRAFT",
        historicallyImportant: bool(formData, "historicallyImportant"),
        positionId: optStr(formData, "positionId"),
        portraitAssetId: optStr(formData, "portraitAssetId"),
      },
      session.user.id,
      id,
    );
    successRedirect("committee-roster", row.id);
  } catch (error) {
    failRedirect(
      "committee-roster",
      id,
      error instanceof ContentCmsError ? error.message : "Could not save member.",
    );
  }
}

export async function deleteCommitteeRosterAction(id: string) {
  const session = await requireContentPermission(Permissions.CONTENT_WRITE);
  try {
    await softDeletePublicCommitteeMember(id, session.user.id);
  } catch (error) {
    failRedirect(
      "committee-roster",
      id,
      error instanceof ContentCmsError ? error.message : "Could not delete.",
    );
  }
  successRedirect("committee-roster");
}

export async function saveCommitteePositionAction(formData: FormData) {
  const session = await requireContentPermission(Permissions.COMMITTEE_WRITE);
  const id = optStr(formData, "id") ?? undefined;
  try {
    const row = await upsertCommitteePosition(
      {
        code: str(formData, "code"),
        title: str(formData, "title"),
        description: optStr(formData, "description"),
        sortOrder: Number(formData.get("sortOrder") ?? 0),
        active: bool(formData, "active"),
        historicallyImportant: bool(formData, "historicallyImportant"),
      },
      session.user.id,
      id,
    );
    successRedirect("positions", row.id);
  } catch (error) {
    failRedirect(
      "positions",
      id,
      error instanceof ContentCmsError
        ? error.message
        : "Could not save position.",
    );
  }
}

export async function deleteCommitteePositionAction(id: string) {
  const session = await requireContentPermission(Permissions.COMMITTEE_WRITE);
  try {
    await softDeleteCommitteePosition(id, session.user.id);
  } catch (error) {
    failRedirect(
      "positions",
      id,
      error instanceof ContentCmsError ? error.message : "Could not delete.",
    );
  }
  successRedirect("positions");
}

export async function saveEventContentAction(formData: FormData) {
  const session = await requireContentPermission(Permissions.EVENTS_WRITE);
  const id = optStr(formData, "id") ?? undefined;
  try {
    const endsAt = optStr(formData, "endsAt");
    const capacity = optStr(formData, "capacity");
    const row = await upsertEventContent(
      {
        slug: str(formData, "slug"),
        title: str(formData, "title"),
        description: optStr(formData, "description"),
        startsAt: str(formData, "startsAt"),
        endsAt: endsAt || null,
        venueLabel: optStr(formData, "venueLabel"),
        category: str(formData, "category") || "event",
        status: str(formData, "opsStatus") || "DRAFT",
        contentStatus: str(formData, "status") || "DRAFT",
        registrationRequired: bool(formData, "registrationRequired"),
        capacity: capacity ? Number(capacity) : null,
        coverAssetId: optStr(formData, "coverAssetId"),
        historicallyImportant: bool(formData, "historicallyImportant"),
        isSample: bool(formData, "isSample"),
      },
      session.user.id,
      id,
    );
    successRedirect("events", row.id);
  } catch (error) {
    failRedirect(
      "events",
      id,
      error instanceof ContentCmsError ? error.message : "Could not save event.",
    );
  }
}

export async function deleteEventContentAction(id: string) {
  const session = await requireContentPermission(Permissions.EVENTS_WRITE);
  try {
    await softDeleteEventContent(id, session.user.id);
  } catch (error) {
    failRedirect(
      "events",
      id,
      error instanceof ContentCmsError ? error.message : "Could not delete.",
    );
  }
  successRedirect("events");
}

export async function saveAnnouncementContentAction(formData: FormData) {
  const session = await requireContentPermission(
    Permissions.ANNOUNCEMENTS_WRITE,
  );
  const id = optStr(formData, "id") ?? undefined;
  try {
    const publishedAt = optStr(formData, "publishedAt");
    const row = await upsertAnnouncementContent(
      {
        slug: str(formData, "slug"),
        title: str(formData, "title"),
        summary: optStr(formData, "summary"),
        body: str(formData, "body"),
        status: str(formData, "status") || "DRAFT",
        priority: str(formData, "priority") || "NORMAL",
        category: str(formData, "category") || "general",
        pinned: bool(formData, "pinned"),
        publishedAt: publishedAt || null,
        sortOrder: Number(formData.get("sortOrder") ?? 0),
        coverAssetId: optStr(formData, "coverAssetId"),
        historicallyImportant: bool(formData, "historicallyImportant"),
        isSample: bool(formData, "isSample"),
      },
      session.user.id,
      id,
    );
    successRedirect("announcements", row.id);
  } catch (error) {
    failRedirect(
      "announcements",
      id,
      error instanceof ContentCmsError
        ? error.message
        : "Could not save announcement.",
    );
  }
}

export async function deleteAnnouncementContentAction(id: string) {
  const session = await requireContentPermission(
    Permissions.ANNOUNCEMENTS_WRITE,
  );
  try {
    await softDeleteAnnouncementContent(id, session.user.id);
  } catch (error) {
    failRedirect(
      "announcements",
      id,
      error instanceof ContentCmsError ? error.message : "Could not delete.",
    );
  }
  successRedirect("announcements");
}

export async function saveGalleryAlbumAction(formData: FormData) {
  const session = await requireContentPermission(Permissions.GALLERY_WRITE);
  const id = optStr(formData, "id") ?? undefined;
  try {
    const year = optStr(formData, "year");
    const row = await upsertGalleryAlbum(
      {
        slug: str(formData, "slug"),
        title: str(formData, "title"),
        description: optStr(formData, "description"),
        contentStatus: str(formData, "status") || "DRAFT",
        historicallyImportant: bool(formData, "historicallyImportant"),
        year: year ? Number(year) : null,
        coverUrl: optStr(formData, "coverUrl"),
        coverAlt: optStr(formData, "coverAlt"),
        sortOrder: Number(formData.get("sortOrder") ?? 0),
        isSample: bool(formData, "isSample"),
      },
      session.user.id,
      id,
    );
    successRedirect("gallery", row.id);
  } catch (error) {
    failRedirect(
      "gallery",
      id,
      error instanceof ContentCmsError ? error.message : "Could not save album.",
    );
  }
}

export async function deleteGalleryAlbumAction(id: string) {
  const session = await requireContentPermission(Permissions.GALLERY_WRITE);
  try {
    await softDeleteGalleryAlbum(id, session.user.id);
  } catch (error) {
    failRedirect(
      "gallery",
      id,
      error instanceof ContentCmsError ? error.message : "Could not delete.",
    );
  }
  successRedirect("gallery");
}

export async function saveGalleryMediaAction(formData: FormData) {
  const session = await requireContentPermission(Permissions.GALLERY_WRITE);
  const id = optStr(formData, "id") ?? undefined;
  try {
    const row = await upsertGalleryMedia(
      {
        albumId: str(formData, "albumId"),
        type: str(formData, "type") || "IMAGE",
        url: optStr(formData, "url"),
        mediaAssetId: optStr(formData, "mediaAssetId"),
        alt: optStr(formData, "alt"),
        caption: optStr(formData, "caption"),
        sortOrder: Number(formData.get("sortOrder") ?? 0),
        contentStatus: str(formData, "status") || "PUBLISHED",
        historicallyImportant: bool(formData, "historicallyImportant"),
        isSample: bool(formData, "isSample"),
      },
      session.user.id,
      id,
    );
    successRedirect("gallery-media", row.id);
  } catch (error) {
    failRedirect(
      "gallery-media",
      id,
      error instanceof ContentCmsError ? error.message : "Could not save media.",
    );
  }
}

export async function deleteGalleryMediaAction(id: string) {
  const session = await requireContentPermission(Permissions.GALLERY_WRITE);
  try {
    await softDeleteGalleryMedia(id, session.user.id);
  } catch (error) {
    failRedirect(
      "gallery-media",
      id,
      error instanceof ContentCmsError ? error.message : "Could not delete.",
    );
  }
  successRedirect("gallery-media");
}

export async function transitionEventAction(formData: FormData) {
  const session = await requireContentPermission(Permissions.EVENTS_WRITE);
  const id = str(formData, "id");
  const transition = str(formData, "transition") as
    | "publish"
    | "unpublish"
    | "cancel"
    | "archive";
  try {
    await transitionEventLifecycle(id, transition, session.user.id);
  } catch (error) {
    redirect(
      `/admin/events?error=${encodeURIComponent(
        error instanceof ContentCmsError
          ? error.message
          : "Could not update event.",
      )}`,
    );
  }
  revalidatePath("/admin/events");
  revalidatePath("/events");
  revalidatePath(`/admin/content/events/${id}`);
  redirect(`/admin/events?updated=${transition}`);
}

export async function transitionAnnouncementAction(formData: FormData) {
  const session = await requireContentPermission(
    Permissions.ANNOUNCEMENTS_WRITE,
  );
  const id = str(formData, "id");
  const transition = str(formData, "transition") as
    | "publish"
    | "unpublish"
    | "schedule"
    | "archive";
  const scheduledAt = optStr(formData, "scheduledAt");
  try {
    await transitionAnnouncementLifecycle(
      id,
      transition,
      session.user.id,
      scheduledAt ? new Date(scheduledAt) : null,
    );
  } catch (error) {
    redirect(
      `/admin/announcements?error=${encodeURIComponent(
        error instanceof ContentCmsError
          ? error.message
          : "Could not update announcement.",
      )}`,
    );
  }
  revalidatePath("/admin/announcements");
  revalidatePath("/announcements");
  redirect(`/admin/announcements?updated=${transition}`);
}

export async function reorderGalleryMediaAction(formData: FormData) {
  const session = await requireContentPermission(Permissions.GALLERY_WRITE);
  const id = str(formData, "id");
  const direction = str(formData, "direction") as "up" | "down";
  try {
    await reorderGalleryMedia(id, direction, session.user.id);
  } catch (error) {
    redirect(
      `/admin/gallery?error=${encodeURIComponent(
        error instanceof ContentCmsError
          ? error.message
          : "Could not reorder media.",
      )}`,
    );
  }
  revalidatePath("/admin/gallery");
  revalidatePath("/gallery");
  revalidatePath("/admin/content/gallery-media");
  redirect("/admin/gallery?updated=reordered");
}
