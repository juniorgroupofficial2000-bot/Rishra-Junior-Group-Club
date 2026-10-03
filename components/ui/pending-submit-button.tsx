"use client";

import { Button, type ButtonProps } from "@/components/ui/button";
import { useFormStatus } from "react-dom";

/**
 * Submit button that disables itself and shows pending copy while the
 * parent form's server action is in flight (prevents double submission).
 */
export function PendingSubmitButton({
  children,
  pendingLabel = "Saving…",
  ...props
}: ButtonProps & {
  pendingLabel?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending || props.disabled} {...props}>
      {pending ? pendingLabel : children}
    </Button>
  );
}
