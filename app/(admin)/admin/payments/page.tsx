import { AdminSectionPage } from "@/components/admin/admin-section-page";
import { Badge } from "@/components/ui/badge";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { Permissions } from "@/server/domain/permissions";
import { requirePermission } from "@/server/auth/session";
import { formatAmountLabel } from "@/server/repositories/prisma/mappers";
import {
  listPaymentAttempts,
  listPaymentsForReconciliation,
} from "@/server/payments/payment-service";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Payments",
  robots: { index: false, follow: false },
};

export default async function AdminPaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  await requirePermission(Permissions.PAYMENTS_READ, "/admin/payments");
  const params = await searchParams;
  const view = params.view === "attempts" ? "attempts" : "reconciliation";

  const [payments, attempts] = await Promise.all([
    listPaymentsForReconciliation(),
    listPaymentAttempts(80),
  ]);

  return (
    <AdminSectionPage
      title="Payments"
      description="Provider-confirmed payment states only. Success requires verified webhook or confirmed provider response."
    >
      <div className="flex flex-wrap gap-2">
        <Link
          href="/admin/payments"
          className="rounded-md border border-border-default px-3 py-2 text-sm hover:bg-ink-50"
        >
          Reconciliation
        </Link>
        <Link
          href="/admin/payments?view=attempts"
          className="rounded-md border border-border-default px-3 py-2 text-sm hover:bg-ink-50"
        >
          Payment attempts
        </Link>
      </div>

      {view === "attempts" ? (
        <Table>
          <THead>
            <TR>
              <TH>When</TH>
              <TH>Member</TH>
              <TH>Attempt status</TH>
              <TH>Payment status</TH>
              <TH>Failure</TH>
            </TR>
          </THead>
          <TBody>
            {attempts.length === 0 ? (
              <TR>
                <TD colSpan={5} className="text-ink-500">
                  No payment attempts yet.
                </TD>
              </TR>
            ) : (
              attempts.map((attempt) => (
                <TR key={attempt.id}>
                  <TD className="font-mono text-xs">
                    {attempt.attemptedAt.toISOString().slice(0, 19).replace("T", " ")}
                  </TD>
                  <TD>
                    <p className="font-medium">
                      {attempt.payment.member.displayName}
                    </p>
                    <p className="font-mono text-xs text-ink-500">
                      {attempt.payment.member.membershipNumber}
                    </p>
                  </TD>
                  <TD>
                    <Badge variant="outline">{attempt.status}</Badge>
                  </TD>
                  <TD>{attempt.payment.status}</TD>
                  <TD className="text-xs text-ink-600">
                    {attempt.failureCode ?? "—"}
                    {attempt.failureMessage
                      ? ` · ${attempt.failureMessage}`
                      : ""}
                  </TD>
                </TR>
              ))
            )}
          </TBody>
        </Table>
      ) : (
        <Table>
          <THead>
            <TR>
              <TH>Member</TH>
              <TH>Amount</TH>
              <TH>Status</TH>
              <TH>Mandate</TH>
              <TH>Provider ref</TH>
              <TH>Reconcile</TH>
            </TR>
          </THead>
          <TBody>
            {payments.length === 0 ? (
              <TR>
                <TD colSpan={6} className="text-ink-500">
                  No payments to reconcile.
                </TD>
              </TR>
            ) : (
              payments.map((payment) => (
                <TR key={payment.id}>
                  <TD>
                    <p className="font-medium">{payment.memberName}</p>
                    <p className="font-mono text-xs text-ink-500">
                      {payment.membershipNumber}
                    </p>
                  </TD>
                  <TD>{formatAmountLabel(payment.amountPaise)}</TD>
                  <TD>
                    <Badge variant="outline">{payment.status}</Badge>
                  </TD>
                  <TD>{payment.mandateStatus ?? "—"}</TD>
                  <TD className="font-mono text-xs">
                    {payment.providerPaymentRef ?? "—"}
                  </TD>
                  <TD>
                    {payment.needsReconciliation ? (
                      <Badge variant="warning">Needs review</Badge>
                    ) : (
                      <Badge variant="success">OK</Badge>
                    )}
                  </TD>
                </TR>
              ))
            )}
          </TBody>
        </Table>
      )}
    </AdminSectionPage>
  );
}
