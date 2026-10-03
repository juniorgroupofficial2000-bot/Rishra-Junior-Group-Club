"use client";

import {
  beginMfaEnrollmentAction,
  confirmMfaEnrollmentAction,
  type MfaActionState,
} from "@/app/(admin)/actions/mfa";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useActionState, useState, useTransition } from "react";

const initialConfirm: MfaActionState = { status: "idle" };

export function StaffMfaSetup({
  enabled,
  forced,
}: {
  enabled: boolean;
  forced?: boolean;
}) {
  const [pendingSetup, setPendingSetup] = useState<{
    secret: string;
    otpauthUrl: string;
  } | null>(null);
  const [beginError, setBeginError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [confirmState, confirmAction, confirming] = useActionState(
    confirmMfaEnrollmentAction,
    initialConfirm,
  );

  if (enabled || confirmState.status === "enabled") {
    return (
      <div className="rounded-xl border border-lotus-100 bg-lotus-50/60 p-5">
        <h2 className="font-display text-lg font-semibold text-ink-900">
          Authenticator MFA
        </h2>
        <p className="mt-2 text-sm text-ink-600">
          MFA is enabled on this staff account. Sign-in requires a 6-digit
          authenticator code.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-xl border border-border-subtle bg-surface-raised p-5 shadow-xs">
      <div>
        <h2 className="font-display text-lg font-semibold text-ink-900">
          Authenticator MFA
        </h2>
        <p className="mt-2 text-sm text-ink-600">
          {forced
            ? "Staff MFA is required in this environment. Enroll an authenticator app before using other admin pages."
            : "Protect financial and member admin access with an authenticator app (TOTP)."}
        </p>
      </div>

      {beginError ? (
        <p role="alert" className="text-sm text-alta-700">
          {beginError}
        </p>
      ) : null}

      {!pendingSetup ? (
        <Button
          type="button"
          disabled={isPending}
          onClick={() => {
            setBeginError(null);
            startTransition(async () => {
              const result = await beginMfaEnrollmentAction();
              if (result.status === "pending") {
                setPendingSetup({
                  secret: result.secret,
                  otpauthUrl: result.otpauthUrl,
                });
                return;
              }
              if (result.status === "error") {
                setBeginError(result.message);
              }
            });
          }}
        >
          {isPending ? "Starting…" : "Start MFA enrollment"}
        </Button>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-ink-600">
            Add this account in Google Authenticator, 1Password, or another TOTP
            app. Use the setup key below if you cannot scan a QR code.
          </p>
          <div className="rounded-md border border-border-subtle bg-surface-muted px-3 py-2">
            <p className="text-xs font-medium uppercase tracking-wide text-ink-500">
              Setup key
            </p>
            <p className="mt-1 break-all font-mono text-sm text-ink-900">
              {pendingSetup.secret}
            </p>
          </div>
          <p className="break-all font-mono text-xs text-ink-500">
            {pendingSetup.otpauthUrl}
          </p>
          <form action={confirmAction} className="space-y-3">
            <Input
              id="mfa-code"
              name="code"
              label="Confirm with a 6-digit code"
              inputMode="numeric"
              autoComplete="one-time-code"
              required
            />
            {confirmState.status === "error" ? (
              <p role="alert" className="text-sm text-alta-700">
                {confirmState.message}
              </p>
            ) : null}
            <Button type="submit" disabled={confirming}>
              {confirming ? "Verifying…" : "Enable MFA"}
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}
