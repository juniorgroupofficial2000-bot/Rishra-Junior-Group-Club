import "server-only";

import { auth } from "@/server/auth";
import {
  AuthorizationError,
  assertAuthenticated,
  assertPermission,
} from "@/server/auth/authorize";
import { staffNeedsMfaEnrollment } from "@/server/auth/mfa/policy";
import type { Permission } from "@/server/domain/permissions";
import { logAuthzFailure } from "@/server/observability/events";
import type { Session } from "next-auth";
import { NextResponse } from "next/server";

export type ApiAuthSuccess = { session: Session; userId: string };

/**
 * Session + permission gate for App Router API routes.
 * Returns JSON 401/403 — never rely on page redirects for APIs.
 */
export async function requireApiPermission(
  permission: Permission,
): Promise<ApiAuthSuccess | NextResponse> {
  const session = await auth();
  try {
    assertAuthenticated(session?.user?.id);
    assertPermission(session!.user.role, permission);
    if (
      staffNeedsMfaEnrollment({
        role: session!.user.role,
        mfaEnabled: Boolean(session!.user.mfaEnabled),
      })
    ) {
      logAuthzFailure({
        code: "FORBIDDEN",
        permission: "staff.mfa.enrollment",
        userId: session!.user.id,
        role: session!.user.role,
      });
      return NextResponse.json(
        {
          error: "Staff MFA enrollment is required.",
          code: "MFA_REQUIRED",
        },
        { status: 403 },
      );
    }
    return { session: session!, userId: session!.user.id };
  } catch (error) {
    if (error instanceof AuthorizationError) {
      logAuthzFailure({
        code: error.code,
        permission,
        userId: session?.user?.id,
        role: session?.user?.role,
      });
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.status },
      );
    }
    logAuthzFailure({
      code: "UNAUTHENTICATED",
      permission,
      userId: session?.user?.id,
      role: session?.user?.role,
    });
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
