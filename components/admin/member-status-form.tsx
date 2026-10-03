"use client";

import { adminUpdateMemberStatusAction } from "@/app/(admin)/actions/members";
import { ConfirmFormDialog } from "@/components/admin/confirm-form-dialog";
import { Input } from "@/components/ui/input";
import { PendingSubmitButton } from "@/components/ui/pending-submit-button";
import { useState } from "react";

const destructiveStatuses = new Set(["SUSPENDED", "INACTIVE"]);

export function MemberStatusForm({
  memberId,
  currentStatus,
  displayName,
}: {
  memberId: string;
  currentStatus: string;
  displayName: string;
}) {
  const [status, setStatus] = useState(currentStatus);
  const [reason, setReason] = useState("");
  const needsConfirm =
    status !== currentStatus && destructiveStatuses.has(status);

  async function submitStatusChange() {
    const formData = new FormData();
    formData.set("memberId", memberId);
    formData.set("status", status);
    formData.set("reason", reason);
    await adminUpdateMemberStatusAction(formData);
  }

  return (
    <form
      action={adminUpdateMemberStatusAction}
      className="grid gap-4 md:grid-cols-[12rem_1fr_auto]"
    >
      <input type="hidden" name="memberId" value={memberId} />
      <div className="flex flex-col gap-1.5">
        <label htmlFor="status" className="text-sm font-medium text-ink-800">
          Status
        </label>
        <select
          id="status"
          name="status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="h-11 rounded-md border border-border-default bg-surface-raised px-3 text-sm"
        >
          <option value="ACTIVE">ACTIVE</option>
          <option value="PENDING">PENDING</option>
          <option value="INACTIVE">INACTIVE</option>
          <option value="SUSPENDED">SUSPENDED</option>
        </select>
      </div>
      <Input
        id="reason"
        name="reason"
        label="Reason (optional)"
        placeholder="Recorded in audit metadata"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
      />
      <div className="flex items-end">
        {needsConfirm ? (
          <ConfirmFormDialog
            title={`${status === "SUSPENDED" ? "Suspend" : "Deactivate"} ${displayName}?`}
            description={
              status === "SUSPENDED"
                ? "Suspended members cannot sign in to the member portal. This action is audited."
                : "Inactive members are removed from active rolls. This action is audited."
            }
            triggerLabel="Update status"
            confirmLabel={`Set ${status}`}
            tone="danger"
            action={submitStatusChange}
          />
        ) : (
          <PendingSubmitButton pendingLabel="Updating…">
            Update status
          </PendingSubmitButton>
        )}
      </div>
    </form>
  );
}
