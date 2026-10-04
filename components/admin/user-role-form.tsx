"use client";

import { adminChangeUserRoleAction } from "@/app/(admin)/actions/users";
import { ConfirmFormDialog } from "@/components/admin/confirm-form-dialog";
import { PendingSubmitButton } from "@/components/ui/pending-submit-button";
import { useState } from "react";

const staffRoles = [
  "SUPER_ADMIN",
  "PRESIDENT",
  "SECRETARY",
  "TREASURER",
  "VICE_PRESIDENT",
  "COMMITTEE_MEMBER",
  "CONTENT_MANAGER",
  "EVENT_MANAGER",
] as const;

const privileged = new Set(["SUPER_ADMIN", "PRESIDENT", "SECRETARY", "TREASURER"]);

export function UserRoleForm({
  userId,
  currentRole,
  userName,
}: {
  userId: string;
  currentRole: string;
  userName: string;
}) {
  const [role, setRole] = useState(currentRole);
  const needsConfirm =
    role !== currentRole &&
    (privileged.has(role) || privileged.has(currentRole));

  async function submitRoleChange() {
    const formData = new FormData();
    formData.set("userId", userId);
    formData.set("role", role);
    await adminChangeUserRoleAction(formData);
  }

  return (
    <form action={adminChangeUserRoleAction} className="flex flex-wrap items-end gap-2">
      <input type="hidden" name="userId" value={userId} />
      <div className="flex min-w-[10rem] flex-col gap-1">
        <label htmlFor={`role-${userId}`} className="sr-only">
          Role for {userName}
        </label>
        <select
          id={`role-${userId}`}
          name="role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="h-10 rounded-md border border-border-default bg-surface-raised px-2 text-xs"
        >
          {staffRoles.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
          {currentRole === "MEMBER" ? (
            <option value="MEMBER">MEMBER</option>
          ) : null}
        </select>
      </div>
      {needsConfirm ? (
        <ConfirmFormDialog
          title={`Change role for ${userName}?`}
          description={`This updates staff privileges from ${currentRole} to ${role}. The change is audited.`}
          triggerLabel="Update role"
          confirmLabel="Change role"
          tone="default"
          triggerVariant="outline"
          action={submitRoleChange}
        />
      ) : (
        <PendingSubmitButton
          size="sm"
          variant="outline"
          pendingLabel="Updating…"
          disabled={role === currentRole}
        >
          Update role
        </PendingSubmitButton>
      )}
    </form>
  );
}
