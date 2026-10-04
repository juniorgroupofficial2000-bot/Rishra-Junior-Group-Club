"use client";

import { adminSoftDeleteMemberAction } from "@/app/(admin)/actions/members";
import { ConfirmFormDialog } from "@/components/admin/confirm-form-dialog";

export function MemberDeleteButton({ memberId }: { memberId: string }) {
  return (
    <ConfirmFormDialog
      title="Archive this member?"
      description="The membership will be archived. Financial history is retained. This action is audited."
      confirmLabel="Archive member"
      triggerLabel="Archive member"
      tone="danger"
      action={async () => {
        await adminSoftDeleteMemberAction(memberId);
      }}
    />
  );
}
