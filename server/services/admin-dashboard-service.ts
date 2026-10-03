import "server-only";

import { prisma } from "@/server/db/prisma";
import { formatAmountLabel } from "@/server/repositories/prisma/mappers";

export type AdminAttentionItem = {
  href: string;
  label: string;
  count: number;
  tone: "default" | "urgent";
};

export type AdminUpcomingItem = {
  id: string;
  kind: "event" | "meeting" | "puja" | "membership";
  title: string;
  subtitle: string;
  at: string;
  href: string;
};

export type AdminDashboardSnapshot = {
  attention: AdminAttentionItem[];
  recentActivity: Array<{
    id: string;
    action: string;
    entityType: string;
    entityId: string | null;
    actorName: string;
    createdAt: string;
  }>;
  upcoming: AdminUpcomingItem[];
  quickActions: Array<{ href: string; label: string; description: string }>;
  /** Compact context — not vanity tiles. */
  context: {
    activeMembers: number;
    paymentCollectionLabel: string;
    outstandingDuesLabel: string;
    outstandingDuesCount: number;
  };
};

const STALE_PENDING_MS = 6 * 60 * 60_000;
const EXPIRING_WITHIN_DAYS = 30;
const UPCOMING_WINDOW_DAYS = 90;

function humanAction(action: string): string {
  const map: Record<string, string> = {
    "member.create": "Member created",
    "member.updated": "Member updated",
    "member.status_change": "Membership status changed",
    "member.approved": "Membership approved",
    "member.suspended": "Membership suspended",
    "member.deleted": "Member archived",
    "payment.updated": "Payment status changed",
    "announcement.published": "Announcement published",
    "content.updated": "Content updated",
    "content.created": "Content created",
    "content.deleted": "Content deleted",
    "content.published": "Content published",
    "content.archived": "Content archived",
    "media.deleted": "Gallery image deleted",
    "admin.permission_changed": "Admin permission changed",
    "committee.updated": "Committee updated",
    "event.registration": "Event registration recorded",
    "event.modified": "Event modified",
    "mandate.created": "Mandate created",
    "mandate.cancelled": "Mandate cancelled",
    "report.exported": "Report exported",
  };
  return map[action] ?? action.replace(/\./g, " ");
}

