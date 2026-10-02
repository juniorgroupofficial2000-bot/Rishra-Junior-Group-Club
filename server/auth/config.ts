import { edgeAuthConfig } from "@/server/auth/auth.config";
import { getUserRepository } from "@/server/repositories";
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { z } from "zod";

const SESSION_REVALIDATE_MS = 5 * 60 * 1000;

export const loginSchema = z.object({
  email: z.email("Enter a valid email address.").trim().toLowerCase(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(128, "Password is too long."),
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
      },
      authorize: async (credentials) => {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const users = getUserRepository();
        const user = await users.findByEmail(parsed.data.email);
        if (!user || !user.active) return null;

        const valid = await compare(parsed.data.password, user.passwordHash);
        if (!valid) return null;

        // Members may only sign in while the linked member record is ACTIVE.
        if (user.memberId && user.memberStatus && user.memberStatus !== "ACTIVE") {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          memberId: user.memberId,
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
        token.lastValidated = Date.now();
        return token;
      }

      if (
        dbUser.memberId &&
        dbUser.memberStatus &&
        dbUser.memberStatus !== "ACTIVE" &&
        dbUser.role === "MEMBER"
      ) {
        token.error = "SessionInactive";
        token.role = "PUBLIC";
        token.memberId = null;
        token.lastValidated = Date.now();
        return token;
      }

      token.role = dbUser.role;
      token.memberId = dbUser.memberId;
      token.lastValidated = Date.now();
      delete token.error;
      return token;
    },
  },
} satisfies NextAuthConfig;
