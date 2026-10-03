"use client";

import { ConfirmFormDialog } from "@/components/admin/confirm-form-dialog";
import { adminCancelMandateAction } from "@/app/(admin)/actions/payments";
import { useRouter } from "next/navigation";

export function MandateCancelButton({
  memberId,
  memberName,
}: {
  memberId: string;
  memberName: string;
}) {
  const router = useRouter();

  return (
    <ConfirmFormDialog
      title="Cancel mandate"
      description={`Cancel the open e-mandate for ${memberName}? The provider will be contacted; local status updates from verified webhooks.`}
      confirmLabel="Cancel mandate"
      triggerLabel="Cancel"
      action={async () => {
        const result = await adminCancelMandateAction({ memberId });
        if (!result.ok) {
          router.push(
            `/admin/mandates?error=${encodeURIComponent(result.error)}`,
          );
          return;
        }
        router.refresh();
      }}
    />
  );
}
