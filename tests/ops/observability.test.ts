import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { AuthorizationError } from "@/server/auth/authorize";
import { classifyApiError } from "@/server/observability/errors";
import {
  emailFingerprint,
  redactLogMetadata,
  sanitizeAuditMetadata,
} from "@/server/observability/redact";

describe("observability redaction", () => {
  it("redacts secrets from audit and log metadata", () => {
    const payload = {
      password: "secret",
      token: "tok_abc",
      cvv: "123",
      upiPin: "9999",
      apiKey: "rzp_test",
      paymentId: "pay_1",
      email: "member@rjgc.local",
      phone: "+910000000000",
    };

    const audit = sanitizeAuditMetadata(payload) as Record<string, unknown>;
    expect(audit.password).toBe("[redacted]");
    expect(audit.token).toBe("[redacted]");
    expect(audit.cvv).toBe("[redacted]");
    expect(audit.upiPin).toBe("[redacted]");
    expect(audit.apiKey).toBe("[redacted]");
    expect(audit.paymentId).toBe("pay_1");
    expect(audit.email).toBe("member@rjgc.local");

    const log = redactLogMetadata(payload)!;
    expect(log.password).toBe("[redacted]");
    expect(log.email).toBe("[redacted]");
    expect(log.phone).toBe("[redacted]");
    expect(log.paymentId).toBe("pay_1");
  });

  it("fingerprints emails without storing the full address", () => {
    expect(emailFingerprint("member@rjgc.local")).toBe("me***@rjgc.local");
  });
});

describe("classifyApiError", () => {
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("maps authorization failures without leaking internals", () => {
    const result = classifyApiError(
      new AuthorizationError("Admin access denied."),
      { route: "/api/admin/media/upload", method: "POST" },
    );
    expect(result.status).toBe(403);
    expect(result.body.code).toBe("FORBIDDEN");
    expect(JSON.stringify(result.body)).not.toMatch(/password|token|cvv/i);
  });

  it("maps unknown errors to a safe 500", () => {
    const result = classifyApiError(new Error("secret stack with password=x"), {
      route: "/api/test",
    });
    expect(result.status).toBe(500);
    expect(result.body.error).toBe("Internal server error.");
    expect(errorSpy).toHaveBeenCalled();
    const logged = String(errorSpy.mock.calls[0]?.[0] ?? "");
    expect(logged).toContain("api_error");
    expect(logged).not.toContain("password=x");
  });
});
