import { Permissions, type Permission } from "@/server/domain/permissions";

/**
 * Server-side permission required for each admin page.
 * Proxy only checks ADMIN_ACCESS; pages and actions enforce these.
 */
export const ADMIN_PAGE_PERMISSIONS: Record<string, Permission> = {
  "/admin/dashboard": Permissions.DASHBOARD_VIEW,
  "/admin/search": Permissions.DASHBOARD_VIEW,
  "/admin/members": Permissions.MEMBERS_READ,
  "/admin/memberships": Permissions.MEMBERS_READ,
  "/admin/committee": Permissions.COMMITTEE_READ,
  "/admin/content": Permissions.CONTENT_READ,
  "/admin/media": Permissions.MEDIA_READ,
  "/admin/payments": Permissions.PAYMENTS_READ,
  "/admin/mandates": Permissions.MANDATES_READ,
  "/admin/events": Permissions.EVENTS_READ,
  "/admin/history": Permissions.EVENTS_READ,
  "/admin/gallery": Permissions.GALLERY_READ,
  "/admin/announcements": Permissions.ANNOUNCEMENTS_READ,
  "/admin/puja": Permissions.PUJA_READ,
  "/admin/documents": Permissions.DOCUMENTS_READ,
  "/admin/reports": Permissions.REPORTS_VIEW,
  "/admin/audit-logs": Permissions.AUDIT_READ,
  "/admin/users": Permissions.USERS_READ,
  "/admin/settings": Permissions.SETTINGS_READ,
  "/admin/developer": Permissions.SETTINGS_WRITE,
};

/** Permission for nested member detail routes. */
export const ADMIN_MEMBER_DETAIL_PERMISSION = Permissions.MEMBERS_READ;

/** API routes under /api/admin/* */
export const ADMIN_API_PERMISSIONS: Record<string, Permission> = {
  "/api/admin/reports": Permissions.REPORTS_VIEW,
};

/** Session lifetime (must match auth.config session.maxAge). */
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8;

/** How often Node JWT callback re-reads user/member status from the DB. */
export const SESSION_REVALIDATE_MS = 60 * 1000;
