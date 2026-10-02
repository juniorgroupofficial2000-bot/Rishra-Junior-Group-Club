import "server-only";

import { auth } from "@/server/auth";
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
