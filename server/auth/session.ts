import "server-only";

import { auth } from "@/server/auth";
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
import { redirect } from "next/navigation";

export async function getServerSession() {
  return auth();
}

export async function requireSession(callbackUrl = "/member/dashboard") {
  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }
  return session;
}

export async function requireMemberSession(callbackUrl?: string) {
  const session = await requireSession(callbackUrl ?? "/member/dashboard");
  if (!canAccessMemberPortal(session.user.role)) {
    redirect("/login?error=AccessDenied");
  }
  return session;
}

export async function requireAdminSession(callbackUrl?: string) {
  const path = callbackUrl ?? "/admin/dashboard";
  const session = await requireSession(path);
  if (!canAccessAdminPortal(session.user.role)) {
    redirect("/login?error=AccessDenied");
  }
  return session;
}

export async function requirePermission(
  permission: Permission,
  callbackUrl = "/admin/dashboard",
) {
  const session = await requireAdminSession(callbackUrl);
  if (!hasPermission(session.user.role, permission)) {
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
    redirect("/login?error=AccessDenied");
  }
  return session;
}
