import { describe, expect, it } from "vitest";
import { sanitizeAuditMetadata } from "@/server/audit/sanitize";

describe("sanitizeAuditMetadata", () => {
  it("redacts secrets and payment credentials", () => {
    const sanitized = sanitizeAuditMetadata({
      email: "member@rjgc.local",
      role: "ADMIN",
      password: "should-not-appear",
      passwordHash: "hash",
      cardNumber: "4111111111111111",
      cvv: "123",
      upiPin: "9999",
      apiKey: "rzp_test_xxx",
      nested: {
        bankPassword: "secret",
        providerMandateRef: "mandate_123",
      },
    }) as Record<string, unknown>;

    expect(sanitized.email).toBe("member@rjgc.local");
    expect(sanitized.password).toBe("[redacted]");
    expect(sanitized.passwordHash).toBe("[redacted]");
    expect(sanitized.cardNumber).toBe("[redacted]");
    expect(sanitized.cvv).toBe("[redacted]");
    expect(sanitized.upiPin).toBe("[redacted]");
    expect(sanitized.apiKey).toBe("[redacted]");
    expect((sanitized.nested as Record<string, unknown>).bankPassword).toBe(
      "[redacted]",
    );
    expect(
      (sanitized.nested as Record<string, unknown>).providerMandateRef,
    ).toBe("mandate_123");
  });
});
