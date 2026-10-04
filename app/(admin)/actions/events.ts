"use server";

import {
  EventAttendanceError,
  recordEventAttendance,
} from "@/server/services/event-attendance-service";
import { requirePermission } from "@/server/auth/session";
import { Permissions } from "@/server/domain/permissions";
import { logServerActionError } from "@/server/observability/errors";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function recordAttendanceAction(formData: FormData) {
  const session = await requirePermission(
    Permissions.EVENTS_WRITE,
    "/admin/events",
  );
  const eventId = String(formData.get("eventId") ?? "");
  const memberId = String(formData.get("memberId") ?? "");
  const statusRaw = String(formData.get("status") ?? "");
  const status = statusRaw === "ABSENT" ? "ABSENT" : "PRESENT";

  try {
    await recordEventAttendance({
      eventId,
      memberId,
      status,
      actorUserId: session.user.id,
    });
  } catch (error) {
    logServerActionError("recordAttendanceAction", error, {
      eventId,
      memberId,
      status,
    });
    const message =
      error instanceof EventAttendanceError
        ? error.message
        : "Could not record attendance.";
    redirect(
      `/admin/events/${eventId}?error=${encodeURIComponent(message)}`,
    );
  }

  revalidatePath(`/admin/events/${eventId}`);
  revalidatePath(`/admin/members/${memberId}`);
  revalidatePath("/member/attendance");
  redirect(`/admin/events/${eventId}?updated=1`);
}
