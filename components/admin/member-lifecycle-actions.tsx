"use client";

import { adminMemberLifecycleAction } from "@/app/(admin)/actions/members";
import { ConfirmFormDialog } from "@/components/admin/confirm-form-dialog";
import { PendingSubmitButton } from "@/components/ui/pending-submit-button";
import type { MemberStatusInput } from "@/server/validation/member";
import { useState } from "react";

type ActionDef = {
  action: string;
  label: string;
  confirm?: boolean;
  requireReason?: boolean;
  tone?: "danger" | "default";
};

function actionsForStatus(status: MemberStatusInput): ActionDef[] {
  switch (status) {
    case "APPLICATION":
      return [
        { action: "start_review", label: "Start review" },
        {
          action: "reject",
          label: "Reject",
          confirm: true,
          requireReason: true,
          tone: "danger",
        },
      ];
    case "PENDING":
      return [
        { action: "approve", label: "Approve" },
        { action: "activate", label: "Approve & activate" },
        {
          action: "request_changes",
          label: "Request changes",
          confirm: true,
          requireReason: true,
        },
        {
          action: "reject",
          label: "Reject",
          confirm: true,
          requireReason: true,
          tone: "danger",
        },
      ];
    case "APPROVED":
      return [
        { action: "activate", label: "Activate" },
        {
          action: "reject",
          label: "Set inactive",
          confirm: true,
          requireReason: true,
          tone: "danger",
        },
      ];
    case "ACTIVE":
      return [
        {
          action: "suspend",
          label: "Suspend",
          confirm: true,
          requireReason: true,
          tone: "danger",
        },
        {
          action: "archive",
          label: "Archive",
          confirm: true,
          requireReason: true,
          tone: "danger",
        },
      ];
    case "SUSPENDED":
    case "INACTIVE":
      return [
        { action: "reactivate", label: "Reactivate" },
        {
          action: "archive",
          label: "Archive",
          confirm: true,
          requireReason: true,
          tone: "danger",
        },
      ];
    default:
      return [];
  }
}

export function MemberLifecycleActions({
  memberId,
  status,
  displayName,
}: {
  memberId: string;
  status: MemberStatusInput;
  displayName: string;
}) {
  const [reason, setReason] = useState("");
  const actions = actionsForStatus(status);

  if (actions.length === 0) {
    return (
      <p className="text-sm text-ink-500">
        No further lifecycle actions are available for archived members.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="lifecycle-reason" className="text-sm font-medium">
          Reason / notes
        </label>
        <textarea
          id="lifecycle-reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          className="w-full rounded-md border border-border-default bg-surface-raised px-3 py-2 text-sm"
          placeholder="Required for reject, suspend, request changes, and archive"
        />
      </div>
      <div className="flex flex-wrap gap-2">
        {actions.map((def) => {
          if (def.confirm) {
            return (
              <ConfirmFormDialog
                key={def.action}
                title={`${def.label} ${displayName}?`}
                description="This membership status change is audited and may affect portal access."
                triggerLabel={def.label}
                confirmLabel={def.label}
                tone={def.tone ?? "default"}
                action={async () => {
                  if (def.requireReason && reason.trim().length < 3) {
                    throw new Error("Please enter a reason (at least 3 characters).");
                  }
                  const formData = new FormData();
                  formData.set("memberId", memberId);
                  formData.set("action", def.action);
                  formData.set("reason", reason);
                  formData.set("reviewNotes", reason);
                  await adminMemberLifecycleAction(formData);
                }}
              />
            );
          }

          return (
            <form key={def.action} action={adminMemberLifecycleAction}>
              <input type="hidden" name="memberId" value={memberId} />
              <input type="hidden" name="action" value={def.action} />
              <input type="hidden" name="reason" value={reason} />
              <PendingSubmitButton
                size="sm"
                variant="outline"
                pendingLabel="Working…"
              >
                {def.label}
              </PendingSubmitButton>
            </form>
          );
        })}
      </div>
    </div>
  );
}
