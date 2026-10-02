/** Canonical audit action names for sensitive operations. */
export const AuditActions = {
  MEMBER_UPDATED: "member.updated",
  MEMBER_DELETED: "member.deleted",
  MEMBER_STATUS_CHANGED: "member.status_change",
  MEMBER_CREATED: "member.create",
  PAYMENT_UPDATED: "payment.updated",
  MANDATE_CREATED: "mandate.created",
  MANDATE_CANCELLED: "mandate.cancelled",
  COMMITTEE_UPDATED: "committee.updated",
  ADMIN_CREATED: "admin.created",
  ADMIN_PERMISSION_CHANGED: "admin.permission_changed",
  ANNOUNCEMENT_PUBLISHED: "announcement.published",
  EVENT_REGISTRATION: "event.registration",
} as const;

export type AuditAction = (typeof AuditActions)[keyof typeof AuditActions];
