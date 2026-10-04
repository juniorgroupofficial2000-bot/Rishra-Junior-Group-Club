"use client";

import { adminRequestRefundAction } from "@/app/(admin)/actions/payments";
import { ConfirmFormDialog } from "@/components/admin/confirm-form-dialog";
import { useToast } from "@/components/ui/toast";
import { useRouter } from "next/navigation";

export function PaymentRefundButton({
  paymentId,
  memberName,
  amountLabel,
}: {
  paymentId: string;
  memberName: string;
  amountLabel: string;
}) {
  const { toast } = useToast();
  const router = useRouter();

  return (
    <ConfirmFormDialog
      title="Request refund?"
      description={`Request a provider refund of ${amountLabel} for ${memberName}. The ledger becomes refunded only after a verified webhook.`}
      triggerLabel="Refund"
      confirmLabel="Request refund"
      tone="danger"
      triggerVariant="outline"
      action={async () => {
        const result = await adminRequestRefundAction({ paymentId });
        if (!result.ok) {
          toast({
            title: "Unable to request refund",
            description: result.error,
            variant: "danger",
          });
          throw new Error(result.error);
        }
        toast({
          title: "Refund requested",
          description: "Waiting for provider webhook confirmation.",
          variant: "success",
        });
        router.refresh();
      }}
    />
  );
}
