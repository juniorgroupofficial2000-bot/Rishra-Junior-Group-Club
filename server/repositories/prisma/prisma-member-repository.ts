import "server-only";

import { prisma } from "@/server/db/prisma";
import type { MemberRepository } from "@/server/repositories/contracts/member-repository";
import {
  toAnnouncementItem,
  toAttendanceRecord,
  toEventItem,
  toMandateInfo,
  toMemberProfile,
  toMembershipInfo,
  toNotification,
  toPaymentRecord,
} from "@/server/repositories/prisma/mappers";

async function currentMembership(memberId: string) {
  return prisma.membership.findFirst({
    where: { memberId, deletedAt: null, isCurrent: true },
    include: { plan: true },
    orderBy: { updatedAt: "desc" },
  });
}

export const prismaMemberRepository: MemberRepository = {
  async getProfileByUserId(userId) {
    const member = await prisma.member.findFirst({
      where: { userId, deletedAt: null },
    });
    return member ? toMemberProfile(member) : null;
  },

  async getMembership(memberId) {
    const member = await prisma.member.findFirst({
      where: { id: memberId, deletedAt: null },
    });
    if (!member) return null;
    const membership = await currentMembership(memberId);
    if (!membership) return null;
    return toMembershipInfo(membership, member.status);
  },

  async getMandate(memberId) {
    const mandate = await prisma.paymentMandate.findFirst({
      where: { memberId, deletedAt: null },
      orderBy: { updatedAt: "desc" },
    });
    return toMandateInfo(mandate, memberId);
  },

  async getPayments(memberId) {
    const payments = await prisma.payment.findMany({
      where: { memberId, deletedAt: null },
      include: { receipt: true },
      orderBy: [{ paidAt: "desc" }, { createdAt: "desc" }],
      take: 50,
    });
    return payments.map(toPaymentRecord);
  },

  async getReceipts(memberId) {
    const payments = await prisma.payment.findMany({
      where: {
        memberId,
        deletedAt: null,
        status: "SUCCESS",
        receipt: { isNot: null },
      },
      include: { receipt: true },
      orderBy: { paidAt: "desc" },
      take: 50,
    });
    return payments.map(toPaymentRecord);
  },

  async getUpcomingEvents(memberId) {
    void memberId;
    const events = await prisma.event.findMany({
      where: {
        deletedAt: null,
        published: true,
        status: { in: ["SCHEDULED"] },
        startsAt: { gte: new Date() },
      },
      orderBy: { startsAt: "asc" },
      take: 10,
    });
    return events.map(toEventItem);
  },

  async getAnnouncements(memberId) {
    void memberId;
    const items = await prisma.announcement.findMany({
      where: {
        deletedAt: null,
        status: "PUBLISHED",
      },
      orderBy: [{ pinned: "desc" }, { publishedAt: "desc" }],
      take: 10,
    });
    return items.map(toAnnouncementItem);
  },

  async getAttendance(memberId) {
    const rows = await prisma.eventAttendance.findMany({
      where: { memberId, deletedAt: null },
      include: { event: true },
      orderBy: { recordedAt: "desc" },
      take: 50,
    });
    return rows.map(toAttendanceRecord);
  },

  async getNotifications(memberId) {
    const member = await prisma.member.findFirst({
      where: { id: memberId, deletedAt: null },
      select: { userId: true },
    });
    if (!member?.userId) return [];
    const rows = await prisma.notification.findMany({
      where: { userId: member.userId, deletedAt: null },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return rows.map(toNotification);
  },

  async getDashboard(userId) {
    const member = await prisma.member.findFirst({
      where: { userId, deletedAt: null },
    });
    if (!member) return null;

    const [membership, mandate, recentPayments, upcomingEvents, announcements] =
      await Promise.all([
        currentMembership(member.id),
        prisma.paymentMandate.findFirst({
          where: { memberId: member.id, deletedAt: null },
          orderBy: { updatedAt: "desc" },
        }),
        prisma.payment.findMany({
          where: { memberId: member.id, deletedAt: null },
          include: { receipt: true },
          orderBy: [{ paidAt: "desc" }, { createdAt: "desc" }],
          take: 5,
        }),
        prisma.event.findMany({
          where: {
            deletedAt: null,
            published: true,
            status: "SCHEDULED",
            startsAt: { gte: new Date() },
          },
          orderBy: { startsAt: "asc" },
          take: 5,
        }),
        prisma.announcement.findMany({
          where: { deletedAt: null, status: "PUBLISHED" },
          orderBy: [{ pinned: "desc" }, { publishedAt: "desc" }],
          take: 5,
        }),
      ]);

    const profile = toMemberProfile(member);
    const membershipInfo = membership
      ? toMembershipInfo(membership, member.status)
      : {
          memberId: member.id,
          planLabel: "No plan assigned",
          status: profile.status,
          billingCycleLabel: "—",
          duesAmountLabel: "—",
          nextDueOn: null,
        };

    return {
      profile,
      membership: membershipInfo,
      currentDuesLabel: membershipInfo.duesAmountLabel,
      nextPaymentOn: membershipInfo.nextDueOn,
      mandate: toMandateInfo(mandate, member.id),
      recentPayments: recentPayments.map(toPaymentRecord),
      upcomingEvents: upcomingEvents.map(toEventItem),
      announcements: announcements.map(toAnnouncementItem),
    };
  },
};
