import "server-only";

import { prisma } from "@/server/db/prisma";
import { formatAmountLabel } from "@/server/repositories/prisma/mappers";
import { getMemberForAdmin } from "@/server/services/member-admin-service";
import { loadMemberActivityTimeline } from "@/server/services/member-activity-service";
import { loadPublicMemberCardByToken } from "@/server/services/member-card-service";

export async function loadAdminMemberDetail(memberId: string) {
  const member = await getMemberForAdmin(memberId);

  const [payments, attendances, registrations, activity, card] =
    await Promise.all([
      prisma.payment.findMany({
        where: { memberId, deletedAt: null },
        orderBy: { createdAt: "desc" },
        take: 25,
        select: {
          id: true,
          status: true,
          amountPaise: true,
          currency: true,
          paidAt: true,
          createdAt: true,
          receipt: { select: { number: true } },
        },
      }),
      prisma.eventAttendance.findMany({
        where: { memberId, deletedAt: null },
        orderBy: { recordedAt: "desc" },
        take: 25,
        include: {
          event: { select: { title: true, startsAt: true } },
        },
      }),
      prisma.eventRegistration.findMany({
        where: { memberId, deletedAt: null },
        orderBy: { registeredAt: "desc" },
        take: 25,
        include: {
          event: { select: { title: true, startsAt: true, slug: true } },
        },
      }),
      loadMemberActivityTimeline(memberId),
      loadPublicMemberCardByToken(member.cardPublicId),
    ]);

  return {
    member,
    payments: payments.map((payment) => ({
      id: payment.id,
      status: payment.status,
      amountLabel: formatAmountLabel(payment.amountPaise, payment.currency),
      paidOn: (payment.paidAt ?? payment.createdAt).toISOString().slice(0, 10),
      receiptNumber: payment.receipt?.number ?? null,
    })),
    attendance: attendances.map((row) => ({
      id: row.id,
      eventTitle: row.event.title,
      occurredOn: row.recordedAt.toISOString().slice(0, 10),
      status: row.status,
    })),
    events: registrations.map((row) => ({
      id: row.id,
      title: row.event.title,
      startsAt: row.event.startsAt.toISOString().slice(0, 10),
      status: row.status,
      href: `/events/${row.event.slug}`,
    })),
    activity,
    card,
  };
}
