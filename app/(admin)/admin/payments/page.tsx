import { AdminEmptyRow } from "@/components/admin/admin-empty-row";
import { AdminFilterBar } from "@/components/admin/admin-filter-bar";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { AdminStatusBanner } from "@/components/admin/admin-status-banner";
import { PaymentRefundButton } from "@/components/admin/payment-refund-button";
import { Badge } from "@/components/ui/badge";
import {
  EmptyRecords,
  RecordCard,
  ResponsiveRecords,
} from "@/components/ui/record-card";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import {
  adminQueryString,
  parseOptionalDate,
  parsePage,
} from "@/lib/admin/list-params";
import { requirePermission } from "@/server/auth/session";
import { Permissions, hasPermission } from "@/server/domain/permissions";
import { searchAdminPayments } from "@/server/services/admin-list-service";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Payments",
  robots: { index: false, follow: false },
};

const paymentStatuses = [
  "CREATED",
  "PENDING",
  "AUTHORIZED",
  "SUCCESS",
  "FAILED",
  "REFUNDED",
  "CANCELLED",
] as const;

export default async function AdminPaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{
    query?: string;
    status?: string;
    memberId?: string;
    from?: string;
    to?: string;
    page?: string;
    error?: string;
  }>;
}) {
  const session = await requirePermission(
    Permissions.PAYMENTS_READ,
    "/admin/payments",
  );
  const params = await searchParams;
  const page = parsePage(params.page);

  let result;
  let loadError: string | null = null;
  try {
    result = await searchAdminPayments({
      query: params.query,
      status: params.status || undefined,
      memberId: params.memberId || undefined,
      from: parseOptionalDate(params.from),
      to: parseOptionalDate(params.to),
      page,
      pageSize: 20,
    });
  } catch (error) {
    loadError =
      error instanceof Error ? error.message : "Could not load payments.";
    result = { items: [], total: 0, page: 1, pageSize: 20 };
  }

  const filterParams = {
    query: params.query,
    status: params.status,
    memberId: params.memberId,
    from: params.from,
    to: params.to,
  };
  const exportHref = `/api/admin/export/payments?${adminQueryString(filterParams)}`;
  const canWrite = hasPermission(session.user.role, Permissions.PAYMENTS_WRITE);

  return (
    <>
      <AdminPageHeader
        title="Payments"
        description="Server-paginated payment ledger. Status comes from verified webhooks — never from the browser."
      />
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        {params.error || loadError ? (
          <AdminStatusBanner tone="error">
            {params.error || loadError}
          </AdminStatusBanner>
        ) : null}
        {!canWrite ? (
          <AdminStatusBanner>
            Read-only access. Financial mutations require PAYMENTS_WRITE.
          </AdminStatusBanner>
        ) : null}

        <AdminFilterBar
          fields={[
            {
              type: "text",
              name: "query",
              label: "Search",
              defaultValue: params.query,
              placeholder: "Member, membership #, provider ref…",
            },
            {
              type: "select",
              name: "status",
              label: "Status",
              defaultValue: params.status,
              options: [
                { value: "", label: "All statuses" },
                ...paymentStatuses.map((value) => ({ value, label: value })),
              ],
            },
            {
              type: "text",
              name: "memberId",
              label: "Member ID",
              defaultValue: params.memberId,
              placeholder: "Exact member cuid",
            },
            {
              type: "date",
              name: "from",
              label: "From",
              defaultValue: params.from,
            },
            {
              type: "date",
              name: "to",
              label: "To",
              defaultValue: params.to,
            },
          ]}
          actions={
            <a
              href={exportHref}
              className="inline-flex h-11 items-center rounded-md border border-border-default px-4 text-sm font-medium hover:bg-ink-50"
            >
              Export CSV
            </a>
          }
        />

        <ResponsiveRecords
          mobile={
            result.items.length === 0 ? (
              <EmptyRecords message="No payments match these filters." />
            ) : (
              result.items.map((payment) => (
                <RecordCard
                  key={payment.id}
                  title={payment.memberName}
                  subtitle={
                    <span className="font-mono">
                      {payment.membershipNumber}
                    </span>
                  }
                  href={`/admin/members/${payment.memberId}`}
                  badge={<Badge variant="outline">{payment.status}</Badge>}
                  fields={[
                    { label: "Amount", value: payment.amountLabel },
                    {
                      label: "Paid",
                      value: (payment.paidAt ?? payment.createdAt).slice(
                        0,
                        10,
                      ),
                    },
                    {
                      label: "Receipt",
                      value: payment.receiptNumber ?? "—",
                    },
                    {
                      label: "Invoice",
                      value: payment.invoiceNumber ?? "No invoice",
                    },
                    {
                      label: "Provider ref",
                      value: (
                        <span className="font-mono text-xs">
                          {payment.providerPaymentRef ?? "—"}
                        </span>
                      ),
                    },
                    ...(payment.isSample
                      ? [{ label: "Sample", value: "Yes" }]
                      : []),
                  ]}
                  actions={
                    canWrite && payment.status === "SUCCESS" ? (
                      <PaymentRefundButton
                        paymentId={payment.id}
                        memberName={payment.memberName}
                        amountLabel={payment.amountLabel}
                      />
                    ) : undefined
                  }
                />
              ))
            )
          }
          desktop={
            <Table>
              <THead>
                <TR>
                  <TH>Member</TH>
                  <TH>Amount</TH>
                  <TH>Status</TH>
                  <TH>Paid</TH>
                  <TH>Receipt / Invoice</TH>
                  <TH>Provider ref</TH>
                  {canWrite ? <TH>Actions</TH> : null}
                </TR>
              </THead>
              <TBody>
                {result.items.length === 0 ? (
                  <AdminEmptyRow
                    colSpan={canWrite ? 7 : 6}
                    message="No payments match these filters."
                  />
                ) : (
                  result.items.map((payment) => (
                    <TR key={payment.id}>
                      <TD>
                        <Link
                          href={`/admin/members/${payment.memberId}`}
                          className="font-medium underline-offset-4 hover:underline"
                        >
                          {payment.memberName}
                        </Link>
                        <p className="font-mono text-xs text-ink-500">
                          {payment.membershipNumber}
                        </p>
                      </TD>
                      <TD>{payment.amountLabel}</TD>
                      <TD>
                        <Badge variant="outline">{payment.status}</Badge>
                        {payment.isSample ? (
                          <span className="ml-2 text-xs text-ink-400">
                            SAMPLE
                          </span>
                        ) : null}
                      </TD>
                      <TD className="text-xs text-ink-600">
                        {(payment.paidAt ?? payment.createdAt).slice(0, 10)}
                      </TD>
                      <TD className="text-xs">
                        {payment.receiptNumber ?? "—"}
                        <br />
                        <span className="text-ink-500">
                          {payment.invoiceNumber ?? "No invoice"}
                        </span>
                      </TD>
                      <TD className="font-mono text-xs">
                        {payment.providerPaymentRef ?? "—"}
                      </TD>
                      {canWrite ? (
                        <TD>
                          {payment.status === "SUCCESS" ? (
                            <PaymentRefundButton
                              paymentId={payment.id}
                              memberName={payment.memberName}
                              amountLabel={payment.amountLabel}
                            />
                          ) : (
                            <span className="text-xs text-ink-400">—</span>
                          )}
                        </TD>
                      ) : null}
                    </TR>
                  ))
                )}
              </TBody>
            </Table>
          }
        />

        <AdminPagination
          basePath="/admin/payments"
          params={filterParams}
          page={result.page}
          pageSize={result.pageSize}
          total={result.total}
        />
      </div>
    </>
  );
}
