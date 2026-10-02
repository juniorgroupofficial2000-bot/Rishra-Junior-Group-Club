import type { AppRole } from "@/server/domain/roles";
import type { NextAuthConfig } from "next-auth";

function asAppRole(value: unknown): AppRole {
  switch (value) {
    case "PUBLIC":
    case "MEMBER":
    case "COMMITTEE":
    case "ADMIN":
    case "SUPER_ADMIN":
      return value;
    default:
      return "PUBLIC";
  }
}

/**
 * Edge-safe Auth.js config used by `proxy.ts`.
 * Do not import Node-only modules (bcrypt, repositories) here.
 */
export const edgeAuthConfig = {
  trustHost: true,
  secret:
    process.env.AUTH_SECRET ??
    "rjgc-dev-only-auth-secret-replace-before-production",
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 8,
    updateAge: 60 * 30,
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const path = request.nextUrl.pathname;
      if (path.startsWith("/member")) return !!auth?.user;
      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.memberId = user.memberId;
        token.sub = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = typeof token.sub === "string" ? token.sub : "";
        session.user.role = asAppRole(token.role);
        session.user.memberId =
          typeof token.memberId === "string" ? token.memberId : null;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
