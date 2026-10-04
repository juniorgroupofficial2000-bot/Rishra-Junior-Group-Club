import NextAuth from "next-auth";
import { edgeAuthConfig } from "@/server/auth/auth.config";
import { staffNeedsMfaEnrollment } from "@/server/auth/mfa/policy";
import { canAccessAdminPortal } from "@/server/domain/permissions";
import { canAccessMemberPortal } from "@/server/domain/roles";
import { NextResponse } from "next/server";

const { auth } = NextAuth(edgeAuthConfig);

/**
 * Next.js 16 Proxy — edge gate for member/admin/API admin routes.
 * Layouts, pages, server actions, and API handlers still enforce permissions.
 */
function resolveProxyAppEnv(): string {
  return (process.env.APP_ENV ?? process.env.NEXT_PUBLIC_APP_ENV ?? "")
    .trim()
    .toLowerCase();
}

function isProductionLane(appEnv: string): boolean {
  return (
    appEnv === "production" ||
    (!appEnv && process.env.NODE_ENV === "production")
  );
}

export default auth((request) => {
  const { pathname } = request.nextUrl;
  const isMemberRoute = pathname.startsWith("/member");
  const isAdminRoute = pathname.startsWith("/admin");
  const isAdminApi = pathname.startsWith("/api/admin");
  const isDevApi = pathname.startsWith("/api/dev");
  const isLogin = pathname === "/login";
  const user = request.auth?.user;
  const appEnv = resolveProxyAppEnv();

  // Developer utilities must be unreachable in production (404, not a soft hide).
  if (
    isProductionLane(appEnv) &&
    (isDevApi || pathname.startsWith("/admin/developer"))
  ) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Design-system playground must not be public in production.
  if (pathname.startsWith("/design-system")) {
    if (isProductionLane(appEnv) && process.env.ALLOW_DESIGN_SYSTEM !== "true") {
      return NextResponse.redirect(new URL("/", request.nextUrl.origin));
    }
  }

  if (isAdminApi) {
    if (!user?.id || !canAccessAdminPortal(user.role)) {
      return NextResponse.json(
        { error: "Unauthorized", code: "UNAUTHENTICATED" },
        { status: 401 },
      );
    }
    if (
      staffNeedsMfaEnrollment({
        role: user.role,
        mfaEnabled: Boolean(user.mfaEnabled),
      })
    ) {
      return NextResponse.json(
        {
          error: "Staff MFA enrollment is required.",
          code: "MFA_REQUIRED",
        },
        { status: 403 },
      );
    }
    return NextResponse.next();
  }

  if (isAdminRoute) {
    if (!user?.id || !canAccessAdminPortal(user.role)) {
      const loginUrl = new URL("/login", request.nextUrl.origin);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    // Force staff authenticator enrollment before other admin pages when required.
    if (
      staffNeedsMfaEnrollment({
        role: user.role,
        mfaEnabled: Boolean(user.mfaEnabled),
      }) &&
      !pathname.startsWith("/admin/settings")
    ) {
      const mfaUrl = new URL("/admin/settings", request.nextUrl.origin);
      mfaUrl.searchParams.set("mfa", "1");
      return NextResponse.redirect(mfaUrl);
    }
  }

  if (isMemberRoute) {
    if (!user?.id || !canAccessMemberPortal(user.role)) {
      const loginUrl = new URL("/login", request.nextUrl.origin);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    // Member portal pages require a linked member profile. Staff without one
    // belong in admin — never bounce them through /login (redirect loop).
    if (!user.memberId) {
      if (canAccessAdminPortal(user.role)) {
        return NextResponse.redirect(
          new URL("/admin/dashboard", request.nextUrl.origin),
        );
      }
      const loginUrl = new URL("/login", request.nextUrl.origin);
      loginUrl.searchParams.set("error", "AccessDenied");
      return NextResponse.redirect(loginUrl);
    }
  }

  if (isLogin && user?.id) {
    // Do not bounce AccessDenied / inactive-member errors back into the portal.
    const loginError = request.nextUrl.searchParams.get("error");
    if (loginError === "AccessDenied" || loginError === "SessionInactive") {
      return NextResponse.next();
    }
    if (canAccessAdminPortal(user.role)) {
      return NextResponse.redirect(
        new URL("/admin/dashboard", request.nextUrl.origin),
      );
    }
    if (canAccessMemberPortal(user.role) && user.memberId) {
      return NextResponse.redirect(
        new URL("/member/dashboard", request.nextUrl.origin),
      );
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/member/:path*",
    "/admin/:path*",
    "/api/admin/:path*",
    "/api/dev/:path*",
    "/login",
    "/design-system/:path*",
  ],
};
