"use client";

import { adminSoftDeleteMemberAction } from "@/app/(admin)/actions/members";
import { ConfirmFormDialog } from "@/components/admin/confirm-form-dialog";

export function MemberDeleteButton({ memberId }: { memberId: string }) {
  return (
    <ConfirmFormDialog
      title="Soft-delete this member?"
      description="The member record will be marked deleted and set inactive. This does not permanently erase audit history."
      confirmLabel="Soft-delete member"
      triggerLabel="Soft-delete member"
      tone="danger"
      action={async () => {
        await adminSoftDeleteMemberAction(memberId);
      }}
    />
  );
}
