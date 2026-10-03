import type {
  AttendanceRecord,
  MandateInfo,
  MemberAnnouncementItem,
  MemberEventItem,
  MemberNotification,
  MemberProfile,
  MemberStatus,
  MembershipInfo,
  PaymentRecord,
  PaymentRecordStatus,
  MandateStatus as PortalMandateStatus,
} from "@/server/repositories/contracts/member-repository";
import type { AdminMemberRecord } from "@/server/repositories/contracts/admin-member-repository";
import type { AuthUserRecord } from "@/server/repositories/contracts/user-repository";
import type { AppRole } from "@/server/domain/roles";
import type {
  Announcement,
  Event,
  EventAttendance,
  Member,
  Membership,
  MembershipPlan,
  Notification,
  Payment,
  PaymentMandate,
  Receipt,
  User,
  MemberStatus as PrismaMemberStatus,
  MandateStatus as PrismaMandateStatus,
  PaymentStatus as PrismaPaymentStatus,
} from "@prisma/client";

export function maskPhone(phone: string | null | undefined): string {
  if (!phone) return "—";
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 4) return "+•• •••••";
  return `+•• ••••• ••${digits.slice(-3)}`;
}

export function formatAmountLabel(amountPaise: number, currency = "INR"): string {
  const major = (amountPaise / 100).toFixed(2);
  if (currency === "INR") return `₹${major}`;
  return `${currency} ${major}`;
}

export function toPortalMemberStatus(status: PrismaMemberStatus): MemberStatus {
  switch (status) {
    case "APPLICATION":
      return "application";
    case "PENDING":
      return "pending";
    case "APPROVED":
      return "approved";
    case "ACTIVE":
      return "active";
    case "INACTIVE":
      return "inactive";
    case "SUSPENDED":
      return "suspended";
    case "ARCHIVED":
      return "archived";
    default:
      return "inactive";
  }
}

export function toPortalMandateStatus(
  status: PrismaMandateStatus,
): PortalMandateStatus {
  switch (status) {
    case "CREATED":
      return "created";
    case "PENDING":
      return "pending";
    case "ACTIVE":
      return "active";
    case "PAUSED":
      return "paused";
    case "CANCELLED":
      return "cancelled";
    case "FAILED":
      return "failed";
    case "EXPIRED":
      return "expired";
    default:
      return "created";
  }
}

export function toPortalPaymentStatus(
  status: PrismaPaymentStatus,
): PaymentRecordStatus {
  switch (status) {
    case "CREATED":
      return "created";
    case "PENDING":
      return "pending";
    case "AUTHORIZED":
      return "authorized";
    case "SUCCESS":
      return "success";
    case "FAILED":
      return "failed";
    case "REFUNDED":
      return "refunded";
    case "CANCELLED":
      return "cancelled";
    default:
      return "pending";
  }
}

export function toAuthUser(
  user: User & {
    member?: { id: string; status: Member["status"]; deletedAt: Date | null } | null;
  },
): AuthUserRecord {
  const member = user.member && !user.member.deletedAt ? user.member : null;
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role as AppRole,
    memberId: member?.id ?? null,
    memberStatus: member?.status ?? null,
    passwordHash: user.passwordHash,
    active: user.active && !user.deletedAt,
    mfaEnabled: user.mfaEnabled,
    mfaTotpSecretEnc: user.mfaTotpSecretEnc ?? null,
  };
}

export function toMemberProfile(member: Member): MemberProfile {
  return {
    id: member.id,
    userId: member.userId ?? "",
    membershipNumber: member.membershipNumber,
    displayName: member.displayName,
    email: member.email,
    phoneMasked: maskPhone(member.phone),
    status: toPortalMemberStatus(member.status),
    joinedOn: member.joinedOn
      ? member.joinedOn.toISOString().slice(0, 10)
      : "—",
    addressLine: [member.addressLine1, member.city, member.state]
      .filter(Boolean)
      .join(", ") || "Address on file",
  };
}

export function toMembershipInfo(
  membership: Membership & { plan: MembershipPlan },
  memberStatus: PrismaMemberStatus,
): MembershipInfo {
  return {
    memberId: membership.memberId,
    planLabel: membership.plan.name,
    status: toPortalMemberStatus(memberStatus),
    billingCycleLabel: membership.plan.billingCycle.replaceAll("_", " "),
    duesAmountLabel: formatAmountLabel(
      membership.plan.amountPaise,
      membership.plan.currency,
    ),
    nextDueOn: membership.nextDueOn
      ? membership.nextDueOn.toISOString().slice(0, 10)
      : null,
  };
}

