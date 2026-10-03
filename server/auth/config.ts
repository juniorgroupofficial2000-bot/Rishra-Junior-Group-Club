import { edgeAuthConfig } from "@/server/auth/auth.config";
import { staffMustUseMfa } from "@/server/auth/mfa/policy";
import { decryptMfaSecret } from "@/server/auth/mfa/secrets";
import { verifyTotpCode } from "@/server/auth/mfa/totp";
import { SESSION_REVALIDATE_MS } from "@/server/auth/route-permissions";
import { logAuthFailure } from "@/server/observability/events";
import { getUserRepository } from "@/server/repositories";
import { consumeRateLimit } from "@/server/security/rate-limit";
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { emailSchema } from "@/server/validation/email";
import { compare } from "bcryptjs";
import { z } from "zod";

export const loginSchema = z.object({
  email: emailSchema,
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(128, "Password is too long."),
  totp: z.preprocess((value) => {
    // FormData.get() returns null when the field is absent — treat as omitted.
    if (value == null) return undefined;
    if (typeof value === "string" && value.trim() === "") return undefined;
    return value;
  }, z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Enter the 6-digit authenticator code.")
    .optional()),
});

/** Full Auth.js config for Node route handlers / server actions. */
export const authConfig = {
  ...edgeAuthConfig,
  providers: [
    Credentials({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        totp: { label: "Authenticator code", type: "text" },
      },
      authorize: async (credentials, request) => {
        const parsed = loginSchema.safeParse(credentials);
        const ip =
          request?.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
          request?.headers.get("x-real-ip") ||
          "unknown";

        if (!parsed.success) {
          logAuthFailure({ reason: "validation", ip });
          return null;
        }

        const allowed =
          consumeRateLimit(`authjs:ip:${ip}`, 30, 15 * 60_000) &&
          consumeRateLimit(
            `authjs:email:${parsed.data.email}`,
            10,
            15 * 60_000,
          );
        if (!allowed) {
          logAuthFailure({
            reason: "rate_limited",
            email: parsed.data.email,
            ip,
          });
          return null;
        }

        const users = getUserRepository();
        const user = await users.findByEmail(parsed.data.email);
        if (!user || !user.active) {
          logAuthFailure({
            reason: user ? "inactive_user" : "invalid_credentials",
            email: parsed.data.email,
            ip,
          });
          return null;
        }

        const valid = await compare(parsed.data.password, user.passwordHash);
        if (!valid) {
          logAuthFailure({
            reason: "invalid_credentials",
            email: parsed.data.email,
            ip,
          });
          return null;
        }

        if (user.role === "MEMBER" && !user.memberId) {
          logAuthFailure({
            reason: "inactive_member",
            email: parsed.data.email,
            ip,
          });
          return null;
        }

        if (user.memberId && user.memberStatus && user.memberStatus !== "ACTIVE") {
          logAuthFailure({
            reason: "inactive_member",
            email: parsed.data.email,
            ip,
          });
          return null;
        }

        const mfaState = staffMustUseMfa({
          role: user.role,
          mfaEnabled: user.mfaEnabled,
        });

        if (mfaState === "code_required") {
          const code = parsed.data.totp?.trim() ?? "";
          if (!code) {
            logAuthFailure({
              reason: "invalid_credentials",
              email: parsed.data.email,
              ip,
            });
            return null;
          }
          const secret = user.mfaTotpSecretEnc
            ? decryptMfaSecret(user.mfaTotpSecretEnc)
            : null;
          if (!secret || !verifyTotpCode(secret, code)) {
            logAuthFailure({
              reason: "invalid_credentials",
              email: parsed.data.email,
              ip,
            });
            return null;
          }
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          memberId: user.memberId,
          mfaEnabled: user.mfaEnabled,
        };
      },
    }),
  ],
  callbacks: {
    ...edgeAuthConfig.callbacks,
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.memberId = user.memberId;
        token.mfaEnabled = Boolean(user.mfaEnabled);
        token.sub = user.id;
        token.lastValidated = Date.now();
        delete token.error;
        return token;
      }

      const subject = typeof token.sub === "string" ? token.sub : null;
      if (!subject) {
        token.error = "SessionInactive";
        return token;
      }

      const lastValidated =
        typeof token.lastValidated === "number" ? token.lastValidated : 0;
      if (Date.now() - lastValidated < SESSION_REVALIDATE_MS) {
        return token;
      }

      const dbUser = await getUserRepository().findById(subject);
      if (!dbUser || !dbUser.active) {
        token.error = "SessionInactive";
        token.role = "PUBLIC";
        token.memberId = null;
        token.mfaEnabled = false;
        token.lastValidated = Date.now();
        return token;
      }

      if (
        dbUser.role === "MEMBER" &&
        (!dbUser.memberId ||
          (dbUser.memberStatus && dbUser.memberStatus !== "ACTIVE"))
      ) {
        token.error = "SessionInactive";
        token.role = "PUBLIC";
        token.memberId = null;
        token.mfaEnabled = false;
        token.lastValidated = Date.now();
        return token;
      }

      token.role = dbUser.role;
      token.memberId = dbUser.memberId;
      token.mfaEnabled = dbUser.mfaEnabled;
      token.lastValidated = Date.now();
      delete token.error;
      return token;
    },
  },
} satisfies NextAuthConfig;