export async function loadAdminDashboard(actorUserId: string): Promise<AdminDashboardSnapshot> {
  const now = new Date();
  const staleCutoff = new Date(now.getTime() - STALE_PENDING_MS);
  const expiringBefore = new Date(now);
  expiringBefore.setDate(expiringBefore.getDate() + EXPIRING_WITHIN_DAYS);
  const upcomingUntil = new Date(now);
  upcomingUntil.setDate(upcomingUntil.getDate() + UPCOMING_WINDOW_DAYS);

  const [
    pendingMembers,
    pendingReconciliation,
    eventsNeedingAction,
    unreadAdminNotifications,
    expiringMemberships,
    outstandingInvoices,
    activeMembers,
    recordedPayments,
    recentLogs,
    upcomingEvents,
    upcomingMeetings,
    pujaMilestones,
    membershipDeadlines,
  ] = await Promise.all([
    prisma.member.count({
      where: { deletedAt: null, status: { in: ["PENDING", "APPLICATION"] } },
    }),
    prisma.payment.count({
      where: {
        deletedAt: null,
        status: { in: ["PENDING", "AUTHORIZED"] },
        providerPaymentRef: { not: null },
        updatedAt: { lt: staleCutoff },
      },
    }),
    prisma.event.count({
      where: {
        deletedAt: null,
        OR: [
          {
            contentStatus: "DRAFT",
            startsAt: { gte: now, lte: upcomingUntil },
          },
          {
            status: "SCHEDULED",
            published: true,
            startsAt: { gte: now, lte: new Date(now.getTime() + 7 * 24 * 60 * 60_000) },
            registrationRequired: true,
          },
        ],
      },
    }),
    prisma.notification.count({
      where: {
        deletedAt: null,
        userId: actorUserId,
        readAt: null,
      },
    }),
    prisma.membership.count({
      where: {
        deletedAt: null,
        status: "ACTIVE",
        isCurrent: true,
        endsOn: { gte: now, lte: expiringBefore },
      },
    }),
    prisma.invoice.findMany({
      where: { deletedAt: null, status: { in: ["ISSUED", "OVERDUE"] } },
      select: { amountPaise: true },
    }),
    prisma.member.count({ where: { deletedAt: null, status: "ACTIVE" } }),
    prisma.payment.aggregate({
      where: { deletedAt: null, status: "SUCCESS" },
      _sum: { amountPaise: true },
    }),
    prisma.auditLog.findMany({
      take: 12,
      orderBy: { createdAt: "desc" },
      include: { actor: { select: { name: true, email: true } } },
    }),
    prisma.event.findMany({
      where: {
        deletedAt: null,
        published: true,
        status: "SCHEDULED",
        category: { not: "meeting" },
        startsAt: { gte: now, lte: upcomingUntil },
      },
      orderBy: { startsAt: "asc" },
      take: 6,
      select: { id: true, title: true, startsAt: true, venueLabel: true },
    }),
    prisma.event.findMany({
      where: {
        deletedAt: null,
        published: true,
        status: "SCHEDULED",
        category: "meeting",
        startsAt: { gte: now, lte: upcomingUntil },
      },
      orderBy: { startsAt: "asc" },
      take: 4,
      select: { id: true, title: true, startsAt: true, venueLabel: true },
    }),
    prisma.pujaYear.findMany({
      where: {
        deletedAt: null,
        status: "PUBLISHED",
        year: { gte: now.getFullYear() - 1, lte: now.getFullYear() + 1 },
      },
      orderBy: { year: "asc" },
      take: 3,
      select: { id: true, year: true, title: true },
    }),
    prisma.membership.findMany({
      where: {
        deletedAt: null,
        status: "ACTIVE",
        isCurrent: true,
        OR: [
          { endsOn: { gte: now, lte: expiringBefore } },
          { nextDueOn: { gte: now, lte: expiringBefore } },
        ],
      },
      orderBy: [{ endsOn: "asc" }, { nextDueOn: "asc" }],
      take: 6,
      include: {
        member: {
          select: {
            id: true,
            membershipNumber: true,
            firstName: true,
            lastName: true,
          },
        },
        plan: { select: { name: true } },
      },
    }),
  ]);

  const outstandingDuesPaise = outstandingInvoices.reduce(
    (sum, invoice) => sum + invoice.amountPaise,
    0,
  );

  const attentionCandidates: AdminAttentionItem[] = [
    {
      href: "/admin/members?status=PENDING",
      label: "Pending member approvals",
      count: pendingMembers,
      tone: "urgent",
    },
    {
      href: "/admin/payments?status=PENDING",
      label: "Pending payment reconciliation",
      count: pendingReconciliation,
      tone: "urgent",
    },
    {
      href: "/admin/events?needsAction=1",
      label: "Upcoming events requiring action",
      count: eventsNeedingAction,
      tone: "default",
    },
    {
      href: "/admin/dashboard#notifications",
      label: "Unread administrative notifications",
      count: unreadAdminNotifications,
      tone: "default",
    },
    {
      href: "/admin/memberships?expiring=1",
      label: "Expiring memberships",
      count: expiringMemberships,
      tone: "default",
    },
  ];
  const attention = attentionCandidates.filter((item) => item.count > 0);

  const upcoming: AdminUpcomingItem[] = [];

  for (const event of upcomingEvents) {
    upcoming.push({
      id: `event-${event.id}`,
      kind: "event",
      title: event.title,
      subtitle: event.venueLabel ? `Event · ${event.venueLabel}` : "Event",
      at: event.startsAt.toISOString(),
      href: `/admin/content/events/${event.id}`,
    });
  }
  for (const meeting of upcomingMeetings) {
    upcoming.push({
      id: `meeting-${meeting.id}`,
      kind: "meeting",
      title: meeting.title,
      subtitle: meeting.venueLabel
        ? `Meeting · ${meeting.venueLabel}`
        : "Committee meeting",
      at: meeting.startsAt.toISOString(),
      href: `/admin/content/events/${meeting.id}`,
    });
  }
  for (const puja of pujaMilestones) {
    upcoming.push({
      id: `puja-${puja.id}`,
      kind: "puja",
      title: puja.title,
      subtitle: `Saraswati Puja · ${puja.year}`,
      at: new Date(Date.UTC(puja.year, 0, 15)).toISOString(),
      href: `/admin/content/puja-years/${puja.id}`,
    });
  }
  for (const membership of membershipDeadlines) {
    const deadline = membership.endsOn ?? membership.nextDueOn;
    if (!deadline) continue;
    upcoming.push({
      id: `membership-${membership.id}`,
      kind: "membership",
      title: `${membership.member.firstName} ${membership.member.lastName}`,
      subtitle: `${membership.member.membershipNumber} · ${membership.plan.name} deadline`,
      at: deadline.toISOString(),
      href: `/admin/members/${membership.member.id}`,
    });
  }

  upcoming.sort(
    (a, b) => new Date(a.at).getTime() - new Date(b.at).getTime(),
  );

  return {
    attention,
    recentActivity: recentLogs.map((log) => ({
      id: log.id,
      action: humanAction(log.action),
      entityType: log.entityType,
      entityId: log.entityId,
      actorName: log.actor?.name ?? log.actor?.email ?? "System",
      createdAt: log.createdAt.toISOString(),
    })),
    upcoming: upcoming.slice(0, 12),
    quickActions: [
      {
        href: "/admin/content/events/new",
        label: "Create Event",
        description: "Draft a club event or meeting",
      },
      {
        href: "/admin/content/announcements/new",
        label: "Create Announcement",
        description: "Write a notice for the public site",
      },
      {
        href: "/admin/members",
        label: "Add Member",
        description: "Open members to create or approve",
      },
      {
        href: "/admin/content/gallery/new",
        label: "Upload Gallery",
        description: "Create an album for public photos",
      },
      {
        href: "/admin/payments",
        label: "Record Payment",
        description: "Review and reconcile payments",
      },
    ],
    context: {
      activeMembers,
      paymentCollectionLabel: formatAmountLabel(
        recordedPayments._sum.amountPaise ?? 0,
      ),
      outstandingDuesLabel: formatAmountLabel(outstandingDuesPaise),
      outstandingDuesCount: outstandingInvoices.length,
    },
  };
}
