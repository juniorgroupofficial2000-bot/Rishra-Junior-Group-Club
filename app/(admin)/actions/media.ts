"use server";

import {
  AuthorizationError,
  assertPermission,
} from "@/server/auth/authorize";
import { requireAdminSession } from "@/server/auth/session";
import { Permissions } from "@/server/domain/permissions";
import { prisma } from "@/server/db/prisma";
import { assertCanUploadPurpose } from "@/server/media/authorize-purpose";
import type { MediaPurposeValue } from "@/server/media/types";
import {
  MediaServiceError,
  softDeleteMediaAsset,
  updateMediaMetadata,
} from "@/server/services/media-service";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

async function requirePurposeWrite(assetId: string) {
  const session = await requireAdminSession("/admin/media");
  assertPermission(session.user.role, Permissions.ADMIN_ACCESS);

  const asset = await prisma.mediaAsset.findFirst({
    where: { id: assetId, deletedAt: null },
    select: { purpose: true },
  });
  if (!asset) {
    redirect("/admin/media?error=Media%20not%20found.");
  }

  try {
    assertCanUploadPurpose(
      session.user.role,
      asset.purpose as MediaPurposeValue,
    );
  } catch (error) {
    if (error instanceof AuthorizationError) {
      redirect("/admin/media?error=Forbidden");
    }
    throw error;
  }

  return session;
}

export async function adminDeleteMediaAction(id: string) {
  const session = await requirePurposeWrite(id);
  try {
    await softDeleteMediaAsset(id, session.user.id);
  } catch (error) {
    if (error instanceof MediaServiceError) {
      redirect(`/admin/media?error=${encodeURIComponent(error.message)}`);
    }
    throw error;
  }
  revalidatePath("/admin/media");
  redirect("/admin/media?updated=deleted");
}

export async function adminUpdateMediaMetaAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const session = await requirePurposeWrite(id);
  try {
    await updateMediaMetadata(
      id,
      {
        alt: String(formData.get("alt") ?? ""),
        caption: String(formData.get("caption") ?? "") || null,
        historicallyImportant: formData.get("historicallyImportant") === "on",
      },
      session.user.id,
    );
  } catch (error) {
    if (error instanceof MediaServiceError) {
      redirect(`/admin/media?error=${encodeURIComponent(error.message)}`);
    }
    throw error;
  }
  revalidatePath("/admin/media");
  redirect("/admin/media?updated=1");
}
