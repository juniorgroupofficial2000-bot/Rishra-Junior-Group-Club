"use server";

import { requireMemberId } from "@/server/auth/member-context";
import { prisma } from "@/server/db/prisma";
import { logServerActionError } from "@/server/observability/errors";
import { revalidatePath } from "next/cache";

export async function markNotificationReadAction(formData: FormData) {
  const { session } = await requireMemberId();
  const notificationId = String(formData.get("notificationId") ?? "");
  if (!notificationId) return;

  try {
    await prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId: session.user.id,
        deletedAt: null,
        readAt: null,
      },
      data: { readAt: new Date() },
    });
  } catch (error) {
    logServerActionError("markNotificationReadAction", error, {
      userId: session.user.id,
      notificationId,
    });
    return;
  }

  revalidatePath("/member/notifications");
  revalidatePath("/member/dashboard");
}

export async function markAllNotificationsReadAction() {
  const { session } = await requireMemberId();

  try {
    await prisma.notification.updateMany({
      where: {
        userId: session.user.id,
        deletedAt: null,
        readAt: null,
      },
      data: { readAt: new Date() },
    });
  } catch (error) {
    logServerActionError("markAllNotificationsReadAction", error, {
      userId: session.user.id,
    });
    return;
  }

  revalidatePath("/member/notifications");
  revalidatePath("/member/dashboard");
}
