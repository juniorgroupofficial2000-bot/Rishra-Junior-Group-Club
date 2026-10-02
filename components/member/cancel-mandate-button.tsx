"use client";

import { cancelMandateAction } from "@/app/(member)/actions/mandate";
import { ConfirmFormDialog } from "@/components/admin/confirm-form-dialog";

export function CancelMandateButton() {
  return (
    <ConfirmFormDialog
      title="Cancel recurring mandate?"
      description="This requests cancellation with the payment provider. Card numbers, CVV, UPI PINs, and banking passwords are never stored."
      confirmLabel="Cancel mandate"
      triggerLabel="Cancel mandate"
      tone="danger"
      action={async () => {
        await cancelMandateAction();
      }}
    />
  );
}
