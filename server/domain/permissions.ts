import type { AppRole } from "@/server/domain/roles";

/** Fine-grained admin permissions — enforced only on the server. */
export const Permissions = {
  ADMIN_ACCESS: "admin.access",
  DASHBOARD_VIEW: "admin.dashboard.view",
  MEMBERS_READ: "admin.members.read",
  MEMBERS_WRITE: "admin.members.write",
  MEMBERS_DELETE: "admin.members.delete",
  MEMBERS_STATUS: "admin.members.status",
  MEMBERS_EXPORT: "admin.members.export",
  COMMITTEE_READ: "admin.committee.read",
  COMMITTEE_WRITE: "admin.committee.write",
  PAYMENTS_READ: "admin.payments.read",
  PAYMENTS_WRITE: "admin.payments.write",
  MANDATES_READ: "admin.mandates.read",
  MANDATES_WRITE: "admin.mandates.write",
  EVENTS_READ: "admin.events.read",
  EVENTS_WRITE: "admin.events.write",
  GALLERY_READ: "admin.gallery.read",
  GALLERY_WRITE: "admin.gallery.write",
  ANNOUNCEMENTS_READ: "admin.announcements.read",
  ANNOUNCEMENTS_WRITE: "admin.announcements.write",
  PUJA_READ: "admin.puja.read",
  PUJA_WRITE: "admin.puja.write",
  CONTENT_READ: "admin.content.read",
  CONTENT_WRITE: "admin.content.write",
  MEDIA_READ: "admin.media.read",
  MEDIA_WRITE: "admin.media.write",
  DOCUMENTS_READ: "admin.documents.read",
  DOCUMENTS_WRITE: "admin.documents.write",
  REPORTS_VIEW: "admin.reports.view",
  AUDIT_READ: "admin.audit.read",
  SETTINGS_READ: "admin.settings.read",
  SETTINGS_WRITE: "admin.settings.write",
  USERS_READ: "admin.users.read",
  USERS_WRITE: "admin.users.write",
} as const;

export type Permission = (typeof Permissions)[keyof typeof Permissions];

const ALL_PERMISSIONS = Object.values(Permissions);

const officerBase: Permission[] = [
  Permissions.ADMIN_ACCESS,
  Permissions.DASHBOARD_VIEW,
  Permissions.MEMBERS_READ,
  Permissions.COMMITTEE_READ,
  Permissions.PAYMENTS_READ,
  Permissions.MANDATES_READ,
  Permissions.EVENTS_READ,
  Permissions.ANNOUNCEMENTS_READ,
  Permissions.REPORTS_VIEW,
];

