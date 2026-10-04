import "server-only";

import { auth } from "@/server/auth";
import { staffNeedsMfaEnrollment } from "@/server/auth/mfa/policy";
import {
  canAccessAdminPortal,
  hasPermission,
  type Permission,
} from "@/server/domain/permissions";
import {
  canAccessMemberPortal,
  type AppRole,
  hasMinimumRole,
} from "@/server/domain/roles";
import { logAuthzFailure } from "@/server/observability/events";
import { redirect } from "next/navigation";

export async function getServerSession() {
  return auth();
}

export async function requireSession(callbackUrl = "/member/dashboard") {
  const session = await auth();
  if (!session?.user?.id) {
    logAuthzFailure({
      code: "UNAUTHENTICATED",
      path: callbackUrl,
    });
    redirect(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }
  return session;
}

export async function requireMemberSession(callbackUrl?: string) {
  const path = callbackUrl ?? "/member/dashboard";
  const session = await requireSession(path);
  if (!canAccessMemberPortal(session.user.role) || !session.user.memberId) {
    logAuthzFailure({
      code: "FORBIDDEN",
      path,
      userId: session.user.id,
      role: session.user.role,
    });
    redirect("/login?error=AccessDenied");
  }
  return session;
}

export async function requireAdminSession(
  callbackUrl?: string,
  options?: { allowMfaEnrollment?: boolean },
) {
  const path = callbackUrl ?? "/admin/dashboard";
  const session = await requireSession(path);
  if (!canAccessAdminPortal(session.user.role)) {
    logAuthzFailure({
      code: "FORBIDDEN",
      path,
      userId: session.user.id,
      role: session.user.role,
    });
    redirect("/login?error=AccessDenied");
  }
  const needsMfa = staffNeedsMfaEnrollment({
    role: session.user.role,
    mfaEnabled: Boolean(session.user.mfaEnabled),
  });
  const onSettings =
    options?.allowMfaEnrollment || path.startsWith("/admin/settings");
  if (needsMfa && !onSettings) {
    logAuthzFailure({
      code: "FORBIDDEN",
      path,
      userId: session.user.id,
      role: session.user.role,
      permission: "staff.mfa.enrollment",
    });
    redirect("/admin/settings?mfa=1");
  }
  return session;
}

export async function requirePermission(
  permission: Permission,
  callbackUrl = "/admin/dashboard",
) {
  const session = await requireAdminSession(callbackUrl);
  if (!hasPermission(session.user.role, permission)) {
    logAuthzFailure({
      code: "FORBIDDEN",
      permission,
      path: callbackUrl,
      userId: session.user.id,
      role: session.user.role,
    });
    redirect("/admin/dashboard?error=forbidden");
  }
  return session;
}

export async function requirePermissions(
  permissions: Permission[],
  callbackUrl = "/admin/dashboard",
) {
  const session = await requireAdminSession(callbackUrl);
  const allowed = permissions.every((permission) =>
    hasPermission(session.user.role, permission),
  );
  if (!allowed) {
    logAuthzFailure({
      code: "FORBIDDEN",
      permission: permissions.join(","),
      path: callbackUrl,
      userId: session.user.id,
      role: session.user.role,
    });
    redirect("/admin/dashboard?error=forbidden");
  }
  return session;
}

export async function requireRole(
  minimum: AppRole,
  callbackUrl = "/member/dashboard",
) {
  const session = await requireMemberSession(callbackUrl);
  if (!hasMinimumRole(session.user.role, minimum)) {
    logAuthzFailure({
      code: "FORBIDDEN",
      path: callbackUrl,
      userId: session.user.id,
      role: session.user.role,
      permission: `role>=${minimum}`,
    });
    redirect("/login?error=AccessDenied");
  }
  return session;
}
