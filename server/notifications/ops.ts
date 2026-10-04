import "server-only";

import { AuditActions } from "@/server/audit/actions";
import { prisma } from "@/server/db/prisma";
import {
  getNotificationService,
  resolveMemberRecipient,
} from "@/server/notifications/service";
import { NotificationEvents } from "@/server/notifications/types";
import { writeAuditEvent } from "@/server/services/audit-service";

export async function notifyUpcomingPayment(memberId: string, nextDebitOn: string) {
  const recipient = await resolveMemberRecipient(memberId);
  if (!recipient) return [];
  return getNotificationService().notifyEvent({
    event: NotificationEvents.UPCOMING_PAYMENT,
    recipient,
    data: { nextDebitOn },
  });
}

export async function notifyEventRegistration(input: {
  memberId: string;
  eventId: string;
  actorUserId?: string | null;
}) {
  const event = await prisma.event.findFirst({
    where: { id: input.eventId, deletedAt: null },
  });
  if (!event) throw new Error("Event not found.");

  const recipient = await resolveMemberRecipient(input.memberId);
  if (recipient) {
    await getNotificationService().notifyEvent({
      event: NotificationEvents.EVENT_REGISTRATION,
      recipient,
      data: {
        eventTitle: event.title,
        startsAt: event.startsAt.toISOString(),
      },
    });
  }

  await writeAuditEvent({
    actorUserId: input.actorUserId,
    action: AuditActions.EVENT_REGISTRATION,
    entityType: "Event",
    entityId: event.id,
    metadata: { memberId: input.memberId },
  });
}

export async function notifyEventReminder(input: {
  memberId: string;
  eventId: string;
}) {
  const event = await prisma.event.findFirst({
    where: { id: input.eventId, deletedAt: null },
  });
  if (!event) throw new Error("Event not found.");
  const recipient = await resolveMemberRecipient(input.memberId);
  if (!recipient) return [];
  return getNotificationService().notifyEvent({
    event: NotificationEvents.EVENT_REMINDER,
    recipient,
    data: {
      eventTitle: event.title,
      startsAt: event.startsAt.toISOString(),
    },
  });
}

export async function notifyAnnouncementPublished(input: {
  announcementId: string;
  actorUserId?: string | null;
  /** Optional fan-out to specific user ids; empty = no fan-out. */
  userIds?: string[];
}) {
  const announcement = await prisma.announcement.findFirst({
    where: { id: input.announcementId, deletedAt: null },
  });
  if (!announcement) throw new Error("Announcement not found.");

  await writeAuditEvent({
    actorUserId: input.actorUserId,
    action: AuditActions.ANNOUNCEMENT_PUBLISHED,
    entityType: "Announcement",
    entityId: announcement.id,
    metadata: { slug: announcement.slug, title: announcement.title },
  });

  return deliverAnnouncementNotifications({
    announcementTitle: announcement.title,
    userIds: input.userIds ?? [],
  });
}

/** Fan-out in-app notifications to active members when an announcement is published. */
export async function fanOutAnnouncementPublished(input: {
  announcementId: string;
  actorUserId?: string | null;
}) {
  const announcement = await prisma.announcement.findFirst({
    where: { id: input.announcementId, deletedAt: null },
  });
  if (!announcement) return [];

  const members = await prisma.member.findMany({
    where: {
      deletedAt: null,
      status: "ACTIVE",
      userId: { not: null },
    },
    select: { userId: true },
    take: 500,
  });

  const userIds = members
    .map((row) => row.userId)
    .filter((id): id is string => Boolean(id));

  return deliverAnnouncementNotifications({
    announcementTitle: announcement.title,
    userIds,
  });
}

async function deliverAnnouncementNotifications(input: {
  announcementTitle: string;
  userIds: string[];
}) {
  const results = [];
  for (const userId of input.userIds) {
    results.push(
      ...(await getNotificationService().notifyEvent({
        event: NotificationEvents.ANNOUNCEMENT_PUBLISHED,
        recipient: { userId },
        data: { announcementTitle: input.announcementTitle },
        channels: ["in_app"],
      })),
    );
  }
  return results;
}
