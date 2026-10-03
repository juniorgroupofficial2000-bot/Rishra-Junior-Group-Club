import type { MemberStatus } from "@prisma/client";

/**
 * Allowed person-status transitions for operational membership.
 * Soft-delete / archive is handled separately.
 */
const TRANSITIONS: Record<MemberStatus, MemberStatus[]> = {
  APPLICATION: ["PENDING", "INACTIVE", "ARCHIVED"],
  PENDING: ["APPROVED", "ACTIVE", "APPLICATION", "INACTIVE", "ARCHIVED"],
  APPROVED: ["ACTIVE", "INACTIVE", "ARCHIVED"],
  ACTIVE: ["SUSPENDED", "INACTIVE", "ARCHIVED"],
  SUSPENDED: ["ACTIVE", "INACTIVE", "ARCHIVED"],
  INACTIVE: ["ACTIVE", "PENDING", "ARCHIVED"],
  ARCHIVED: [],
};

export function canTransitionMemberStatus(
  from: MemberStatus,
  to: MemberStatus,
): boolean {
  if (from === to) return true;
  return TRANSITIONS[from]?.includes(to) ?? false;
}

export function memberStatusLabel(status: MemberStatus): string {
  const labels: Record<MemberStatus, string> = {
    APPLICATION: "Application",
    PENDING: "Pending review",
    APPROVED: "Approved",
    ACTIVE: "Active",
    SUSPENDED: "Suspended",
    INACTIVE: "Inactive",
    ARCHIVED: "Archived",
  };
  return labels[status] ?? status;
}

export function portalLoginAllowed(status: MemberStatus): boolean {
  return status === "ACTIVE";
}

export const PENDING_REVIEW_STATUSES: MemberStatus[] = [
  "APPLICATION",
  "PENDING",
];
