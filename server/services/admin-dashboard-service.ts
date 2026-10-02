import "server-only";

import { prisma } from "@/server/db/prisma";
import { formatAmountLabel } from "@/server/repositories/prisma/mappers";

export type AdminDashboardSnapshot = {
  totalMembers: number;
  activeMembers: number;
  pendingMembers: number;
  inactiveMembers: number;
  suspendedMembers: number;
  paymentCollectionPaise: number;
  paymentCollectionLabel: string;
  outstandingDuesCount: number;
  outstandingDuesPaise: number;
  outstandingDuesLabel: string;
  paymentFailures: number;
  activeMandates: number;
  upcomingEvents: number;
  memberStatusSeries: Array<{ label: string; value: number }>;
  collectionByMonth: Array<{ label: string; amountPaise: number }>;
  recentActivity: Array<{
    id: string;
    action: string;
    entityType: string;
    entityId: string | null;
    actorName: string;
    createdAt: string;
  }>;
  upcomingEventItems: Array<{
    id: string;
    title: string;
    startsAt: string;
    venueLabel: string | null;
  }>;
};

function monthKey(date: Date) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

export async function loadAdminDashboard(): Promise<AdminDashboardSnapshot> {
  const now = new Date();
  const sixMonthsAgo = new Date(now);
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const [
    totalMembers,
    activeMembers,
    pendingMembers,
    inactiveMembers,
    suspendedMembers,
    recordedPayments,
    outstandingInvoices,
    paymentFailures,
    activeMandates,
    upcomingEvents,
    recentLogs,
    upcomingEventItems,
    recentRecordedPayments,
  ] = await Promise.all([
    prisma.member.count({ where: { deletedAt: null } }),
    prisma.member.count({ where: { deletedAt: null, status: "ACTIVE" } }),
    prisma.member.count({ where: { deletedAt: null, status: "PENDING" } }),
    prisma.member.count({ where: { deletedAt: null, status: "INACTIVE" } }),
    prisma.member.count({ where: { deletedAt: null, status: "SUSPENDED" } }),
    prisma.payment.aggregate({
      where: { deletedAt: null, status: "SUCCESS" },
      _sum: { amountPaise: true },
    }),
    prisma.invoice.findMany({
      where: {
        deletedAt: null,
        status: { in: ["ISSUED", "OVERDUE"] },
      },
      select: { amountPaise: true },
    }),
    prisma.payment.count({
      where: { deletedAt: null, status: "FAILED" },
    }),
    prisma.paymentMandate.count({
      where: { deletedAt: null, status: "ACTIVE" },
    }),
    prisma.event.count({
      where: {
        deletedAt: null,
        published: true,
        status: "SCHEDULED",
        startsAt: { gte: now },
      },
    }),
    prisma.auditLog.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      include: {
        actor: { select: { name: true, email: true } },
      },
    }),
    prisma.event.findMany({
      where: {
        deletedAt: null,
        published: true,
        status: "SCHEDULED",
        startsAt: { gte: now },
      },
      orderBy: { startsAt: "asc" },
      take: 5,
      select: {
        id: true,
        title: true,
        startsAt: true,
        venueLabel: true,
      },
    }),
    prisma.payment.findMany({
      where: {
        deletedAt: null,
        status: "SUCCESS",
        paidAt: { gte: sixMonthsAgo },
      },
      select: { amountPaise: true, paidAt: true },
    }),
  ]);

  const outstandingDuesPaise = outstandingInvoices.reduce(
    (sum, invoice) => sum + invoice.amountPaise,
    0,
  );
  const paymentCollectionPaise = recordedPayments._sum.amountPaise ?? 0;

  const monthBuckets = new Map<string, number>();
  for (let i = 0; i < 6; i += 1) {
    const d = new Date(sixMonthsAgo);
    d.setMonth(sixMonthsAgo.getMonth() + i);
    monthBuckets.set(monthKey(d), 0);
  }
  for (const payment of recentRecordedPayments) {
    if (!payment.paidAt) continue;
    const key = monthKey(payment.paidAt);
    if (monthBuckets.has(key)) {
      monthBuckets.set(key, (monthBuckets.get(key) ?? 0) + payment.amountPaise);
    }
  }

  return {
    totalMembers,
    activeMembers,
    pendingMembers,
    inactiveMembers,
    suspendedMembers,
    paymentCollectionPaise,
    paymentCollectionLabel: formatAmountLabel(paymentCollectionPaise),
    outstandingDuesCount: outstandingInvoices.length,
    outstandingDuesPaise,
    outstandingDuesLabel: formatAmountLabel(outstandingDuesPaise),
    paymentFailures,
    activeMandates,
    upcomingEvents,
    memberStatusSeries: [
      { label: "Active", value: activeMembers },
      { label: "Pending", value: pendingMembers },
      { label: "Inactive", value: inactiveMembers },
      { label: "Suspended", value: suspendedMembers },
    ],
    collectionByMonth: [...monthBuckets.entries()].map(([label, amountPaise]) => ({
      label,
      amountPaise,
    })),
    recentActivity: recentLogs.map((log) => ({
      id: log.id,
      action: log.action,
      entityType: log.entityType,
      entityId: log.entityId,
      actorName: log.actor?.name ?? log.actor?.email ?? "System",
      createdAt: log.createdAt.toISOString(),
    })),
    upcomingEventItems: upcomingEventItems.map((event) => ({
      id: event.id,
      title: event.title,
      startsAt: event.startsAt.toISOString(),
      venueLabel: event.venueLabel,
    })),
  };
}
