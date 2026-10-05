"use client";

import { loginAction, type LoginActionState } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { useActionState, useState } from "react";

const initialState: LoginActionState = { status: "idle" };

export function LoginForm({
  callbackUrl,
  errorCode,
  showDemoHint = false,
}: {
  callbackUrl: string;
  errorCode?: string;
  showDemoHint?: boolean;
}) {
  const [state, formAction, pending] = useActionState(loginAction, initialState);
  const [showTotp, setShowTotp] = useState(false);

  if (state.status === "mfa_required" && !showTotp) {
    setShowTotp(true);
  }

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <input type="hidden" name="callbackUrl" value={callbackUrl} />

      {(state.status === "error" && state.message) ||
      (state.status === "mfa_required" && state.message) ||
      errorCode ? (
        <div
          role="alert"
          className="rounded-md border border-alta-100 bg-alta-50 px-4 py-3 text-sm text-alta-700"
        >
          {state.message ??
            (errorCode === "AccessDenied"
              ? "You do not have access to the member portal."
              : "Sign-in could not be completed.")}
        </div>
      ) : null}

      <Input
        id="email"
        name="email"
        type="email"
        autoComplete="email"
        label="Email"
        required
        error={state.fieldErrors?.email?.[0]}
        placeholder="you@example.com"
      />
      <PasswordInput
        id="password"
        name="password"
        autoComplete="current-password"
        label="Password"
        required
        error={state.fieldErrors?.password?.[0]}
      />

      {showTotp ? (
        <Input
          id="totp"
          name="totp"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          label="Authenticator code"
          required
          error={state.fieldErrors?.totp?.[0]}
          placeholder="6-digit code"
        />
      ) : null}

      <Button type="submit" className="w-full" disabled={pending}>
        {pending
          ? "Signing in…"
          : showTotp
            ? "Verify and sign in"
            : "Sign in"}
      </Button>

      {showDemoHint ? (
        <aside className="rounded-md border border-dashed border-border-strong bg-surface-muted px-4 py-3 text-xs leading-relaxed text-ink-500">
          <p className="font-medium text-ink-700">
            SAMPLE credentials (fictional seed data)
          </p>
          <p className="mt-2 font-medium text-ink-600">Member</p>
          <p className="font-mono">member@rjgc.local</p>
          <p className="font-mono">MemberDemo1!</p>
          <p className="mt-2 font-medium text-ink-600">Admin (SUPER_ADMIN)</p>
          <p className="font-mono">admin@rjgc.local</p>
          <p className="font-mono">AdminDemo1!</p>
          <p className="mt-2">
            These accounts are fictional development records — never real member
            personal information.
          </p>
        </aside>
      ) : null}
    </form>
  );
}
