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
import { searchAdminPublicCommittee } from "@/server/services/admin-list-service";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Committee",
  robots: { index: false, follow: false },
};

export default async function AdminCommitteePage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string; status?: string; page?: string }>;
}) {
  await requirePermission(Permissions.COMMITTEE_READ, "/admin/committee");
  const params = await searchParams;
  const page = parsePage(params.page);

  let result;
  let loadError: string | null = null;
  try {
    result = await searchAdminPublicCommittee({
      query: params.query,
      status: params.status || undefined,
      page,
      pageSize: 20,
    });
  } catch (error) {
    loadError =
      error instanceof Error ? error.message : "Could not load committee.";
    result = { items: [], total: 0, page: 1, pageSize: 20 };
  }

  return (
    <>
      <AdminPageHeader
        title="Committee"
        description="Public committee roster — the same records shown on /committee. Manage position, photo, biography, order, and term."
        actions={
          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin/content/committee-roster/new"
              className="inline-flex min-h-11 items-center rounded-md bg-ink-900 px-3 text-sm font-medium text-white hover:bg-ink-800"
            >
              Add committee member
            </Link>
            <Link
              href="/admin/content/positions"
              className="inline-flex min-h-11 items-center rounded-md border border-border-default px-3 text-sm font-medium hover:bg-ink-50"
            >
              Manage positions
            </Link>
          </div>
        }
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
              placeholder: "Name or role…",
            },
            {
              type: "select",
              name: "status",
              label: "Status",
              defaultValue: params.status,
              options: [
                { value: "", label: "All" },
                { value: "DRAFT", label: "Draft / inactive" },
                { value: "PUBLISHED", label: "Active (public)" },
                { value: "ARCHIVED", label: "Archived" },
              ],
            },
          ]}
        />
        <ResponsiveRecords
          mobile={
            result.items.length === 0 ? (
              <EmptyRecords message="No committee members match these filters. Add a published roster entry to appear on the public site." />
            ) : (
              result.items.map((row) => (
                <RecordCard
                  key={row.id}
                  title={row.displayName}
                  subtitle={row.roleTitle}
                  href={`/admin/content/committee-roster/${row.id}`}
                  badge={<Badge variant="outline">{row.status}</Badge>}
                  fields={[
                    { label: "Term", value: row.termYear ?? "—" },
                    { label: "Order", value: row.sortOrder },
                    {
                      label: "Photo",
                      value: row.portraitAssetId ? "Linked" : "None",
                    },
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
                  <TH>Position</TH>
                  <TH>Term</TH>
                  <TH>Order</TH>
                  <TH>Status</TH>
                  <TH>Actions</TH>
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
                          href={`/admin/content/committee-roster/${row.id}`}
                          className="font-medium underline-offset-4 hover:underline"
                        >
                          {row.displayName}
                        </Link>
                        {row.biography ? (
                          <p className="mt-1 line-clamp-2 text-xs text-ink-500">
                            {row.biography}
                          </p>
                        ) : null}
                      </TD>
                      <TD>{row.roleTitle}</TD>
                      <TD>{row.termYear ?? "—"}</TD>
                      <TD>{row.sortOrder}</TD>
                      <TD>
                        <Badge variant="outline">{row.status}</Badge>
                      </TD>
                      <TD>
                        <Link
                          href={`/admin/content/committee-roster/${row.id}`}
                          className="text-sm font-medium underline-offset-4 hover:underline"
                        >
                          Edit
                        </Link>
                      </TD>
                    </TR>
                  ))
                )}
              </TBody>
            </Table>
          }
        />
        <AdminPagination
          basePath="/admin/committee"
          params={{ query: params.query, status: params.status }}
          page={result.page}
          pageSize={result.pageSize}
          total={result.total}
        />
      </div>
    </>
  );
}
