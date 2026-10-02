"use server";

import { requireAdminSession } from "@/server/auth/session";
import { Permissions, hasPermission } from "@/server/domain/permissions";
import {
  MemberAdminServiceError,
  softDeleteMember,
  updateMember,
  updateMemberStatus,
} from "@/server/services/member-admin-service";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

async function requireMemberPermission(
  permission: (typeof Permissions)[keyof typeof Permissions],
) {
  const session = await requireAdminSession("/admin/members");
  if (!hasPermission(session.user.role, permission)) {
    throw new Error("Forbidden");
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

export async function adminUpdateMemberAction(formData: FormData) {
  const session = await requireMemberPermission(Permissions.MEMBERS_WRITE);
  const id = String(formData.get("memberId") ?? "");

  const payload = {
    firstName: String(formData.get("firstName") ?? ""),
    lastName: String(formData.get("lastName") ?? ""),
    displayName: String(formData.get("displayName") ?? ""),
    email: String(formData.get("email") ?? ""),
    phone: String(formData.get("phone") ?? "") || undefined,
    city: String(formData.get("city") ?? "") || undefined,
    state: String(formData.get("state") ?? "") || undefined,
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
