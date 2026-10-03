import "server-only";

import { assertPermission } from "@/server/auth/authorize";
import { Permissions, type Permission } from "@/server/domain/permissions";
import type { MediaPurposeValue } from "@/server/media/types";
import type { AppRole } from "@/server/domain/roles";

/** Map upload purpose → required write permission. */
export function writePermissionForPurpose(
  purpose: MediaPurposeValue,
): Permission {
  switch (purpose) {
    case "GALLERY":
      return Permissions.GALLERY_WRITE;
    case "EVENT":
      return Permissions.EVENTS_WRITE;
    case "PUJA":
      return Permissions.PUJA_WRITE;
    case "COMMITTEE_PORTRAIT":
      return Permissions.CONTENT_WRITE;
    case "MEMBER_PORTRAIT":
      return Permissions.MEMBERS_WRITE;
    case "HERO":
      return Permissions.CONTENT_WRITE;
    case "GENERAL":
    default:
      return Permissions.MEDIA_WRITE;
  }
}

export function readPermissionForPurpose(
  purpose: MediaPurposeValue,
): Permission {
  switch (purpose) {
    case "GALLERY":
      return Permissions.GALLERY_READ;
    case "EVENT":
      return Permissions.EVENTS_READ;
    case "PUJA":
      return Permissions.PUJA_READ;
    case "COMMITTEE_PORTRAIT":
    case "HERO":
      return Permissions.CONTENT_READ;
    case "MEMBER_PORTRAIT":
      return Permissions.MEMBERS_READ;
    case "GENERAL":
    default:
      return Permissions.MEDIA_READ;
  }
}

export function assertCanUploadPurpose(
  role: AppRole | undefined,
  purpose: MediaPurposeValue,
): void {
  // Purpose-specific write permission only — MEDIA_WRITE must not widen
  // access to gallery/event/puja/hero slots.
  assertPermission(role, writePermissionForPurpose(purpose));
}

export function assertCanReadPurpose(
  role: AppRole | undefined,
  purpose: MediaPurposeValue,
): void {
  assertPermission(role, readPermissionForPurpose(purpose));
}
