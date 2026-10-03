import { describe, expect, it, vi } from "vitest";
import {
  assertCanWriteMandates,
  assertCanWritePayments,
  assertCanWriteSecuritySettings,
  AuthorizationError,
} from "@/server/auth/authorize";

/**
 * Mirrors the permission gates used by admin payment/security server actions.
 * Full Next.js action invocation is not required to prove server-side denial.
 */
describe("admin mutation authorization contracts", () => {
  it("committee cannot perform unauthorized financial operations", () => {
    const role = "COMMITTEE_MEMBER" as const;
    expect(() => assertCanWritePayments(role)).toThrow(AuthorizationError);
    expect(() => assertCanWriteMandates(role)).toThrow(AuthorizationError);
  });

  it("content manager cannot modify payment data", () => {
    expect(() => assertCanWritePayments("CONTENT_MANAGER")).toThrow(
      AuthorizationError,
    );
    expect(() => assertCanWriteMandates("CONTENT_MANAGER")).toThrow(
      AuthorizationError,
    );
  });

  it("treasurer cannot modify security configuration", () => {
    expect(() => assertCanWriteSecuritySettings("TREASURER")).toThrow(
      AuthorizationError,
    );
  });

  it("SUPER_ADMIN passes financial and security write asserts", () => {
    expect(() => assertCanWritePayments("SUPER_ADMIN")).not.toThrow();
    expect(() => assertCanWriteMandates("SUPER_ADMIN")).not.toThrow();
    expect(() => assertCanWriteSecuritySettings("SUPER_ADMIN")).not.toThrow();
  });

  it("permission denial happens before side effects", () => {
    const sideEffect = vi.fn();
    try {
      assertCanWritePayments("CONTENT_MANAGER");
      sideEffect();
    } catch {
      // expected
    }
    expect(sideEffect).not.toHaveBeenCalled();
  });
});
