import { describe, expect, it } from "vitest";
import {
  AuthorizationError,
  assertAdminAccess,
  assertCanWriteMandates,
  assertCanWritePayments,
  assertCanWriteSecuritySettings,
  assertMemberOwnsResource,
  assertMemberPortalAccess,
  assertPermission,
  roleMayAccessAdmin,
  roleMayAccessMemberPortal,
} from "@/server/auth/authorize";
import { Permissions } from "@/server/domain/permissions";

describe("authorization asserts", () => {
  it("blocks Member A from Member B resources", () => {
    expect(() =>
      assertMemberOwnsResource("member-a", "member-b"),
    ).toThrowError(AuthorizationError);

    try {
      assertMemberOwnsResource("member-a", "member-b");
    } catch (error) {
      expect(error).toBeInstanceOf(AuthorizationError);
      expect((error as AuthorizationError).status).toBe(403);
      expect((error as AuthorizationError).message).toMatch(/another member/i);
    }

    expect(() => assertMemberOwnsResource("member-a", "member-a")).not.toThrow();
  });

  it("rejects unauthenticated member context", () => {
    expect(() => assertMemberOwnsResource(null, "member-a")).toThrowError(
      AuthorizationError,
    );
  });

  it("denies admin portal to members and allows staff", () => {
    expect(roleMayAccessAdmin("MEMBER")).toBe(false);
    expect(roleMayAccessMemberPortal("MEMBER")).toBe(true);
    expect(() => assertAdminAccess("MEMBER")).toThrowError(AuthorizationError);
    expect(() => assertAdminAccess("TREASURER")).not.toThrow();
    expect(() => assertMemberPortalAccess("PUBLIC")).toThrowError(
      AuthorizationError,
    );
  });

  it("denies unauthorized financial operations to committee", () => {
    expect(() => assertCanWritePayments("COMMITTEE_MEMBER")).toThrowError(
      AuthorizationError,
    );
    expect(() => assertCanWriteMandates("COMMITTEE_MEMBER")).toThrowError(
      AuthorizationError,
    );
    expect(() => assertCanWritePayments("TREASURER")).not.toThrow();
    expect(() => assertCanWriteMandates("SUPER_ADMIN")).not.toThrow();
  });

  it("denies payment writes to content managers", () => {
    expect(() => assertCanWritePayments("CONTENT_MANAGER")).toThrowError(
      AuthorizationError,
    );
    expect(() =>
      assertPermission("CONTENT_MANAGER", Permissions.PAYMENTS_WRITE),
    ).toThrowError(AuthorizationError);
  });

  it("denies security settings writes to treasurers", () => {
    expect(() => assertCanWriteSecuritySettings("TREASURER")).toThrowError(
      AuthorizationError,
    );
    expect(() => assertCanWriteSecuritySettings("PRESIDENT")).toThrowError(
      AuthorizationError,
    );
    expect(() => assertCanWriteSecuritySettings("SUPER_ADMIN")).not.toThrow();
  });
});
