import { describe, expect, it } from "vitest";
import { AuthorizationError } from "@/server/auth/authorize";
import { Permissions } from "@/server/domain/permissions";
import {
  assertCanUploadPurpose,
  writePermissionForPurpose,
} from "@/server/media/authorize-purpose";

describe("media purpose authorization", () => {
  it("maps purposes to specific write permissions", () => {
    expect(writePermissionForPurpose("GALLERY")).toBe(Permissions.GALLERY_WRITE);
    expect(writePermissionForPurpose("EVENT")).toBe(Permissions.EVENTS_WRITE);
    expect(writePermissionForPurpose("PUJA")).toBe(Permissions.PUJA_WRITE);
    expect(writePermissionForPurpose("HERO")).toBe(Permissions.CONTENT_WRITE);
    expect(writePermissionForPurpose("MEMBER_PORTRAIT")).toBe(
      Permissions.MEMBERS_WRITE,
    );
    expect(writePermissionForPurpose("GENERAL")).toBe(Permissions.MEDIA_WRITE);
  });

  it("does not allow MEDIA_WRITE alone to upload mismatched purposes", () => {
    // EVENT_MANAGER has MEDIA_WRITE + EVENTS_WRITE, not PUJA/GALLERY/CONTENT.
    expect(() => assertCanUploadPurpose("EVENT_MANAGER", "EVENT")).not.toThrow();
    expect(() => assertCanUploadPurpose("EVENT_MANAGER", "PUJA")).toThrow(
      AuthorizationError,
    );
    expect(() => assertCanUploadPurpose("EVENT_MANAGER", "GALLERY")).toThrow(
      AuthorizationError,
    );
    expect(() => assertCanUploadPurpose("EVENT_MANAGER", "HERO")).toThrow(
      AuthorizationError,
    );
    expect(() => assertCanUploadPurpose("CONTENT_MANAGER", "HERO")).not.toThrow();
  });

  it("denies members entirely", () => {
    expect(() => assertCanUploadPurpose("MEMBER", "GENERAL")).toThrow(
      AuthorizationError,
    );
  });
});
