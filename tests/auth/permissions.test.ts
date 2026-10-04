import { describe, expect, it } from "vitest";
import {
  Permissions,
  canAccessAdminPortal,
  hasPermission,
  permissionsForRole,
} from "@/server/domain/permissions";
import { canAccessMemberPortal } from "@/server/domain/roles";
import {
  ADMIN_API_PERMISSIONS,
  ADMIN_PAGE_PERMISSIONS,
  SESSION_MAX_AGE_SECONDS,
  SESSION_REVALIDATE_MS,
} from "@/server/auth/route-permissions";

describe("RBAC permission matrix", () => {
  it("denies admin portal to normal members", () => {
    expect(canAccessAdminPortal("MEMBER")).toBe(false);
    expect(canAccessAdminPortal("PUBLIC")).toBe(false);
    expect(hasPermission("MEMBER", Permissions.ADMIN_ACCESS)).toBe(false);
    expect(canAccessMemberPortal("MEMBER")).toBe(true);
  });

  it("allows committee members to read but not write financial data", () => {
    expect(canAccessAdminPortal("COMMITTEE_MEMBER")).toBe(true);
    expect(hasPermission("COMMITTEE_MEMBER", Permissions.PAYMENTS_READ)).toBe(
      true,
    );
    expect(hasPermission("COMMITTEE_MEMBER", Permissions.PAYMENTS_WRITE)).toBe(
      false,
    );
    expect(hasPermission("COMMITTEE_MEMBER", Permissions.MANDATES_WRITE)).toBe(
      false,
    );
  });

  it("prevents content managers from modifying payment data", () => {
    expect(canAccessAdminPortal("CONTENT_MANAGER")).toBe(true);
    expect(hasPermission("CONTENT_MANAGER", Permissions.GALLERY_WRITE)).toBe(
      true,
    );
    expect(hasPermission("CONTENT_MANAGER", Permissions.CONTENT_READ)).toBe(
      true,
    );
    expect(hasPermission("CONTENT_MANAGER", Permissions.CONTENT_WRITE)).toBe(
      true,
    );
    expect(hasPermission("CONTENT_MANAGER", Permissions.MEDIA_WRITE)).toBe(
      true,
    );
    expect(hasPermission("CONTENT_MANAGER", Permissions.PAYMENTS_READ)).toBe(
      false,
    );
    expect(hasPermission("CONTENT_MANAGER", Permissions.PAYMENTS_WRITE)).toBe(
      false,
    );
    expect(hasPermission("CONTENT_MANAGER", Permissions.MANDATES_WRITE)).toBe(
      false,
    );
  });

  it("prevents treasurers from modifying security configuration", () => {
    expect(hasPermission("TREASURER", Permissions.PAYMENTS_WRITE)).toBe(true);
    expect(hasPermission("TREASURER", Permissions.MANDATES_WRITE)).toBe(true);
    expect(hasPermission("TREASURER", Permissions.SETTINGS_READ)).toBe(false);
    expect(hasPermission("TREASURER", Permissions.SETTINGS_WRITE)).toBe(false);
    expect(hasPermission("TREASURER", Permissions.USERS_WRITE)).toBe(false);
  });

  it("grants SUPER_ADMIN full administrative capabilities", () => {
    const all = Object.values(Permissions);
    const granted = permissionsForRole("SUPER_ADMIN");
    expect(granted).toHaveLength(all.length);
    for (const permission of all) {
      expect(hasPermission("SUPER_ADMIN", permission)).toBe(true);
    }
    expect(hasPermission("ADMIN", Permissions.SETTINGS_WRITE)).toBe(true);
  });

  it("documents every admin page and API permission", () => {
    expect(Object.keys(ADMIN_PAGE_PERMISSIONS).length).toBeGreaterThanOrEqual(
      16,
    );
    expect(ADMIN_API_PERMISSIONS["/api/admin/reports"]).toBe(
      Permissions.REPORTS_VIEW,
    );
    expect(SESSION_MAX_AGE_SECONDS).toBe(8 * 60 * 60);
    expect(SESSION_REVALIDATE_MS).toBe(60 * 1000);
  });
});