const ROLE_PERMISSIONS: Record<AppRole, readonly Permission[]> = {
  PUBLIC: [],
  MEMBER: [],
  /** @deprecated legacy — treated like COMMITTEE_MEMBER */
  COMMITTEE: [
    ...officerBase,
    Permissions.GALLERY_READ,
    Permissions.PUJA_READ,
    Permissions.DOCUMENTS_READ,
  ],
  COMMITTEE_MEMBER: [
    ...officerBase,
    Permissions.GALLERY_READ,
    Permissions.PUJA_READ,
    Permissions.DOCUMENTS_READ,
  ],
  CONTENT_MANAGER: [
    Permissions.ADMIN_ACCESS,
    Permissions.DASHBOARD_VIEW,
    Permissions.CONTENT_READ,
    Permissions.CONTENT_WRITE,
    Permissions.MEDIA_READ,
    Permissions.MEDIA_WRITE,
    Permissions.GALLERY_READ,
    Permissions.GALLERY_WRITE,
    Permissions.ANNOUNCEMENTS_READ,
    Permissions.ANNOUNCEMENTS_WRITE,
    Permissions.PUJA_READ,
    Permissions.PUJA_WRITE,
    Permissions.DOCUMENTS_READ,
    Permissions.DOCUMENTS_WRITE,
    Permissions.EVENTS_READ,
    Permissions.EVENTS_WRITE,
    Permissions.COMMITTEE_READ,
  ],
  EVENT_MANAGER: [
    Permissions.ADMIN_ACCESS,
    Permissions.DASHBOARD_VIEW,
    Permissions.EVENTS_READ,
    Permissions.EVENTS_WRITE,
    Permissions.MEDIA_READ,
    Permissions.MEDIA_WRITE,
    Permissions.ANNOUNCEMENTS_READ,
    Permissions.ANNOUNCEMENTS_WRITE,
    Permissions.MEMBERS_READ,
    Permissions.GALLERY_READ,
  ],
  VICE_PRESIDENT: [
    ...officerBase,
    Permissions.MEMBERS_WRITE,
    Permissions.MEMBERS_STATUS,
    Permissions.MEMBERS_EXPORT,
    Permissions.COMMITTEE_WRITE,
    Permissions.CONTENT_READ,
    Permissions.CONTENT_WRITE,
    Permissions.MEDIA_READ,
    Permissions.MEDIA_WRITE,
    Permissions.EVENTS_WRITE,
    Permissions.ANNOUNCEMENTS_WRITE,
    Permissions.GALLERY_READ,
    Permissions.GALLERY_WRITE,
    Permissions.PUJA_READ,
    Permissions.PUJA_WRITE,
    Permissions.DOCUMENTS_READ,
    Permissions.DOCUMENTS_WRITE,
    Permissions.AUDIT_READ,
    Permissions.SETTINGS_READ,
    Permissions.USERS_READ,
  ],
  TREASURER: [
    Permissions.ADMIN_ACCESS,
    Permissions.DASHBOARD_VIEW,
    Permissions.MEMBERS_READ,
    Permissions.MEMBERS_EXPORT,
    Permissions.PAYMENTS_READ,
    Permissions.PAYMENTS_WRITE,
    Permissions.MANDATES_READ,
    Permissions.MANDATES_WRITE,
    Permissions.REPORTS_VIEW,
    Permissions.AUDIT_READ,
    Permissions.EVENTS_READ,
  ],
  SECRETARY: [
    ...officerBase,
    Permissions.MEMBERS_WRITE,
    Permissions.MEMBERS_STATUS,
    Permissions.MEMBERS_EXPORT,
    Permissions.COMMITTEE_WRITE,
    Permissions.CONTENT_READ,
    Permissions.CONTENT_WRITE,
    Permissions.MEDIA_READ,
    Permissions.MEDIA_WRITE,
    Permissions.EVENTS_WRITE,
    Permissions.ANNOUNCEMENTS_WRITE,
    Permissions.DOCUMENTS_READ,
    Permissions.DOCUMENTS_WRITE,
    Permissions.GALLERY_READ,
    Permissions.PUJA_READ,
    Permissions.AUDIT_READ,
    Permissions.USERS_READ,
  ],
  PRESIDENT: [
    ...officerBase,
    Permissions.MEMBERS_WRITE,
    Permissions.MEMBERS_DELETE,
    Permissions.MEMBERS_STATUS,
    Permissions.MEMBERS_EXPORT,
    Permissions.COMMITTEE_WRITE,
    Permissions.CONTENT_READ,
    Permissions.CONTENT_WRITE,
    Permissions.MEDIA_READ,
    Permissions.MEDIA_WRITE,
    Permissions.PAYMENTS_WRITE,
    Permissions.MANDATES_WRITE,
    Permissions.EVENTS_WRITE,
    Permissions.GALLERY_READ,
    Permissions.GALLERY_WRITE,
    Permissions.ANNOUNCEMENTS_WRITE,
    Permissions.PUJA_READ,
    Permissions.PUJA_WRITE,
    Permissions.DOCUMENTS_READ,
    Permissions.DOCUMENTS_WRITE,
    Permissions.AUDIT_READ,
    Permissions.SETTINGS_READ,
    Permissions.USERS_READ,
    Permissions.USERS_WRITE,
  ],
  /** @deprecated legacy — treated like SUPER_ADMIN */
  ADMIN: ALL_PERMISSIONS,
  SUPER_ADMIN: ALL_PERMISSIONS,
};

export function permissionsForRole(role: AppRole | undefined): Permission[] {
  if (!role) return [];
  return [...(ROLE_PERMISSIONS[role] ?? [])];
}

export function hasPermission(
  role: AppRole | undefined,
  permission: Permission,
): boolean {
  return permissionsForRole(role).includes(permission);
}

export function hasAnyPermission(
  role: AppRole | undefined,
  permissions: Permission[],
): boolean {
  return permissions.some((permission) => hasPermission(role, permission));
}

export function canAccessAdminPortal(role: AppRole | undefined): boolean {
  return hasPermission(role, Permissions.ADMIN_ACCESS);
}
