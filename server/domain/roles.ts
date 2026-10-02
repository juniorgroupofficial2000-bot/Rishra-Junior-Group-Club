export const AppRoles = [
  "PUBLIC",
  "MEMBER",
  "COMMITTEE",
  "ADMIN",
  "SUPER_ADMIN",
] as const;

export type AppRole = (typeof AppRoles)[number];

const rank: Record<AppRole, number> = {
  PUBLIC: 0,
  MEMBER: 10,
  COMMITTEE: 20,
  ADMIN: 30,
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
