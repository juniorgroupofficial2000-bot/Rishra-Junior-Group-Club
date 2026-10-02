import { Badge } from "@/components/ui/badge";
import { MemberPageHeader } from "@/components/member/member-page-header";
import { requireMemberId } from "@/server/auth/member-context";
import { loadPayments } from "@/server/services/member-portal-service";
import { getMemberMandateView } from "@/server/payments/mandate-service";
import { formatAmountLabel } from "@/server/repositories/prisma/mappers";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Payments",
  robots: { index: false, follow: false },
};

export default async function MemberPaymentsPage() {
  const { memberId } = await requireMemberId();
  const [payments, { latestFailedPayment, mandate }] = await Promise.all([
    loadPayments(memberId),
    getMemberMandateView(memberId),
  ]);

  return (
    <>
      <MemberPageHeader
        title="Payments"
        description="Payment history from verified provider events. Success is never simulated in the UI."
      />
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        {latestFailedPayment ? (
          <div
            role="alert"
            className="rounded-md border border-danger-100 bg-danger-50/50 px-4 py-3 text-sm text-ink-700"
          >
            Latest debit failed (
            {formatAmountLabel(
              latestFailedPayment.amountPaise,
              latestFailedPayment.currency,
            )}
            ).{" "}
            <Link href="/member/mandate" className="font-medium underline-offset-4 hover:underline">
              Review mandate
            </Link>
          </div>
        ) : null}

        <div className="rounded-md border border-border-subtle bg-surface-muted px-4 py-3 text-sm text-ink-600">
          Next debit:{" "}
          {mandate?.nextDebitAt
            ? mandate.nextDebitAt.toISOString().slice(0, 10)
            : "—"}
          . Mandate status: {mandate?.status ?? "CREATED"}.
        </div>

        <div className="overflow-x-auto rounded-xl border border-border-subtle bg-surface-raised shadow-xs">
          <table className="w-full min-w-[36rem] text-left text-sm">
            <thead className="bg-surface-muted text-xs uppercase tracking-wide text-ink-500">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Method</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-ink-500">
                    No payments yet.
                  </td>
                </tr>
              ) : (
                payments.map((payment) => (
                  <tr key={payment.id}>
                    <td className="px-4 py-3 font-mono text-ink-700">
                      {payment.paidOn ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-ink-900">
                      {payment.amountLabel}
                    </td>
                    <td className="px-4 py-3 text-ink-600">
                      {payment.methodLabel}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline">
                        {payment.status.replaceAll("_", " ")}
                        {payment.isSample ? " · SAMPLE" : ""}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
