"use client";

import { loginAction, type LoginActionState } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useActionState } from "react";

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

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <input type="hidden" name="callbackUrl" value={callbackUrl} />

      {(state.status === "error" && state.message) || errorCode ? (
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
      <Input
        id="password"
        name="password"
        type="password"
        autoComplete="current-password"
        label="Password"
        required
        error={state.fieldErrors?.password?.[0]}
      />

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </Button>

      {showDemoHint ? (
        <aside className="rounded-md border border-dashed border-border-strong bg-surface-muted px-4 py-3 text-xs leading-relaxed text-ink-500">
          <p className="font-medium text-ink-700">Demo credentials (mock repository)</p>
          <p className="mt-1 font-mono">member@rjgc.local</p>
          <p className="font-mono">MemberDemo1!</p>
          <p className="mt-2">
            Production will use the Prisma user repository — this demo store is
            not a live membership database.
          </p>
        </aside>
      ) : null}
    </form>
  );
}
