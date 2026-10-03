import { Badge } from "@/components/ui/badge";
import {
  EmptyRecords,
  RecordCard,
  ResponsiveRecords,
} from "@/components/ui/record-card";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
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
            <Link
              href="/member/mandate"
              className="font-medium underline-offset-4 hover:underline"
            >
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

        <ResponsiveRecords
          mobile={
            payments.length === 0 ? (
              <EmptyRecords message="Your payment history will appear here after your first payment." />
            ) : (
              payments.map((payment) => (
                <RecordCard
                  key={payment.id}
                  title={payment.amountLabel}
                  subtitle={payment.paidOn ?? "—"}
                  badge={
                    <Badge variant="outline">
                      {payment.status.replaceAll("_", " ")}
                      {payment.isSample ? " · SAMPLE" : ""}
                    </Badge>
                  }
                  fields={[
                    { label: "Date", value: payment.paidOn ?? "—" },
                    { label: "Method", value: payment.methodLabel },
                  ]}
                />
              ))
            )
          }
          desktop={
            <Table>
              <THead>
                <TR>
                  <TH>Date</TH>
                  <TH>Amount</TH>
                  <TH>Method</TH>
                  <TH>Status</TH>
                </TR>
              </THead>
              <TBody>
                {payments.length === 0 ? (
                  <TR>
                    <TD colSpan={4} className="py-10 text-center text-ink-500">
                      Your payment history will appear here after your first
                      payment.
                    </TD>
                  </TR>
                ) : (
                  payments.map((payment) => (
                    <TR key={payment.id}>
                      <TD className="font-mono text-ink-700">
                        {payment.paidOn ?? "—"}
                      </TD>
                      <TD className="text-ink-900">{payment.amountLabel}</TD>
                      <TD className="text-ink-600">{payment.methodLabel}</TD>
                      <TD>
                        <Badge variant="outline">
                          {payment.status.replaceAll("_", " ")}
                          {payment.isSample ? " · SAMPLE" : ""}
                        </Badge>
                      </TD>
                    </TR>
                  ))
                )}
              </TBody>
            </Table>
          }
        />
      </div>
    </>
  );
}
