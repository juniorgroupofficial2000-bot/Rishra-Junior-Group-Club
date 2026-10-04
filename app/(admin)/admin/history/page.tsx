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
import { searchAdminHistory } from "@/server/services/admin-list-service";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "History archive",
  robots: { index: false, follow: false },
};

export default async function AdminHistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string; page?: string }>;
}) {
  await requirePermission(Permissions.EVENTS_READ, "/admin/history");
  const params = await searchParams;
  const page = parsePage(params.page);

  let result;
  let loadError: string | null = null;
  try {
    result = await searchAdminHistory({
      query: params.query,
      page,
      pageSize: 20,
    });
  } catch (error) {
    loadError =
      error instanceof Error ? error.message : "Could not load history.";
    result = { items: [], total: 0, page: 1, pageSize: 20 };
  }

  return (
    <>
      <AdminPageHeader
        title="History archive"
        description="Completed club events retained for operational history. Server-paginated."
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
              placeholder: "Title, slug, venue…",
            },
          ]}
        />
        <ResponsiveRecords
          mobile={
            result.items.length === 0 ? (
              <EmptyRecords message="No completed history records match these filters." />
            ) : (
              result.items.map((event) => (
                <RecordCard
                  key={event.id}
                  title={event.title}
                  subtitle={
                    <span className="font-mono">{event.slug}</span>
                  }
                  badge={<Badge variant="outline">{event.status}</Badge>}
                  fields={[
                    {
                      label: "Date",
                      value: event.startsAt.toISOString().slice(0, 10),
                    },
                    { label: "Venue", value: event.venueLabel ?? "—" },
                  ]}
                />
              ))
            )
          }
          desktop={
            <Table>
              <THead>
                <TR>
                  <TH>Event</TH>
                  <TH>Date</TH>
                  <TH>Venue</TH>
                  <TH>Status</TH>
                </TR>
              </THead>
              <TBody>
                {result.items.length === 0 ? (
                  <AdminEmptyRow
                    colSpan={4}
                    message="No completed history records match these filters."
                  />
                ) : (
                  result.items.map((event) => (
                    <TR key={event.id}>
                      <TD>
                        <p className="font-medium">{event.title}</p>
                        <p className="font-mono text-xs text-ink-500">
                          {event.slug}
                        </p>
                      </TD>
                      <TD className="text-xs">
                        {event.startsAt.toISOString().slice(0, 10)}
                      </TD>
                      <TD>{event.venueLabel ?? "—"}</TD>
                      <TD>
                        <Badge variant="outline">{event.status}</Badge>
                      </TD>
                    </TR>
                  ))
                )}
              </TBody>
            </Table>
          }
        />
        <AdminPagination
          basePath="/admin/history"
          params={{ query: params.query }}
          page={result.page}
          pageSize={result.pageSize}
          total={result.total}
        />
      </div>
    </>
  );
}
