"use server";

import {
  AuthorizationError,
  assertCanWriteSecuritySettings,
} from "@/server/auth/authorize";
import { requireAdminSession } from "@/server/auth/session";

export type SecuritySettingsActionResult =
  | { ok: true; message: string }
  | { ok: false; error: string; code: "FORBIDDEN" | "UNSUPPORTED" };

/**
 * Security configuration mutations are intentionally not available from the browser.
 * This action exists so authorization is enforced server-side if ever invoked —
 * treasurers and other non-SUPER_ADMIN roles receive FORBIDDEN.
 */
export async function adminAttemptSecuritySettingsMutationAction(input: {
  key: string;
  value: string;
}): Promise<SecuritySettingsActionResult> {
  void input;
  const session = await requireAdminSession("/admin/settings");
  try {
    assertCanWriteSecuritySettings(session.user.role);
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return { ok: false, error: error.message, code: "FORBIDDEN" };
    }
    throw error;
  }

  // Even SUPER_ADMIN cannot mutate secrets via the web UI — env only.
  return {
    ok: false,
    error:
      "Security settings (AUTH_SECRET, SITE_URL, payment credentials) must be set via environment variables, not the admin UI.",
    code: "UNSUPPORTED",
  };
}
