import { Badge } from "@/components/ui/badge";
import { MemberPageHeader } from "@/components/member/member-page-header";
import { requireMemberId } from "@/server/auth/member-context";
import { loadPayments } from "@/server/services/member-portal-service";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Payments",
  robots: { index: false, follow: false },
};

export default async function MemberPaymentsPage() {
  const { memberId } = await requireMemberId();
  const payments = await loadPayments(memberId);

  return (
    <>
      <MemberPageHeader
        title="Payments"
        description="Payment history only. Online checkout is not enabled — no payments can be completed here."
      />
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="mb-4 rounded-md border border-border-subtle bg-surface-muted px-4 py-3 text-sm text-ink-600">
          Pay / charge actions are intentionally unavailable until a verified
          payment provider is connected. This page never simulates a successful
          payment.
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
              {payments.map((payment) => (
                <tr key={payment.id}>
                  <td className="px-4 py-3 font-mono text-ink-700">
                    {payment.paidOn ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-ink-900">{payment.amountLabel}</td>
                  <td className="px-4 py-3 text-ink-600">{payment.methodLabel}</td>
                  <td className="px-4 py-3">
                    <Badge variant="outline">
                      {payment.status.replaceAll("_", " ")}
                      {payment.isSample ? " · SAMPLE" : ""}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
