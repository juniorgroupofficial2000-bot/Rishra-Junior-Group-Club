import NextAuth from "next-auth";
import { edgeAuthConfig } from "@/server/auth/auth.config";
import { canAccessAdminPortal } from "@/server/domain/permissions";
import { canAccessMemberPortal } from "@/server/domain/roles";
import { NextResponse } from "next/server";

const { auth } = NextAuth(edgeAuthConfig);

/**
 * Next.js 16 Proxy — edge gate for member/admin routes.
 * Layouts and server actions still enforce permissions server-side.
 */
export default auth((request) => {
  const { pathname } = request.nextUrl;
  const isMemberRoute = pathname.startsWith("/member");
  const isAdminRoute = pathname.startsWith("/admin");
  const isLogin = pathname === "/login";
  const user = request.auth?.user;

  if (isAdminRoute) {
    if (!user?.id || !canAccessAdminPortal(user.role)) {
      const loginUrl = new URL("/login", request.nextUrl.origin);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  if (isMemberRoute) {
    if (!user?.id || !canAccessMemberPortal(user.role)) {
      const loginUrl = new URL("/login", request.nextUrl.origin);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  if (isLogin && user?.id) {
    if (canAccessAdminPortal(user.role)) {
      return NextResponse.redirect(
        new URL("/admin/dashboard", request.nextUrl.origin),
      );
    }
    if (canAccessMemberPortal(user.role)) {
      return NextResponse.redirect(
        new URL("/member/dashboard", request.nextUrl.origin),
      );
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/member/:path*", "/admin/:path*", "/login"],
};
