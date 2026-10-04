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
import { searchAdminPujaArchive } from "@/server/services/admin-list-service";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Puja archive",
  robots: { index: false, follow: false },
};

export default async function AdminPujaPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string; page?: string }>;
}) {
  await requirePermission(Permissions.PUJA_READ, "/admin/puja");
  const params = await searchParams;
  const page = parsePage(params.page);

  let result;
  let loadError: string | null = null;
  try {
    result = await searchAdminPujaArchive({
      query: params.query,
      page,
      pageSize: 20,
    });
  } catch (error) {
    loadError =
      error instanceof Error ? error.message : "Could not load puja archive.";
    result = { items: [], total: 0, page: 1, pageSize: 20 };
  }

  return (
    <>
      <AdminPageHeader
        title="Puja archive"
        description="Events and announcements related to Saraswati Puja and club puja programmes."
      />
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        {loadError ? (
          <AdminStatusBanner tone="error">{loadError}</AdminStatusBanner>
        ) : null}
        <AdminStatusBanner>
          Public programme page:{" "}
          <Link href="/saraswati-puja" className="underline underline-offset-4">
            /saraswati-puja
          </Link>
        </AdminStatusBanner>
        <AdminFilterBar
          fields={[
            {
              type: "text",
              name: "query",
              label: "Search",
              defaultValue: params.query,
              placeholder: "Title or slug…",
            },
          ]}
        />
        <ResponsiveRecords
          mobile={
            result.items.length === 0 ? (
              <EmptyRecords message="No puja-related archive rows match these filters." />
            ) : (
              result.items.map((item) => (
                <RecordCard
                  key={item.id}
                  title={item.title}
                  subtitle={
                    <span className="font-mono">{item.slug}</span>
                  }
                  badge={<Badge variant="outline">{item.status}</Badge>}
                  fields={[
                    {
                      label: "Kind",
                      value: <Badge variant="outline">{item.kind}</Badge>,
                    },
                    { label: "Date", value: item.occurredOn ?? "—" },
                  ]}
                />
              ))
            )
          }
          desktop={
            <Table>
              <THead>
                <TR>
                  <TH>Kind</TH>
                  <TH>Title</TH>
                  <TH>Status</TH>
                  <TH>Date</TH>
                </TR>
              </THead>
              <TBody>
                {result.items.length === 0 ? (
                  <AdminEmptyRow
                    colSpan={4}
                    message="No puja-related archive rows match these filters."
                  />
                ) : (
                  result.items.map((item) => (
                    <TR key={item.id}>
                      <TD>
                        <Badge variant="outline">{item.kind}</Badge>
                      </TD>
                      <TD>
                        <p className="font-medium">{item.title}</p>
                        <p className="font-mono text-xs text-ink-500">
                          {item.slug}
                        </p>
                      </TD>
                      <TD>
                        <Badge variant="outline">{item.status}</Badge>
                      </TD>
                      <TD className="text-xs">{item.occurredOn ?? "—"}</TD>
                    </TR>
                  ))
                )}
              </TBody>
            </Table>
          }
        />
        <AdminPagination
          basePath="/admin/puja"
          params={{ query: params.query }}
          page={result.page}
          pageSize={result.pageSize}
          total={result.total}
        />
      </div>
    </>
  );
}
