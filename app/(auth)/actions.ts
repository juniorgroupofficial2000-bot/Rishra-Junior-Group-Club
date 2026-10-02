"use server";

import { loginSchema } from "@/server/auth/config";
import { signIn, signOut } from "@/server/auth";
import { consumeRateLimit } from "@/server/security/rate-limit";
import { safeInternalPath } from "@/server/security/safe-path";
import { AuthError } from "next-auth";
import { headers } from "next/headers";

export type LoginActionState = {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: {
    email?: string[];
    password?: string[];
  };
};

export async function loginAction(
  _prev: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
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
    return {
      status: "error",
      message: "Too many sign-in attempts. Please try again later.",
    };
  }

  const safeCallback = safeInternalPath(
    String(formData.get("callbackUrl") || "/member/dashboard"),
  );

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: safeCallback,
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
