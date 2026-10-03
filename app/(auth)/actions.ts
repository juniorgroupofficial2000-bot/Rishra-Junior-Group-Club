"use server";

import { loginSchema } from "@/server/auth/config";
import { staffMustUseMfa } from "@/server/auth/mfa/policy";
import { signIn, signOut } from "@/server/auth";
import { canAccessAdminPortal } from "@/server/domain/permissions";
import {
  canAccessMemberPortal,
  type AppRole,
} from "@/server/domain/roles";
import { logAuthFailure } from "@/server/observability/events";
import { getUserRepository } from "@/server/repositories";
import { consumeRateLimit } from "@/server/security/rate-limit";
import { safeInternalPath } from "@/server/security/safe-path";
import { compare } from "bcryptjs";
import { AuthError } from "next-auth";
import { headers } from "next/headers";

function postLoginPath(role: AppRole | undefined, rawCallback: string): string {
  const requested = safeInternalPath(rawCallback || undefined, "/");
  const adminHome = "/admin/dashboard";
  const memberHome = "/member/dashboard";

  if (canAccessAdminPortal(role)) {
    if (requested.startsWith("/admin")) return requested;
    // Staff default (and accidental member callbacks) go to admin home.
    return adminHome;
  }

  if (canAccessMemberPortal(role)) {
    if (requested.startsWith("/member")) return requested;
    return memberHome;
  }

  return "/";
}


export type LoginActionState = {
  status: "idle" | "error" | "mfa_required";
  message?: string;
  fieldErrors?: {
    email?: string[];
    password?: string[];
    totp?: string[];
  };
};

export async function loginAction(
  _prev: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    totp: formData.get("totp"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Please correct the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const headerStore = await headers();
  const ip =
    headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headerStore.get("x-real-ip") ||
    "unknown";
  const emailKey = parsed.data.email;
  const allowed =
    consumeRateLimit(`login:ip:${ip}`, 30, 15 * 60_000) &&
    consumeRateLimit(`login:email:${emailKey}`, 10, 15 * 60_000);

  if (!allowed) {
    logAuthFailure({
      reason: "rate_limited",
      email: parsed.data.email,
      ip,
    });
    return {
      status: "error",
      message: "Too many sign-in attempts. Please try again later.",
    };
  }

  const users = getUserRepository();
  const user = await users.findByEmail(parsed.data.email);
  if (user?.active) {
    const passwordOk = await compare(parsed.data.password, user.passwordHash);
    if (passwordOk) {
      const mfaState = staffMustUseMfa({
        role: user.role,
        mfaEnabled: user.mfaEnabled,
      });
      if (mfaState === "code_required" && !parsed.data.totp) {
        return {
          status: "mfa_required",
          message: "Enter the 6-digit code from your authenticator app.",
        };
      }
    }
  }

  const redirectTo = postLoginPath(
    user?.role,
    String(formData.get("callbackUrl") ?? ""),
  );

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      totp: parsed.data.totp ?? "",
      redirectTo,
    });
    return { status: "idle" };
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        status: "error",
        message: "Invalid email or password.",
      };
    }
    throw error;
  }
}

export async function logoutAction() {
  await signOut({ redirectTo: "/login" });
}
