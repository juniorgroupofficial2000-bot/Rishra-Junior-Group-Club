import { AdminEmptyRow } from "@/components/admin/admin-empty-row";
import { AdminFilterBar } from "@/components/admin/admin-filter-bar";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { AdminStatusBanner } from "@/components/admin/admin-status-banner";
import { Badge } from "@/components/ui/badge";
import {
  EmptyRecords,
  RecordCard,
  ResponsiveRecords,
} from "@/components/ui/record-card";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { parsePage } from "@/lib/admin/list-params";
import { requirePermission } from "@/server/auth/session";
import { Permissions } from "@/server/domain/permissions";
import { searchAdminMemberships } from "@/server/services/admin-list-service";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Memberships",
  robots: { index: false, follow: false },
};

export default async function AdminMembershipsPage({
  searchParams,
}: {
  searchParams: Promise<{
    query?: string;
    status?: string;
    expiring?: string;
    page?: string;
  }>;
}) {
  await requirePermission(Permissions.MEMBERS_READ, "/admin/memberships");
  const params = await searchParams;
  const page = parsePage(params.page);

  let result;
  let loadError: string | null = null;
  try {
    result = await searchAdminMemberships({
      query: params.query,
      status: params.status || undefined,
      expiring: params.expiring || undefined,
      page,
      pageSize: 20,
    });
  } catch (error) {
    loadError =
      error instanceof Error ? error.message : "Could not load memberships.";
    result = { items: [], total: 0, page: 1, pageSize: 20 };
  }

  return (
    <>
      <AdminPageHeader
        title="Memberships"
        description="Plan enrollments with current/historical status. Server-side pagination."
      />
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        {loadError ? (
          <AdminStatusBanner tone="error">{loadError}</AdminStatusBanner>
        ) : null}
        <AdminFilterBar
          fields={[
            {
              type: "text",
              name: "query",
              label: "Search",
              defaultValue: params.query,
              placeholder: "Member or plan…",
            },
            {
              type: "select",
              name: "status",
              label: "Status",
              defaultValue: params.status,
              options: [
                { value: "", label: "All statuses" },
                { value: "ACTIVE", label: "ACTIVE" },
                { value: "PENDING", label: "PENDING" },
                { value: "EXPIRED", label: "EXPIRED" },
                { value: "CANCELLED", label: "CANCELLED" },
                { value: "SUSPENDED", label: "SUSPENDED" },
              ],
            },
            {
              type: "select",
              name: "expiring",
              label: "Deadline",
              defaultValue: params.expiring,
              options: [
                { value: "", label: "Any" },
                { value: "1", label: "Expiring within 30 days" },
              ],
            },
          ]}
        />
        <ResponsiveRecords
          mobile={
            result.items.length === 0 ? (
              <EmptyRecords message="No records match these filters." />
            ) : (
              result.items.map((row) => (
                <RecordCard
                  key={row.id}
                  title={row.memberName}
                  subtitle={
                    <span className="font-mono">{row.membershipNumber}</span>
                  }
                  href={`/admin/members/${row.memberId}`}
                  badge={<Badge variant="outline">{row.status}</Badge>}
                  fields={[
                    {
                      label: "Plan",
                      value: (
                        <>
                          {row.planName}
                          <span className="block font-mono text-xs text-ink-500">
                            {row.planCode}
                          </span>
                        </>
                      ),
                    },
                    { label: "Amount", value: row.amountLabel },
                    { label: "Current", value: row.isCurrent ? "Yes" : "No" },
                    { label: "Next due", value: row.nextDueOn ?? "—" },
                  ]}
                />
              ))
            )
          }
          desktop={
            <Table>
              <THead>
                <TR>
                  <TH>Member</TH>
                  <TH>Plan</TH>
                  <TH>Amount</TH>
                  <TH>Status</TH>
                  <TH>Current</TH>
                  <TH>Next due</TH>
                </TR>
              </THead>
              <TBody>
                {result.items.length === 0 ? (
                  <AdminEmptyRow colSpan={6} />
                ) : (
                  result.items.map((row) => (
                    <TR key={row.id}>
                      <TD>
                        <Link
                          href={`/admin/members/${row.memberId}`}
                          className="font-medium underline-offset-4 hover:underline"
                        >
                          {row.memberName}
                        </Link>
                        <p className="font-mono text-xs text-ink-500">
                          {row.membershipNumber}
                        </p>
                      </TD>
                      <TD>
                        {row.planName}
                        <p className="font-mono text-xs text-ink-500">
                          {row.planCode}
                        </p>
                      </TD>
                      <TD>{row.amountLabel}</TD>
                      <TD>
                        <Badge variant="outline">{row.status}</Badge>
                      </TD>
                      <TD>{row.isCurrent ? "Yes" : "No"}</TD>
                      <TD>{row.nextDueOn ?? "—"}</TD>
                    </TR>
                  ))
                )}
              </TBody>
            </Table>
          }
        />
        <AdminPagination
          basePath="/admin/memberships"
          params={{
            query: params.query,
            status: params.status,
            expiring: params.expiring,
          }}
          page={result.page}
          pageSize={result.pageSize}
          total={result.total}
        />
      </div>
    </>
  );
}
