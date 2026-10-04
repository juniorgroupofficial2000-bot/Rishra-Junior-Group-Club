import {
  Permissions,
  canAccessAdminPortal,
  hasPermission,
  type Permission,
} from "@/server/domain/permissions";
import {
  canAccessMemberPortal,
  type AppRole,
} from "@/server/domain/roles";

/** Thrown by server actions / services; never rely on client-side redirects alone. */
export class AuthorizationError extends Error {
  readonly status: 401 | 403;
  readonly code: "UNAUTHENTICATED" | "FORBIDDEN";

  constructor(
    message: string,
    options?: { status?: 401 | 403; code?: "UNAUTHENTICATED" | "FORBIDDEN" },
  ) {
    super(message);
    this.name = "AuthorizationError";
    this.status = options?.status ?? 403;
    this.code = options?.code ?? "FORBIDDEN";
  }
}

export function assertAuthenticated(
  userId: string | null | undefined,
): asserts userId is string {
  if (!userId) {
    throw new AuthorizationError("Authentication required.", {
      status: 401,
      code: "UNAUTHENTICATED",
    });
  }
}

export function assertAdminAccess(role: AppRole | undefined): void {
  if (!canAccessAdminPortal(role)) {
    throw new AuthorizationError("Admin access denied.");
  }
}

export function assertMemberPortalAccess(role: AppRole | undefined): void {
  if (!canAccessMemberPortal(role)) {
    throw new AuthorizationError("Member portal access denied.");
  }
}

export function assertPermission(
  role: AppRole | undefined,
  permission: Permission,
): void {
  assertAdminAccess(role);
  if (!hasPermission(role, permission)) {
    throw new AuthorizationError(`Missing permission: ${permission}.`);
  }
}

export function assertPermissions(
  role: AppRole | undefined,
  permissions: Permission[],
): void {
  assertAdminAccess(role);
  for (const permission of permissions) {
    if (!hasPermission(role, permission)) {
      throw new AuthorizationError(`Missing permission: ${permission}.`);
    }
  }
}

/**
 * Member data isolation — session memberId must match the resource memberId.
 * Never trust a client-supplied memberId without this check.
 */
export function assertMemberOwnsResource(
  sessionMemberId: string | null | undefined,
  resourceMemberId: string | null | undefined,
): void {
  if (!sessionMemberId || !resourceMemberId) {
    throw new AuthorizationError("Member context required.", {
      status: 401,
      code: "UNAUTHENTICATED",
    });
  }
  if (sessionMemberId !== resourceMemberId) {
    throw new AuthorizationError("Cannot access another member's data.");
  }
}

/** Financial ledger mutations from admin UI/API. */
export function assertCanWritePayments(role: AppRole | undefined): void {
  assertPermission(role, Permissions.PAYMENTS_WRITE);
}

export function assertCanWriteMandates(role: AppRole | undefined): void {
  assertPermission(role, Permissions.MANDATES_WRITE);
}

/** Security / environment configuration (AUTH_SECRET, SITE_URL, etc.). */
export function assertCanWriteSecuritySettings(role: AppRole | undefined): void {
  assertPermission(role, Permissions.SETTINGS_WRITE);
}

export function assertCanWriteUsers(role: AppRole | undefined): void {
  assertPermission(role, Permissions.USERS_WRITE);
}

/** True when the role may enter /admin (edge + layout). */
export function roleMayAccessAdmin(role: AppRole | undefined): boolean {
  return canAccessAdminPortal(role);
}

/** True when the role may enter /member (edge + layout). */
export function roleMayAccessMemberPortal(role: AppRole | undefined): boolean {
  return canAccessMemberPortal(role);
}
