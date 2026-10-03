import "server-only";

import { prisma } from "@/server/db/prisma";

export type MemberActivityItem = {
  id: string;
  label: string;
  detail: string | null;
  occurredAt: string;
  source: "audit" | "payment" | "attendance" | "registration";
};

function labelForAuditAction(action: string, metadata: unknown): string {
  const meta =
    metadata && typeof metadata === "object"
      ? (metadata as Record<string, unknown>)
      : {};
  switch (action) {
    case "member.create":
      return "Membership record created";
    case "member.updated":
      return "Profile updated";
    case "member.status_change": {
      const status = typeof meta.status === "string" ? meta.status : null;
      if (status === "ACTIVE" || status === "APPROVED") {
        return "Membership approved / activated";
      }
      if (status === "SUSPENDED") return "Membership suspended";
      if (status === "INACTIVE") return "Membership set inactive";
      if (status === "ARCHIVED") return "Membership archived";
      if (status === "APPLICATION") return "Changes requested";
      if (status === "PENDING") return "Moved to pending review";
      return "Membership status changed";
    }
    case "member.deleted":
      return "Membership archived";
    case "event.registration":
      return "Event registration recorded";
    case "payment.updated":
      return "Payment updated";
    default:
      return action.replaceAll(".", " ");
  }
}

/**
 * Real activity only — assembled from audit logs + related operational rows.
 * Never fabricates events.
 */
export async function loadMemberActivityTimeline(
  memberId: string,
  limit = 40,
): Promise<MemberActivityItem[]> {
  const [audits, payments, attendances, registrations] = await Promise.all([
    prisma.auditLog.findMany({
      where: { entityType: "Member", entityId: memberId },
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        action: true,
        metadata: true,
        createdAt: true,
      },
    }),
    prisma.payment.findMany({
      where: { memberId, deletedAt: null, status: "SUCCESS" },
      orderBy: { paidAt: "desc" },
      take: 20,
      select: {
        id: true,
        amountPaise: true,
        currency: true,
        paidAt: true,
        createdAt: true,
      },
    }),
    prisma.eventAttendance.findMany({
      where: { memberId, deletedAt: null },
      orderBy: { recordedAt: "desc" },
      take: 20,
      include: { event: { select: { title: true } } },
    }),
    prisma.eventRegistration.findMany({
      where: {
        memberId,
        deletedAt: null,
        status: { in: ["REGISTERED", "WAITLISTED", "CANCELLED"] },
      },
      orderBy: { registeredAt: "desc" },
      take: 20,
      include: { event: { select: { title: true } } },
    }),
  ]);

  const items: MemberActivityItem[] = [];

  for (const row of audits) {
    items.push({
      id: `audit-${row.id}`,
      label: labelForAuditAction(row.action, row.metadata),
      detail:
        row.metadata &&
        typeof row.metadata === "object" &&
        "reason" in row.metadata &&
        typeof (row.metadata as { reason?: unknown }).reason === "string"
          ? String((row.metadata as { reason: string }).reason)
          : null,
      occurredAt: row.createdAt.toISOString(),
      source: "audit",
    });
  }

  for (const payment of payments) {
    const amount = (payment.amountPaise / 100).toLocaleString("en-IN", {
      style: "currency",
      currency: payment.currency || "INR",
    });
    items.push({
      id: `pay-${payment.id}`,
      label: "Payment received",
      detail: amount,
      occurredAt: (payment.paidAt ?? payment.createdAt).toISOString(),
      source: "payment",
    });
  }

  for (const row of attendances) {
    items.push({
      id: `att-${row.id}`,
      label: "Event attendance recorded",
      detail: row.event.title,
      occurredAt: row.recordedAt.toISOString(),
      source: "attendance",
    });
  }

  for (const row of registrations) {
    items.push({
      id: `reg-${row.id}`,
      label:
        row.status === "CANCELLED"
          ? "Event registration cancelled"
          : "Event registration recorded",
      detail: row.event.title,
      occurredAt: row.registeredAt.toISOString(),
      source: "registration",
    });
  }

  return items
    .sort(
      (a, b) =>
        new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
    )
    .slice(0, limit);
}
