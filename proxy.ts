import NextAuth from "next-auth";
import { edgeAuthConfig } from "@/server/auth/auth.config";
import { canAccessMemberPortal } from "@/server/domain/roles";
import { NextResponse } from "next/server";

const { auth } = NextAuth(edgeAuthConfig);

/**
 * Next.js 16 Proxy — edge gate for member routes.
 * Layouts still call requireMemberSession for server-side authorization.
 */
export default auth((request) => {
  const { pathname } = request.nextUrl;
  const isMemberRoute = pathname.startsWith("/member");
  const isLogin = pathname === "/login";
  const user = request.auth?.user;

  if (isMemberRoute) {
    if (!user?.id || !canAccessMemberPortal(user.role)) {
      const loginUrl = new URL("/login", request.nextUrl.origin);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  if (isLogin && user?.id && canAccessMemberPortal(user.role)) {
    return NextResponse.redirect(
      new URL("/member/dashboard", request.nextUrl.origin),
    );
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/member/:path*", "/login"],
};
