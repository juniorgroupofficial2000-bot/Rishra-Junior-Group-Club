"use client";

import {
  runDeveloperUtilityAction,
  type DeveloperActionState,
} from "@/app/(admin)/actions/developer";
import { PendingSubmitButton } from "@/components/ui/pending-submit-button";
import { useActionState } from "react";

const UTILITIES: {
  action: string;
  title: string;
  description: string;
  destructive?: boolean;
}[] = [
  {
    action: "seed",
    title: "Seed database",
    description: "Load SAMPLE / fictional demo data (wipe + seed).",
    destructive: true,
  },
  {
    action: "reset",
    title: "Reset development database",
    description:
      "Wipe SAMPLE data and re-seed. Does not run prisma migrate reset.",
    destructive: true,
  },
  {
    action: "create-test-member",
    title: "Create test member",
    description: "Insert one SAMPLE active member (@rjgc.local).",
  },
  {
    action: "create-test-event",
    title: "Create test event",
    description: "Insert one SAMPLE published event next week.",
  },
  {
    action: "create-test-announcement",
    title: "Create test announcement",
    description: "Insert one SAMPLE published announcement.",
  },
  {
    action: "test-notification",
    title: "Test notification",
    description: "Send an in-app/email notification via lane-safe channels.",
  },
  {
    action: "test-payment-webhook",
    title: "Test payment webhook",
    description: "Create a SAMPLE payment and process a mock capture webhook.",
  },
];

const initial: DeveloperActionState | null = null;

export function DeveloperUtilitiesPanel() {
  const [state, formAction] = useActionState(
    runDeveloperUtilityAction,
    initial,
  );

  return (
    <div className="space-y-4">
      {state ? (
        <p
          role="status"
          className={
            state.ok
              ? "rounded-md border border-success-200 bg-success-100/60 px-3 py-2 text-sm text-success-700"
              : "rounded-md border border-danger-200 bg-danger-100/60 px-3 py-2 text-sm text-danger-700"
          }
        >
          {state.message}
          {state.details ? (
            <span className="mt-1 block font-mono text-xs opacity-80">
              {JSON.stringify(state.details)}
            </span>
          ) : null}
        </p>
      ) : null}

      <ul className="grid gap-3">
        {UTILITIES.map((item) => (
          <li
            key={item.action}
            className="flex flex-col gap-3 rounded-lg border border-border-subtle bg-surface-raised p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <p className="font-medium text-ink-900">{item.title}</p>
              <p className="mt-0.5 text-sm text-ink-600">{item.description}</p>
            </div>
            <form action={formAction} className="shrink-0">
              <input type="hidden" name="action" value={item.action} />
              <PendingSubmitButton
                variant="outline"
                size="sm"
                pendingLabel="Running…"
                className={
                  item.destructive
                    ? "border-danger-200 text-danger-700 hover:bg-danger-100/50"
                    : undefined
                }
              >
                Run
              </PendingSubmitButton>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}
