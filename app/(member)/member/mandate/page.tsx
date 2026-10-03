import { setupMandateAction } from "@/app/(member)/actions/mandate";
import { CancelMandateButton } from "@/components/member/cancel-mandate-button";
import { Badge } from "@/components/ui/badge";
import { PendingSubmitButton } from "@/components/ui/pending-submit-button";
import { MemberPageHeader } from "@/components/member/member-page-header";
import { requireMemberId } from "@/server/auth/member-context";
import { getPaymentProviderName } from "@/server/payments/factory";
import { getMemberMandateView } from "@/server/payments/mandate-service";
import { formatAmountLabel } from "@/server/repositories/prisma/mappers";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mandate",
  robots: { index: false, follow: false },
};

export default async function MemberMandatePage({
  searchParams,
}: {
  searchParams: Promise<{
    error?: string;
    started?: string;
    cancelled?: string;
  }>;
}) {
  const { memberId } = await requireMemberId();
  const params = await searchParams;
  const { mandate, latestFailedPayment, plan } =
    await getMemberMandateView(memberId);
  const providerName = getPaymentProviderName();

  const canSetup =
    !!plan &&
    plan.amountPaise >= 100 &&
    (!mandate ||
      ["CANCELLED", "FAILED", "EXPIRED", "CREATED"].includes(mandate.status));
  const canCancel =
    !!mandate &&
    ["PENDING", "ACTIVE", "PAUSED", "CREATED"].includes(mandate.status);

  return (
    <>
      <MemberPageHeader
        title="E-mandate"
        description="Recurring payment authority. Success is confirmed only by verified provider webhooks."
      />
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        {params.error ? (
          <p
            role="alert"
            className="rounded-md border border-alta-100 bg-alta-50 px-4 py-3 text-sm text-alta-700"
          >
            {params.error}
          </p>
        ) : null}
        {params.started ? (
          <p
            role="status"
            className="rounded-md border border-border-subtle bg-surface-muted px-4 py-3 text-sm text-ink-700"
          >
            Mandate setup started. Status stays pending until a verified webhook
            confirms activation.
          </p>
        ) : null}
        {params.cancelled ? (
          <p
            role="status"
            className="rounded-md border border-border-subtle bg-surface-muted px-4 py-3 text-sm text-ink-700"
          >
            Cancellation requested with the payment provider.
          </p>
        ) : null}

        <div className="max-w-xl rounded-xl border border-border-subtle bg-surface-raised p-5 shadow-xs">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">
              {(mandate?.status ?? "CREATED").replaceAll("_", " ")}
            </Badge>
            <span className="text-sm text-ink-500">
              Provider: {mandate?.provider ?? providerName} (
              {providerName === "mock" ? "sandbox/mock" : "configured"})
            </span>
          </div>

          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-ink-500">Membership plan</dt>
              <dd className="font-medium text-ink-900">
                {plan?.name ?? "No plan assigned"}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-ink-500">Plan amount</dt>
              <dd className="font-medium text-ink-900">
                {plan
                  ? formatAmountLabel(plan.amountPaise, plan.currency)
                  : "—"}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-ink-500">Next debit</dt>
              <dd className="font-medium text-ink-900">
                {mandate?.nextDebitAt
                  ? mandate.nextDebitAt.toISOString().slice(0, 10)
                  : "—"}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-ink-500">Mandate amount</dt>
              <dd className="font-medium text-ink-900">
                {mandate?.amountPaise != null
                  ? formatAmountLabel(mandate.amountPaise, mandate.currency)
                  : "—"}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-ink-500">Provider reference</dt>
              <dd className="font-mono text-xs text-ink-700">
                {mandate?.providerMandateRef ?? "—"}
              </dd>
            </div>
          </dl>

          <p className="mt-4 text-sm leading-relaxed text-ink-600">
            {mandate?.note ??
              "No mandate on file. Card numbers, CVV, UPI PINs, and banking passwords are never stored. Debit amounts come from your assigned membership plan."}
          </p>
        </div>

        {latestFailedPayment ? (
          <div
            role="alert"
            className="max-w-xl rounded-xl border border-danger-100 bg-danger-50/40 p-5"
          >
            <h2 className="font-display text-lg font-semibold text-ink-900">
              Failed payment
            </h2>
            <p className="mt-2 text-sm text-ink-600">
              A recent debit failed (
              {formatAmountLabel(
                latestFailedPayment.amountPaise,
                latestFailedPayment.currency,
              )}
              ).{" "}
              {latestFailedPayment.notes ??
                "Contact the treasurer if this persists."}
            </p>
            <p className="mt-2 font-mono text-xs text-ink-400">
              Ref:{" "}
              {latestFailedPayment.providerPaymentRef ??
                latestFailedPayment.id}
            </p>
          </div>
        ) : null}

        {canSetup ? (
          <form
            action={setupMandateAction}
            className="max-w-xl space-y-4 rounded-xl border border-border-subtle bg-surface-raised p-5 shadow-xs"
          >
            <h2 className="font-display text-lg font-semibold text-ink-900">
              Set up mandate
            </h2>
            <p className="text-sm text-ink-600">
              Starts provider setup for{" "}
              <strong>
                {formatAmountLabel(plan!.amountPaise, plan!.currency)}
              </strong>{" "}
              based on your assigned membership plan. The mandate is not active
              until a verified webhook confirms it.
            </p>
            <PendingSubmitButton pendingLabel="Starting…">
              Start mandate setup
            </PendingSubmitButton>
          </form>
        ) : null}

        {!plan ? (
          <p className="max-w-xl text-sm text-ink-600" role="status">
            A membership plan must be assigned by the club before you can set up
            an e-mandate.
          </p>
        ) : null}

        {canCancel ? (
          <div className="max-w-xl">
            <CancelMandateButton />
          </div>
        ) : null}
      </div>
    </>
  );
}
