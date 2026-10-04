"use client";

import { markNotificationReadAction } from "@/app/(member)/actions/notifications";
import { PendingSubmitButton } from "@/components/ui/pending-submit-button";

export function MarkNotificationReadButton({
  notificationId,
}: {
  notificationId: string;
}) {
  return (
    <form action={markNotificationReadAction}>
      <input type="hidden" name="notificationId" value={notificationId} />
      <PendingSubmitButton
        size="sm"
        variant="ghost"
        pendingLabel="Updating…"
      >
        Mark as read
      </PendingSubmitButton>
    </form>
  );
}
