"use server";

import {
  AuthorizationError,
  assertPermission,
} from "@/server/auth/authorize";
import { requireAdminSession } from "@/server/auth/session";
import { Permissions } from "@/server/domain/permissions";
import {
  changeAdminPermission,
  createAdminUser,
} from "@/server/services/admin-user-service";
import { logServerActionError } from "@/server/observability/errors";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

async function requireUsersWrite() {
  const session = await requireAdminSession("/admin/users");
  try {
    assertPermission(session.user.role, Permissions.USERS_WRITE);
  } catch (error) {
    if (error instanceof AuthorizationError) {
      throw new Error("Forbidden");
    }
    throw error;
  }
  return session;
}

export async function adminCreateUserAction(formData: FormData) {
  const session = await requireUsersWrite();
  try {
    await createAdminUser(
      {
        email: String(formData.get("email") ?? ""),
        name: String(formData.get("name") ?? ""),
        role: String(formData.get("role") ?? ""),
        temporaryPassword: String(formData.get("temporaryPassword") ?? ""),
      },
      session.user.id,
    );
  } catch (error) {
    logServerActionError("adminCreateUserAction", error, {
      actorUserId: session.user.id,
    });
    const message =
      error instanceof Error ? error.message : "Could not create user.";
    redirect(`/admin/users?error=${encodeURIComponent(message)}`);
  }
  revalidatePath("/admin/users");
  redirect("/admin/users?created=1");
}

export async function adminChangeUserRoleAction(formData: FormData) {
  const session = await requireUsersWrite();
  const userId = String(formData.get("userId") ?? "");
  try {
    await changeAdminPermission(
      {
        userId,
        role: String(formData.get("role") ?? ""),
      },
      session.user.id,
    );
  } catch (error) {
    logServerActionError("adminChangeUserRoleAction", error, {
      actorUserId: session.user.id,
      userId,
    });
    const message =
      error instanceof Error ? error.message : "Could not update role.";
    redirect(`/admin/users?error=${encodeURIComponent(message)}`);
  }
  revalidatePath("/admin/users");
  redirect("/admin/users?updated=1");
}
