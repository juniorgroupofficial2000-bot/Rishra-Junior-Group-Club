"use client";

import {
  cancelEventRegistrationAction,
  registerForEventAction,
} from "@/app/(member)/actions/events";
import { ConfirmFormDialog } from "@/components/admin/confirm-form-dialog";
import { PendingSubmitButton } from "@/components/ui/pending-submit-button";

export function EventRegistrationControls({
  eventId,
  eventTitle,
  registered,
  registrationStatus,
  registrationRequired,
  seatsLeft,
}: {
  eventId: string;
  eventTitle: string;
  registered: boolean;
  registrationStatus?: "REGISTERED" | "WAITLISTED" | null;
  registrationRequired: boolean;
  seatsLeft: number | null;
}) {
  if (!registrationRequired) {
    return (
      <p className="text-xs font-medium uppercase tracking-wide text-ink-400">
        No registration required
      </p>
    );
  }

  if (registered) {
    return (
      <div className="flex flex-col items-stretch gap-2 sm:items-end">
        <p className="text-xs font-semibold uppercase tracking-wide text-alta-700">
          {registrationStatus === "WAITLISTED"
            ? "Waitlisted"
            : "Registered"}
        </p>
        <ConfirmFormDialog
          title="Cancel registration?"
          description={`Remove your registration for “${eventTitle}”? You can register again later if the event is still open.`}
          triggerLabel="Cancel registration"
          confirmLabel="Cancel registration"
          tone="danger"
          triggerVariant="outline"
          action={async () => {
            const formData = new FormData();
            formData.set("eventId", eventId);
            await cancelEventRegistrationAction(formData);
          }}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-stretch gap-2 sm:items-end">
      {seatsLeft != null ? (
        <p className="text-xs text-ink-500">
          {seatsLeft > 0
            ? `${seatsLeft} seat${seatsLeft === 1 ? "" : "s"} left`
            : "Full — join waitlist"}
        </p>
      ) : null}
      <form action={registerForEventAction}>
        <input type="hidden" name="eventId" value={eventId} />
        <PendingSubmitButton size="sm" pendingLabel="Registering…">
          {seatsLeft === 0 ? "Join waitlist" : "Register"}
        </PendingSubmitButton>
      </form>
    </div>
  );
}
