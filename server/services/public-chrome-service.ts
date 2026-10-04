import "server-only";

import { auth } from "@/server/auth";
import { canAccessAdminPortal } from "@/server/domain/permissions";
import { canAccessMemberPortal } from "@/server/domain/roles";
import { computeLiveStatus } from "@/lib/puja/status";
import { prisma } from "@/server/db/prisma";

export type PublicChromeContext = {
  auth: {
    signedIn: boolean;
    displayName: string | null;
    portalHref: string | null;
    portalLabel: string | null;
  };
  nextEvent: {
    id: string;
    title: string;
    slug: string;
    startsAt: string;
    endsAt: string | null;
    liveStatus: "upcoming" | "today" | "live" | "completed";
  } | null;
  newAnnouncement: {
    id: string;
    title: string;
    slug: string;
    publishedAt: string;
  } | null;
};

export async function loadPublicChromeContext(): Promise<PublicChromeContext> {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60_000);

  const [session, nextEvent, newAnnouncement] = await Promise.all([
    auth(),
    prisma.event.findFirst({
      where: {
        deletedAt: null,
        contentStatus: "PUBLISHED",
        published: true,
        status: { in: ["SCHEDULED", "DRAFT", "COMPLETED"] },
        // Upcoming, live, or completed within the last day (so countdown can show Completed).
        startsAt: { gte: new Date(now.getTime() - 24 * 60 * 60_000) },
      },
      orderBy: { startsAt: "asc" },
      select: {
        id: true,
        title: true,
        slug: true,
        startsAt: true,
        endsAt: true,
      },
    }),
    prisma.announcement.findFirst({
      where: {
        deletedAt: null,
        status: "PUBLISHED",
        isSample: false,
        publishedAt: { gte: weekAgo, lte: now },
      },
      orderBy: [{ priority: "desc" }, { publishedAt: "desc" }],
      select: {
        id: true,
        title: true,
        slug: true,
        publishedAt: true,
      },
    }),
  ]);

  const role = session?.user?.role;
  const signedIn = Boolean(session?.user?.id);
  let portalHref: string | null = null;
  let portalLabel: string | null = null;
  if (signedIn && role) {
    if (canAccessAdminPortal(role)) {
      portalHref = "/admin/dashboard";
      portalLabel = "Admin";
    } else if (canAccessMemberPortal(role)) {
      portalHref = "/member/dashboard";
      portalLabel = "My portal";
    }
  }

  const liveStatus = nextEvent
    ? computeLiveStatus(nextEvent.startsAt, nextEvent.endsAt, now)
    : null;

  return {
    auth: {
      signedIn,
      displayName: session?.user?.name ?? session?.user?.email ?? null,
      portalHref,
      portalLabel,
    },
    nextEvent:
      nextEvent && liveStatus
        ? {
            id: nextEvent.id,
            title: nextEvent.title,
            slug: nextEvent.slug,
            startsAt: nextEvent.startsAt.toISOString(),
            endsAt: nextEvent.endsAt?.toISOString() ?? null,
            liveStatus,
          }
        : null,
    newAnnouncement: newAnnouncement?.publishedAt
      ? {
          id: newAnnouncement.id,
          title: newAnnouncement.title,
          slug: newAnnouncement.slug,
          publishedAt: newAnnouncement.publishedAt.toISOString(),
        }
      : null,
  };
}
