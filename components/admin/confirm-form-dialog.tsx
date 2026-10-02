"use client";

import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { useState, useTransition } from "react";

/**
 * Confirmation UI for destructive server actions.
 * Authorization still happens in the server action — this only confirms intent.
 */
export function ConfirmFormDialog({
  title,
  description,
  confirmLabel = "Confirm",
  triggerLabel,
  action,
  tone = "danger",
}: {
  title: string;
  description: string;
  confirmLabel?: string;
  triggerLabel: string;
  action: () => Promise<void>;
  tone?: "danger" | "default";
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <>
      <Button
        type="button"
        variant={tone === "danger" ? "secondary" : "outline"}
        onClick={() => setOpen(true)}
      >
        {triggerLabel}
      </Button>
      <Modal
        open={open}
        onClose={() => (pending ? undefined : setOpen(false))}
        title={title}
        description={description}
        footer={
          <>
            <Button
              type="button"
              variant="ghost"
              disabled={pending}
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant={tone === "danger" ? "primary" : "secondary"}
              disabled={pending}
              onClick={() => {
                startTransition(async () => {
                  try {
                    await action();
                    setOpen(false);
                  } catch (error) {
                    if (isRedirectError(error)) throw error;
                    setOpen(false);
                    throw error;
                  }
                });
              }}
            >
              {pending ? "Working…" : confirmLabel}
            </Button>
          </>
        }
      >
        <p className="text-sm text-ink-600">
          This action is recorded in the audit log when completed.
        </p>
      </Modal>
    </>
  );
}
