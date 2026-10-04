"use client";

import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { useState } from "react";

export function InteractiveDemos() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  return (
    <div className="flex flex-wrap gap-3">
      <Button onClick={() => setOpen(true)}>Open modal</Button>
      <Button
        variant="secondary"
        onClick={() =>
          toast({
            variant: "success",
            title: "Saved",
            description: "Placeholder confirmation — no real data written.",
          })
        }
      >
        Show toast
      </Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Confirm action"
        description="Example dialog for admin or member flows."
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="accent"
              onClick={() => {
                setOpen(false);
                toast({
                  variant: "info",
                  title: "Action acknowledged",
                });
              }}
            >
              Continue
            </Button>
          </>
        }
      >
        <p className="text-sm leading-relaxed text-ink-600">
          Modals use a restrained overlay, clear title hierarchy, and Escape /
          backdrop dismiss. Content should stay short and actionable.
        </p>
      </Modal>
    </div>
  );
}
