import { cn } from "@/lib/cn";
import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

type FieldShellProps = {
  label?: string;
  hint?: string;
  error?: string;
  id: string;
  children: ReactNode;
  className?: string;
};

export function Field({
  label,
  hint,
  error,
  id,
  children,
  className,
}: FieldShellProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label ? (
        <label htmlFor={id} className="text-sm font-medium text-ink-800">
          {label}
        </label>
      ) : null}
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-sm text-danger-600" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-sm text-ink-500">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

const controlClass =
  "w-full rounded-md border border-border-default bg-surface-raised px-3 py-2.5 text-sm text-ink-900 placeholder:text-ink-400 shadow-xs transition-[border-color,box-shadow] duration-200 focus-visible:border-border-focus focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:bg-surface-sunken disabled:opacity-60 aria-[invalid=true]:border-alta-500";

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
  error?: string;
};

export function Input({
  className,
  label,
  hint,
  error,
  id,
  ...props
}: InputProps) {
  const inputId = id ?? props.name ?? "input";

  return (
    <Field label={label} hint={hint} error={error} id={inputId}>
      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={
          error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
        }
        className={cn(controlClass, className)}
        {...props}
      />
    </Field>
  );
}

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  hint?: string;
  error?: string;
};

export function Textarea({
  className,
  label,
  hint,
  error,
  id,
  ...props
}: TextareaProps) {
  const inputId = id ?? props.name ?? "textarea";

  return (
    <Field label={label} hint={hint} error={error} id={inputId}>
      <textarea
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={
          error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
        }
        className={cn(controlClass, "min-h-28 resize-y", className)}
        {...props}
      />
    </Field>
  );
}

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  hint?: string;
  error?: string;
};

export function Select({
  className,
  label,
  hint,
  error,
  id,
  children,
  ...props
}: SelectProps) {
  const inputId = id ?? props.name ?? "select";

  return (
    <Field label={label} hint={hint} error={error} id={inputId}>
      <select
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={
          error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
        }
        className={cn(controlClass, "pr-8", className)}
        {...props}
      >
        {children}
      </select>
    </Field>
  );
}
