"use server";

import {
  AuthorizationError,
  assertPermission,
} from "@/server/auth/authorize";
import { requireAdminSession } from "@/server/auth/session";
import { Permissions, type Permission } from "@/server/domain/permissions";
import {
  MemberAdminServiceError,
  softDeleteMember,
  updateMember,
  updateMemberStatus,
} from "@/server/services/member-admin-service";
import { applyMemberLifecycleAction } from "@/server/services/member-lifecycle-service";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

async function requireMemberPermission(permission: Permission) {
  const session = await requireAdminSession("/admin/members");
  try {
    assertPermission(session.user.role, permission);
  } catch (error) {
    if (error instanceof AuthorizationError) {
      throw new Error("Forbidden");
    }
    throw error;
  }
  return session;
}

export async function adminUpdateMemberStatusAction(formData: FormData) {
  const session = await requireMemberPermission(Permissions.MEMBERS_STATUS);
  const id = String(formData.get("memberId") ?? "");
  const status = String(formData.get("status") ?? "");
  const reason = String(formData.get("reason") ?? "") || undefined;

  try {
    await updateMemberStatus(id, { status, reason }, session.user.id);
  } catch (error) {
    if (error instanceof MemberAdminServiceError) {
      redirect(`/admin/members/${id}?error=${encodeURIComponent(error.message)}`);
    }
    throw error;
  }

  revalidatePath("/admin/members");
  revalidatePath(`/admin/members/${id}`);
  redirect(`/admin/members/${id}?updated=status`);
}

export async function adminMemberLifecycleAction(formData: FormData) {
  const session = await requireMemberPermission(Permissions.MEMBERS_STATUS);
  const id = String(formData.get("memberId") ?? "");
  const action = String(formData.get("action") ?? "");
  const reason = String(formData.get("reason") ?? "") || undefined;
  const reviewNotes = String(formData.get("reviewNotes") ?? "") || undefined;

  try {
    await applyMemberLifecycleAction(
      id,
      { action, reason, reviewNotes },
      session.user.id,
    );
  } catch (error) {
    if (error instanceof MemberAdminServiceError) {
      redirect(`/admin/members/${id}?error=${encodeURIComponent(error.message)}`);
    }
    throw error;
  }

  revalidatePath("/admin/members");
  revalidatePath(`/admin/members/${id}`);
  redirect(`/admin/members/${id}?updated=${encodeURIComponent(action)}`);
}

export async function adminUpdateMemberAction(formData: FormData) {
  const session = await requireMemberPermission(Permissions.MEMBERS_WRITE);
  const id = String(formData.get("memberId") ?? "");

  const dobRaw = String(formData.get("dateOfBirth") ?? "").trim();
  const payload = {
    firstName: String(formData.get("firstName") ?? ""),
    lastName: String(formData.get("lastName") ?? ""),
    displayName: String(formData.get("displayName") ?? ""),
    email: String(formData.get("email") ?? ""),
    phone: String(formData.get("phone") ?? "") || undefined,
    dateOfBirth: dobRaw ? dobRaw : null,
    city: String(formData.get("city") ?? "") || undefined,
    state: String(formData.get("state") ?? "") || undefined,
    addressLine1: String(formData.get("addressLine1") ?? "") || undefined,
    addressLine2: String(formData.get("addressLine2") ?? "") || undefined,
    postalCode: String(formData.get("postalCode") ?? "") || undefined,
    emergencyContactName:
      String(formData.get("emergencyContactName") ?? "") || undefined,
    emergencyContactPhone:
      String(formData.get("emergencyContactPhone") ?? "") || undefined,
    internalNotes: String(formData.get("internalNotes") ?? "") || undefined,
  };

  try {
    await updateMember(id, payload, session.user.id);
  } catch (error) {
    if (error instanceof MemberAdminServiceError) {
      redirect(`/admin/members/${id}?error=${encodeURIComponent(error.message)}`);
    }
    throw error;
  }

  revalidatePath("/admin/members");
  revalidatePath(`/admin/members/${id}`);
  redirect(`/admin/members/${id}?updated=profile`);
}

export async function adminSoftDeleteMemberAction(memberId: string) {
  const session = await requireMemberPermission(Permissions.MEMBERS_DELETE);
  try {
    await softDeleteMember(memberId, session.user.id);
  } catch (error) {
    if (error instanceof MemberAdminServiceError) {
      redirect(
        `/admin/members/${memberId}?error=${encodeURIComponent(error.message)}`,
      );
    }
    throw error;
  }

  revalidatePath("/admin/members");
  redirect("/admin/members?deleted=1");
}