export function toMandateInfo(mandate: PaymentMandate | null, memberId: string): MandateInfo {
  if (!mandate) {
    return {
      memberId,
      status: "created",
      providerLabel: "Payment provider (not connected)",
      lastUpdatedOn: null,
      nextDebitOn: null,
      note: "No mandate on file. Payment credentials are never stored in this system.",
    };
  }
  return {
    memberId,
    status: toPortalMandateStatus(mandate.status),
    providerLabel: mandate.provider
      ? `${mandate.provider} (reference only)`
      : "Payment provider (not connected)",
    lastUpdatedOn: mandate.lastStatusAt
      ? mandate.lastStatusAt.toISOString().slice(0, 10)
      : null,
    nextDebitOn: mandate.nextDebitAt
      ? mandate.nextDebitAt.toISOString().slice(0, 10)
      : null,
    note:
      mandate.note ??
      "Mandate status is informational. No payment credentials are stored.",
  };
}

export function toPaymentRecord(
  payment: Payment & { receipt?: Receipt | null },
): PaymentRecord {
  return {
    id: payment.id,
    memberId: payment.memberId,
    amountLabel: formatAmountLabel(payment.amountPaise, payment.currency),
    paidOn: payment.paidAt ? payment.paidAt.toISOString().slice(0, 10) : null,
    status: toPortalPaymentStatus(payment.status),
    methodLabel: payment.method.replaceAll("_", " "),
    receiptNumber: payment.receipt?.number ?? null,
    isSample: payment.isSample,
  };
}

export function toEventItem(
  event: Event & { _count?: { registrations: number } },
): MemberEventItem {
  return {
    id: event.id,
    title: event.title,
    startsAt: event.startsAt.toISOString(),
    venueLabel: event.venueLabel ?? "TBA",
    href: `/events/${event.slug}`,
    registrationRequired: event.registrationRequired,
    capacity: event.capacity,
    registeredCount: event._count?.registrations ?? 0,
  };
}

export function toAnnouncementItem(item: Announcement): MemberAnnouncementItem {
  return {
    id: item.id,
    title: item.title,
    publishedAt: item.publishedAt
      ? item.publishedAt.toISOString().slice(0, 10)
      : item.createdAt.toISOString().slice(0, 10),
    href: `/announcements/${item.slug}`,
    pinned: item.pinned,
  };
}

export function toAttendanceRecord(
  row: EventAttendance & { event: Event },
): AttendanceRecord {
  const status =
    row.status === "PRESENT"
      ? "present"
      : row.status === "ABSENT"
        ? "absent"
        : "registered";
  return {
    id: row.id,
    eventTitle: row.event.title,
    occurredOn: row.recordedAt.toISOString().slice(0, 10),
    status,
  };
}

export function toNotification(row: Notification): MemberNotification {
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    createdAt: row.createdAt.toISOString(),
    read: Boolean(row.readAt),
  };
}

type MemberWithPlan = Member & {
  memberships: Array<Membership & { plan: MembershipPlan }>;
  portraitAsset?: {
    id: string;
    status: string;
    deletedAt: Date | null;
  } | null;
  committeeAssignments?: Array<{
    deletedAt: Date | null;
    position: { title: string; code: string };
  }>;
  payments?: Array<{ status: string }>;
};

export function toAdminMemberRecord(member: MemberWithPlan): AdminMemberRecord {
  const current = member.memberships.find((m) => m.isCurrent) ?? member.memberships[0];
  const assignment = member.committeeAssignments?.find((row) => row.deletedAt == null);
  const portraitReady =
    member.portraitAsset &&
    member.portraitAsset.deletedAt == null &&
    member.portraitAsset.status === "READY";
  const latestPayment = member.payments?.[0];
  return {
    id: member.id,
    membershipNumber: member.membershipNumber,
    cardPublicId: member.cardPublicId,
    firstName: member.firstName,
    lastName: member.lastName,
    displayName: member.displayName,
    email: member.email,
    phone: member.phone,
    dateOfBirth: member.dateOfBirth ?? null,
    status: member.status,
    joinedOn: member.joinedOn,
    addressLine1: member.addressLine1,
    addressLine2: member.addressLine2,
    city: member.city,
    state: member.state,
    postalCode: member.postalCode,
    country: member.country,
    emergencyContactName: member.emergencyContactName ?? null,
    emergencyContactPhone: member.emergencyContactPhone ?? null,
    reviewNotes: member.reviewNotes ?? null,
    statusReason: member.statusReason ?? null,
    portraitAssetId: member.portraitAssetId ?? null,
    portraitUrl: portraitReady
      ? `/api/media/${member.portraitAsset!.id}?v=md`
      : null,
    internalNotes: member.internalNotes,
    userId: member.userId,
    isSample: member.isSample,
    createdAt: member.createdAt,
    updatedAt: member.updatedAt,
    deletedAt: member.deletedAt,
    currentPlanLabel: current?.plan.name ?? null,
    currentPlanId: current?.planId ?? null,
    committeeRoleLabel: assignment?.position.title ?? null,
    paymentStatusLabel: latestPayment?.status ?? null,
  };
}
