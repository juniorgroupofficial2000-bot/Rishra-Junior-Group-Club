import { describe, expect, it } from "vitest";
import { safeInternalPath } from "@/server/security/safe-path";

describe("safeInternalPath", () => {
  it("allows portal-relative destinations", () => {
    expect(safeInternalPath("/member/payments")).toBe("/member/payments");
    expect(safeInternalPath("/admin/dashboard")).toBe("/admin/dashboard");
    expect(safeInternalPath("/")).toBe("/");
  });

  it("rejects open redirects and protocol-relative URLs", () => {
    expect(safeInternalPath("https://evil.example")).toBe("/member/dashboard");
    expect(safeInternalPath("//evil.example")).toBe("/member/dashboard");
    expect(safeInternalPath("/\\evil.example")).toBe("/member/dashboard");
    expect(safeInternalPath("member/dashboard")).toBe("/member/dashboard");
    expect(safeInternalPath("/login")).toBe("/member/dashboard");
  });
});
