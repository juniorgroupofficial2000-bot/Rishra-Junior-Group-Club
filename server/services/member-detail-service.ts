import "server-only";

import { prisma } from "@/server/db/prisma";
import { formatAmountLabel } from "@/server/repositories/prisma/mappers";
import { getMemberForAdmin } from "@/server/services/member-admin-service";
import { designationLabel } from "@/server/domain/committee-designations";
import { loadMemberActivityTimeline } from "@/server/services/member-activity-service";
import { loadPublicMemberCardByToken } from "@/server/services/member-card-service";

export async function loadAdminMemberDetail(memberId: string) {
  const member = await getMemberForAdmin(memberId);

  const [payments, attendances, registrations, activity, card, committeeRows] =
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
      prisma.committeeMembership.findMany({
        where: {
          memberId,
          deletedAt: null,
          committee: { deletedAt: null },
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
              status: true,
            },
          },
        },
        orderBy: [{ displayOrder: "asc" }],
      }),
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
    committeeInvolvement: committeeRows.map((row) => {
      let termLabel: string | undefined;
      if (row.committee.termYear) {
        termLabel = `Term ${row.committee.termYear}`;
      } else if (row.committee.termStart || row.committee.termEnd) {
        const start = row.committee.termStart?.getFullYear();
        const end = row.committee.termEnd?.getFullYear();
        if (start && end) termLabel = `${start}–${end}`;
        else if (start) termLabel = `From ${start}`;
      }
      return {
        id: row.id,
        committeeId: row.committee.id,
        committeeSlug: row.committee.slug,
        committeeName: row.committee.name,
        role: designationLabel(row.designation, row.designationLabel),
        status: row.status,
        committeeStatus: row.committee.status,
        termLabel,
      };
    }),
    activity,
    card,
  };
}
