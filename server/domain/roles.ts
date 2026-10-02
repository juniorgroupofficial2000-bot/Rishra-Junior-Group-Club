export const AppRoles = [
  "PUBLIC",
  "MEMBER",
  "COMMITTEE",
  "COMMITTEE_MEMBER",
  "CONTENT_MANAGER",
  "EVENT_MANAGER",
  "VICE_PRESIDENT",
  "TREASURER",
  "SECRETARY",
  "PRESIDENT",
  "ADMIN",
  "SUPER_ADMIN",
] as const;

export type AppRole = (typeof AppRoles)[number];

/** Production-facing roles (excludes legacy ADMIN/COMMITTEE aliases). */
export const StaffRoles = [
  "SUPER_ADMIN",
  "PRESIDENT",
  "SECRETARY",
  "TREASURER",
  "VICE_PRESIDENT",
  "COMMITTEE_MEMBER",
  "CONTENT_MANAGER",
  "EVENT_MANAGER",
  "MEMBER",
] as const;

export type StaffRole = (typeof StaffRoles)[number];

const rank: Record<AppRole, number> = {
  PUBLIC: 0,
  MEMBER: 10,
  COMMITTEE: 20,
  COMMITTEE_MEMBER: 20,
  CONTENT_MANAGER: 25,
  EVENT_MANAGER: 25,
  VICE_PRESIDENT: 30,
  TREASURER: 30,
  SECRETARY: 32,
  PRESIDENT: 35,
  ADMIN: 40,
  SUPER_ADMIN: 40,
};

export function hasMinimumRole(
  role: AppRole | undefined,
  minimum: AppRole,
): boolean {
  if (!role) return false;
  return rank[role] >= rank[minimum];
}

export function canAccessMemberPortal(role: AppRole | undefined): boolean {
  return hasMinimumRole(role, "MEMBER");
}

export function normalizeAppRole(value: unknown): AppRole {
  if (typeof value !== "string") return "PUBLIC";
  if ((AppRoles as readonly string[]).includes(value)) {
    return value as AppRole;
  }
  return "PUBLIC";
}

export function formatRoleLabel(role: AppRole): string {
  return role.replaceAll("_", " ");
}
