"use server";

import { requireMemberId } from "@/server/auth/member-context";
import {
  cancelMemberEventRegistration,
  EventRegistrationError,
  registerMemberForEvent,
} from "@/server/services/event-registration-service";
import { logServerActionError } from "@/server/observability/errors";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function registerForEventAction(formData: FormData) {
  const { memberId } = await requireMemberId();
  const eventId = String(formData.get("eventId") ?? "");
  try {
    await registerMemberForEvent({ memberId, eventId });
  } catch (error) {
    logServerActionError("registerForEventAction", error, {
      memberId,
      eventId,
    });
    const message =
      error instanceof EventRegistrationError
        ? error.message
        : "Could not register for this event.";
    redirect(`/member/events?error=${encodeURIComponent(message)}`);
  }
  revalidatePath("/member/events");
  revalidatePath("/member/dashboard");
  redirect("/member/events?registered=1");
}

export async function cancelEventRegistrationAction(formData: FormData) {
  const { memberId } = await requireMemberId();
  const eventId = String(formData.get("eventId") ?? "");
  try {
    await cancelMemberEventRegistration({ memberId, eventId });
  } catch (error) {
    logServerActionError("cancelEventRegistrationAction", error, {
      memberId,
      eventId,
    });
    const message =
      error instanceof EventRegistrationError
        ? error.message
        : "Could not cancel registration.";
    redirect(`/member/events?error=${encodeURIComponent(message)}`);
  }
  revalidatePath("/member/events");
  revalidatePath("/member/dashboard");
  redirect("/member/events?cancelled=1");
}
