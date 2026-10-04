import "server-only";

import { prisma } from "@/server/db/prisma";
import { formatAmountLabel } from "@/server/repositories/prisma/mappers";
import { formatRoleLabel, type AppRole } from "@/server/domain/roles";

export async function listAdminPayments(limit = 50) {
  const payments = await prisma.payment.findMany({
    where: { deletedAt: null },
    include: {
      member: {
        select: { id: true, displayName: true, membershipNumber: true },
      },
      receipt: { select: { number: true } },
    },
    orderBy: [{ paidAt: "desc" }, { createdAt: "desc" }],
    take: limit,
  });

  return payments.map((payment) => ({
    id: payment.id,
    memberName: payment.member.displayName,
    membershipNumber: payment.member.membershipNumber,
    amountLabel: formatAmountLabel(payment.amountPaise, payment.currency),
    status: payment.status,
    method: payment.method,
    paidAt: payment.paidAt?.toISOString() ?? null,
    receiptNumber: payment.receipt?.number ?? null,
    isSample: payment.isSample,
  }));
}

export async function listAdminMandates(input?: {
  status?:
    | "CREATED"
    | "PENDING"
    | "ACTIVE"
    | "PAUSED"
    | "FAILED"
    | "CANCELLED"
    | "EXPIRED"
    | "ALL_ACTIVE"
    | "ALL_FAILED"
    | "ALL_CANCELLED";
  limit?: number;
}) {
  const limit = input?.limit ?? 100;
  const statusFilter =
    input?.status === "ALL_ACTIVE"
      ? { status: "ACTIVE" as const }
      : input?.status === "ALL_FAILED"
        ? { status: "FAILED" as const }
        : input?.status === "ALL_CANCELLED"
          ? { status: "CANCELLED" as const }
          : input?.status
            ? { status: input.status }
            : {};

  const mandates = await prisma.paymentMandate.findMany({
    where: { deletedAt: null, ...statusFilter },
    include: {
      member: {
        select: { id: true, displayName: true, membershipNumber: true },
      },
    },
    orderBy: { updatedAt: "desc" },
    take: limit,
  });

  return mandates.map((mandate) => ({
    id: mandate.id,
    memberId: mandate.member.id,
    memberName: mandate.member.displayName,
    membershipNumber: mandate.member.membershipNumber,
    status: mandate.status,
    provider: mandate.provider,
    providerMandateRef: mandate.providerMandateRef,
    nextDebitAt: mandate.nextDebitAt?.toISOString() ?? null,
    amountPaise: mandate.amountPaise,
    note: mandate.note,
    lastStatusAt: mandate.lastStatusAt?.toISOString() ?? null,
    isSample: mandate.isSample,
  }));
}

export async function listAdminEvents(limit = 50) {
  return prisma.event.findMany({
    where: { deletedAt: null },
    orderBy: { startsAt: "desc" },
    take: limit,
    select: {
      id: true,
      slug: true,
      title: true,
      startsAt: true,
      venueLabel: true,
      status: true,
      published: true,
      isSample: true,
      _count: { select: { registrations: true } },
    },
  });
}

export async function listAdminGallery(limit = 50) {
  return prisma.galleryAlbum.findMany({
    where: { deletedAt: null },
    orderBy: { updatedAt: "desc" },
    take: limit,
    select: {
      id: true,
      slug: true,
      title: true,
      published: true,
      isSample: true,
      _count: { select: { media: true } },
      updatedAt: true,
    },
  });
}

export async function listAdminAnnouncements(limit = 50) {
  return prisma.announcement.findMany({
    where: { deletedAt: null },
    orderBy: [{ pinned: "desc" }, { publishedAt: "desc" }],
    take: limit,
    select: {
      id: true,
      slug: true,
      title: true,
      status: true,
      pinned: true,
      publishedAt: true,
      isSample: true,
    },
  });
}

export async function listAdminCommittee() {
  const positions = await prisma.committeePosition.findMany({
    where: { deletedAt: null },
    orderBy: { sortOrder: "asc" },
    include: {
      assignments: {
        where: { deletedAt: null, isCurrent: true },
        include: {
          member: {
            select: {
              id: true,
              displayName: true,
              membershipNumber: true,
              status: true,
            },
          },
        },
      },
    },
  });

  return positions.map((position) => ({
    id: position.id,
    code: position.code,
    title: position.title,
    active: position.active,
    assignments: position.assignments.map((assignment) => ({
      id: assignment.id,
      memberId: assignment.member.id,
      memberName: assignment.member.displayName,
      membershipNumber: assignment.member.membershipNumber,
      memberStatus: assignment.member.status,
      startsOn: assignment.startsOn.toISOString().slice(0, 10),
    })),
  }));
}

export async function listAdminUsers(limit = 100) {
  const users = await prisma.user.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      active: true,
      createdAt: true,
      member: { select: { id: true, membershipNumber: true } },
    },
  });

  return users.map((user) => ({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role as AppRole,
    roleLabel: formatRoleLabel(user.role as AppRole),
    active: user.active,
    createdAt: user.createdAt.toISOString(),
    memberId: user.member?.id ?? null,
    membershipNumber: user.member?.membershipNumber ?? null,
  }));
}

export async function loadAdminReportsSummary() {
  const [membersByStatus, paymentsByStatus, mandatesByStatus] =
    await Promise.all([
      prisma.member.groupBy({
        by: ["status"],
        where: { deletedAt: null },
        _count: { _all: true },
      }),
      prisma.payment.groupBy({
        by: ["status"],
        where: { deletedAt: null },
        _count: { _all: true },
        _sum: { amountPaise: true },
      }),
      prisma.paymentMandate.groupBy({
        by: ["status"],
        where: { deletedAt: null },
        _count: { _all: true },
      }),
    ]);

  return {
    membersByStatus: membersByStatus.map((row) => ({
      status: row.status,
      count: row._count._all,
    })),
    paymentsByStatus: paymentsByStatus.map((row) => ({
      status: row.status,
      count: row._count._all,
      amountLabel: formatAmountLabel(row._sum.amountPaise ?? 0),
    })),
    mandatesByStatus: mandatesByStatus.map((row) => ({
      status: row.status,
      count: row._count._all,
    })),
  };
}
