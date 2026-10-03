import "server-only";

import { canAccessAdminPortal } from "@/server/domain/permissions";
import type { AppRole } from "@/server/domain/roles";

/** Staff MFA is required when env flag is set (mandatory for PAYMENT_MODE=live). */
export function isStaffMfaRequiredByConfig(): boolean {
  // Thin read keeps this module usable from Edge auth paths without pulling server env.
  return process.env.REQUIRE_STAFF_MFA === "true";
}

export function roleRequiresStaffMfa(role: AppRole | undefined): boolean {
  return canAccessAdminPortal(role);
}

/**
 * Sign-in MFA gate.
 * - Members: no TOTP
 * - Staff with MFA enabled: TOTP required
 * - Staff without MFA: password login allowed so they can enroll in Settings
 *   (admin layout forces enrollment when REQUIRE_STAFF_MFA=true)
 */
export function staffMustUseMfa(input: {
  role: AppRole | undefined;
  mfaEnabled: boolean;
}): "ok" | "code_required" {
  if (!roleRequiresStaffMfa(input.role)) return "ok";
  if (input.mfaEnabled) return "code_required";
  return "ok";
}

export function staffNeedsMfaEnrollment(input: {
  role: AppRole | undefined;
  mfaEnabled: boolean;
}): boolean {
  return (
    isStaffMfaRequiredByConfig() &&
    roleRequiresStaffMfa(input.role) &&
    !input.mfaEnabled
  );
}
