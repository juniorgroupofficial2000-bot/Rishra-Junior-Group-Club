import { SESSION_MAX_AGE_SECONDS } from "@/server/auth/route-permissions";
import { normalizeAppRole } from "@/server/domain/roles";
import { getAuthSecret } from "@/server/security/env";
import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe Auth.js config used by `proxy.ts`.
 * Do not import Node-only modules (bcrypt, repositories, Prisma) here.
 */
const useSecureCookies =
  process.env.APP_URL?.startsWith("https://") === true ||
  process.env.SITE_URL?.startsWith("https://") === true ||
  process.env.AUTH_URL?.startsWith("https://") === true ||
  process.env.NEXT_PUBLIC_APP_URL?.startsWith("https://") === true;

export const edgeAuthConfig = {
  trustHost: true,
  secret: getAuthSecret(),
  useSecureCookies,
  cookies: {
    sessionToken: {
      options: {
        httpOnly: true,
        sameSite: "lax" as const,
        path: "/",
        secure: useSecureCookies,
      },
    },
  },
  session: {
    strategy: "jwt",
    maxAge: SESSION_MAX_AGE_SECONDS,
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
      if (path.startsWith("/member") || path.startsWith("/admin")) {
        // Inactive sessions clear user.id in the session callback.
        return Boolean(auth?.user?.id);
      }
      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.memberId = user.memberId;
        token.mfaEnabled = Boolean(user.mfaEnabled);
        token.sub = user.id;
        token.lastValidated = Date.now();
        delete token.error;
      }
      return token;
    },
    session({ session, token }) {
      if (token.error === "SessionInactive") {
        // Force consumers to treat the session as unauthenticated.
        session.user.id = "";
        session.user.role = "PUBLIC";
        session.user.memberId = null;
        session.user.mfaEnabled = false;
        return session;
      }
      if (session.user) {
        session.user.id = typeof token.sub === "string" ? token.sub : "";
        session.user.role = normalizeAppRole(token.role);
        session.user.memberId =
          typeof token.memberId === "string" ? token.memberId : null;
        session.user.mfaEnabled = Boolean(token.mfaEnabled);
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
