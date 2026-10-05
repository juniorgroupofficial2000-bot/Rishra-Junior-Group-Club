"use client";

import { Field, type InputProps } from "@/components/ui/input";
import { cn } from "@/lib/cn";
import { Eye, EyeOff } from "lucide-react";
import { useId, useState } from "react";

const controlClass =
  "min-h-11 w-full rounded-md border border-border-default bg-surface-raised py-2.5 pl-3 pr-11 text-sm text-ink-900 placeholder:text-ink-400 shadow-xs transition-[border-color,box-shadow] duration-200 focus-visible:border-border-focus focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:bg-surface-sunken disabled:opacity-60 aria-[invalid=true]:border-alta-500";

export type PasswordInputProps = Omit<InputProps, "type">;

/** Text field with show / hide password control. */
export function PasswordInput({
  className,
  label,
  hint,
  error,
  id,
  ...props
}: PasswordInputProps) {
  const reactId = useId();
  const inputId = id ?? props.name ?? `password-${reactId}`;
  const [visible, setVisible] = useState(false);

  return (
    <Field label={label} hint={hint} error={error} id={inputId}>
      <div className="relative">
        <input
          id={inputId}
          type={visible ? "text" : "password"}
          aria-invalid={error ? true : undefined}
          aria-describedby={
            error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
          }
          className={cn(controlClass, className)}
          {...props}
        />
        <button
          type="button"
          className="absolute inset-y-0 right-0 inline-flex w-11 items-center justify-center rounded-r-md text-ink-500 transition-colors hover:text-ink-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
          onClick={() => setVisible((value) => !value)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          tabIndex={0}
        >
          {visible ? (
            <EyeOff className="h-4 w-4" aria-hidden />
          ) : (
            <Eye className="h-4 w-4" aria-hidden />
          )}
        </button>
      </div>
    </Field>
  );
}
