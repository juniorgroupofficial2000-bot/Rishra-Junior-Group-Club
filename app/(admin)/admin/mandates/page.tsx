import { AdminEmptyRow } from "@/components/admin/admin-empty-row";
import { AdminFilterBar } from "@/components/admin/admin-filter-bar";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { AdminStatusBanner } from "@/components/admin/admin-status-banner";
import { MandateCancelButton } from "@/components/admin/mandate-cancel-button";
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
import { searchAdminMandates } from "@/server/services/admin-list-service";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Mandates",
  robots: { index: false, follow: false },
};

const mandateStatuses = [
  "CREATED",
  "PENDING",
  "ACTIVE",
  "PAUSED",
  "FAILED",
  "CANCELLED",
  "EXPIRED",
] as const;

export default async function AdminMandatesPage({
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
    Permissions.MANDATES_READ,
    "/admin/mandates",
  );
  const params = await searchParams;
  const page = parsePage(params.page);
  const canWrite = hasPermission(session.user.role, Permissions.MANDATES_WRITE);

  let result;
  let loadError: string | null = null;
  try {
    result = await searchAdminMandates({
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
      error instanceof Error ? error.message : "Could not load mandates.";
    result = { items: [], total: 0, page: 1, pageSize: 20 };
  }

  const filterParams = {
    query: params.query,
    status: params.status,
    memberId: params.memberId,
    from: params.from,
    to: params.to,
  };

  return (
    <>
      <AdminPageHeader
        title="Mandates"
        description="E-mandate authorizations for recurring dues. Cancellation requires confirmation and MANDATES_WRITE."
      />
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        {params.error || loadError ? (
          <AdminStatusBanner tone="error">
            {params.error || loadError}
          </AdminStatusBanner>
        ) : null}

        <AdminFilterBar
          fields={[
            {
              type: "text",
              name: "query",
              label: "Search",
              defaultValue: params.query,
              placeholder: "Member or provider mandate ref…",
            },
            {
              type: "select",
              name: "status",
              label: "Status",
              defaultValue: params.status,
              options: [
                { value: "", label: "All statuses" },
                ...mandateStatuses.map((value) => ({ value, label: value })),
              ],
            },
            {
              type: "text",
              name: "memberId",
              label: "Member ID",
              defaultValue: params.memberId,
            },
            {
              type: "date",
              name: "from",
              label: "Updated from",
              defaultValue: params.from,
            },
            {
              type: "date",
              name: "to",
              label: "Updated to",
              defaultValue: params.to,
            },
          ]}
          actions={
            <a
              href={`/api/admin/export/mandates?${adminQueryString(filterParams)}`}
              className="inline-flex h-11 items-center rounded-md border border-border-default px-4 text-sm font-medium hover:bg-ink-50"
            >
              Export CSV
            </a>
          }
        />

        <ResponsiveRecords
          mobile={
            result.items.length === 0 ? (
              <EmptyRecords message="No mandates match these filters." />
            ) : (
              result.items.map((mandate) => (
                <RecordCard
                  key={mandate.id}
                  title={mandate.memberName}
                  subtitle={
                    <span className="font-mono">
                      {mandate.membershipNumber}
                    </span>
                  }
                  href={`/admin/members/${mandate.memberId}`}
                  badge={<Badge variant="outline">{mandate.status}</Badge>}
                  fields={[
                    { label: "Amount", value: mandate.amountLabel },
                    {
                      label: "Next debit",
                      value: mandate.nextDebitAt?.slice(0, 10) ?? "—",
                    },
                    {
                      label: "Provider ref",
                      value: (
                        <span className="font-mono text-xs">
                          {mandate.providerMandateRef ?? "—"}
                        </span>
                      ),
                    },
                  ]}
                  actions={
                    canWrite &&
                    ["CREATED", "PENDING", "ACTIVE", "PAUSED"].includes(
                      mandate.status,
                    ) ? (
                      <MandateCancelButton
                        memberId={mandate.memberId}
                        memberName={mandate.memberName}
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
                  <TH>Status</TH>
                  <TH>Amount</TH>
                  <TH>Next debit</TH>
                  <TH>Provider ref</TH>
                  <TH>Actions</TH>
                </TR>
              </THead>
              <TBody>
                {result.items.length === 0 ? (
                  <AdminEmptyRow
                    colSpan={6}
                    message="No mandates match these filters."
                  />
                ) : (
                  result.items.map((mandate) => (
                    <TR key={mandate.id}>
                      <TD>
                        <Link
                          href={`/admin/members/${mandate.memberId}`}
                          className="font-medium underline-offset-4 hover:underline"
                        >
                          {mandate.memberName}
                        </Link>
                        <p className="font-mono text-xs text-ink-500">
                          {mandate.membershipNumber}
                        </p>
                      </TD>
                      <TD>
                        <Badge variant="outline">{mandate.status}</Badge>
                      </TD>
                      <TD>{mandate.amountLabel}</TD>
                      <TD className="text-xs">
                        {mandate.nextDebitAt?.slice(0, 10) ?? "—"}
                      </TD>
                      <TD className="font-mono text-xs">
                        {mandate.providerMandateRef ?? "—"}
                      </TD>
                      <TD>
                        {canWrite &&
                        ["CREATED", "PENDING", "ACTIVE", "PAUSED"].includes(
                          mandate.status,
                        ) ? (
                          <MandateCancelButton
                            memberId={mandate.memberId}
                            memberName={mandate.memberName}
                          />
                        ) : (
                          <span className="text-xs text-ink-400">—</span>
                        )}
                      </TD>
                    </TR>
                  ))
                )}
              </TBody>
            </Table>
          }
        />

        <AdminPagination
          basePath="/admin/mandates"
          params={filterParams}
          page={result.page}
          pageSize={result.pageSize}
          total={result.total}
        />
      </div>
    </>
  );
}
