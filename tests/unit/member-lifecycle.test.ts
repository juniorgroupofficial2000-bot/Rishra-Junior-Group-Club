import { describe, expect, it } from "vitest";
import { canTransitionMemberStatus } from "@/server/domain/member-lifecycle";
import { isMembershipNumberFormat } from "@/server/domain/membership-number";

describe("member lifecycle transitions", () => {
  it("allows the standard approval path", () => {
    expect(canTransitionMemberStatus("APPLICATION", "PENDING")).toBe(true);
    expect(canTransitionMemberStatus("PENDING", "APPROVED")).toBe(true);
    expect(canTransitionMemberStatus("APPROVED", "ACTIVE")).toBe(true);
    expect(canTransitionMemberStatus("ACTIVE", "SUSPENDED")).toBe(true);
    expect(canTransitionMemberStatus("SUSPENDED", "ACTIVE")).toBe(true);
  });

  it("blocks archived reverse transitions", () => {
    expect(canTransitionMemberStatus("ARCHIVED", "ACTIVE")).toBe(false);
  });

  it("recognizes RJGC membership ID format", () => {
    expect(isMembershipNumberFormat("RJGC-2026-0042")).toBe(true);
    expect(isMembershipNumberFormat("cuid_abc")).toBe(false);
  });
});
