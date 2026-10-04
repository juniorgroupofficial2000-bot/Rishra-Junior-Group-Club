import { Permissions, type Permission } from "@/server/domain/permissions";

export type AdminNavItem = {
  href: string;
  label: string;
  permission: Permission;
};

export const adminNav: AdminNavItem[] = [
  {
    href: "/admin/dashboard",
    label: "Dashboard",
    permission: Permissions.DASHBOARD_VIEW,
  },
  {
    href: "/admin/search",
    label: "Search",
    permission: Permissions.DASHBOARD_VIEW,
  },
  {
    href: "/admin/members",
    label: "Members",
    permission: Permissions.MEMBERS_READ,
  },
  {
    href: "/admin/memberships",
    label: "Memberships",
    permission: Permissions.MEMBERS_READ,
  },
  {
    href: "/admin/committees",
    label: "Committees",
    permission: Permissions.COMMITTEE_READ,
  },
  {
    href: "/admin/committee",
    label: "Executive roster",
    permission: Permissions.COMMITTEE_READ,
  },
  {
    href: "/admin/payments",
    label: "Payments",
    permission: Permissions.PAYMENTS_READ,
  },
  {
    href: "/admin/mandates",
    label: "Mandates",
    permission: Permissions.MANDATES_READ,
  },
  {
    href: "/admin/content",
    label: "Content",
    permission: Permissions.CONTENT_READ,
  },
  {
    href: "/admin/media",
    label: "Media",
    permission: Permissions.MEDIA_READ,
  },
  {
    href: "/admin/events",
    label: "Events",
    permission: Permissions.EVENTS_READ,
  },
  {
    href: "/admin/history",
    label: "History",
    permission: Permissions.EVENTS_READ,
  },
  {
    href: "/admin/gallery",
    label: "Gallery",
    permission: Permissions.GALLERY_READ,
  },
  {
    href: "/admin/announcements",
    label: "Announcements",
    permission: Permissions.ANNOUNCEMENTS_READ,
  },
  {
    href: "/admin/puja",
    label: "Puja archive",
    permission: Permissions.PUJA_READ,
  },
  {
    href: "/admin/documents",
    label: "Documents",
    permission: Permissions.DOCUMENTS_READ,
  },
  {
    href: "/admin/reports",
    label: "Reports",
    permission: Permissions.REPORTS_VIEW,
  },
  {
    href: "/admin/audit-logs",
    label: "Audit logs",
    permission: Permissions.AUDIT_READ,
  },
  {
    href: "/admin/users",
    label: "Users",
    permission: Permissions.USERS_READ,
  },
  {
    href: "/admin/settings",
    label: "Settings",
    permission: Permissions.SETTINGS_READ,
  },
  {
    href: "/admin/developer",
    label: "Developer",
    permission: Permissions.SETTINGS_WRITE,
  },
];
