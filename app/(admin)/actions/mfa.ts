"use server";

import {
  beginStaffMfaEnrollment,
  confirmStaffMfaEnrollment,
  StaffMfaError,
} from "@/server/services/staff-mfa-service";
import { requireAdminSession } from "@/server/auth/session";
import { revalidatePath } from "next/cache";

export type MfaActionState =
  | { status: "idle" }
  | { status: "pending"; secret: string; otpauthUrl: string }
  | { status: "enabled" }
  | { status: "error"; message: string };

export async function beginMfaEnrollmentAction(): Promise<MfaActionState> {
  const session = await requireAdminSession("/admin/settings");
  try {
    const result = await beginStaffMfaEnrollment({
      userId: session.user.id,
      role: session.user.role,
      email: session.user.email ?? session.user.id,
    });
    return {
      status: "pending",
      secret: result.secret,
      otpauthUrl: result.otpauthUrl,
    };
  } catch (error) {
    if (error instanceof StaffMfaError) {
      return { status: "error", message: error.message };
    }
    throw error;
  }
}

export async function confirmMfaEnrollmentAction(
  _prev: MfaActionState,
  formData: FormData,
): Promise<MfaActionState> {
  const session = await requireAdminSession("/admin/settings");
  const code = String(formData.get("code") ?? "");
  try {
    await confirmStaffMfaEnrollment({
      userId: session.user.id,
      role: session.user.role,
      code,
    });
    revalidatePath("/admin/settings");
    return { status: "enabled" };
  } catch (error) {
    if (error instanceof StaffMfaError) {
      return { status: "error", message: error.message };
    }
    throw error;
  }
}
