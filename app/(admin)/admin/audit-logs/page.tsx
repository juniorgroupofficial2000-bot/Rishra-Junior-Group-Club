import { AdminEmptyRow } from "@/components/admin/admin-empty-row";
import { AdminFilterBar } from "@/components/admin/admin-filter-bar";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { AdminStatusBanner } from "@/components/admin/admin-status-banner";
import {
  EmptyRecords,
  RecordCard,
  ResponsiveRecords,
} from "@/components/ui/record-card";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { parsePage } from "@/lib/admin/list-params";
import { requirePermission } from "@/server/auth/session";
import { Permissions } from "@/server/domain/permissions";
import { listAuditLogs } from "@/server/services/audit-service";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Audit logs",
  robots: { index: false, follow: false },
};

export default async function AdminAuditLogsPage({
  searchParams,
}: {
  searchParams: Promise<{
    action?: string;
    entityType?: string;
    page?: string;
  }>;
}) {
  await requirePermission(Permissions.AUDIT_READ, "/admin/audit-logs");
  const params = await searchParams;
  const page = parsePage(params.page);

  let result;
  let loadError: string | null = null;
  try {
    result = await listAuditLogs({
      page,
      pageSize: 40,
      action: params.action || undefined,
      entityType: params.entityType || undefined,
    });
  } catch (error) {
    loadError =
      error instanceof Error ? error.message : "Could not load audit logs.";
    result = { items: [], total: 0, page: 1, pageSize: 40 };
  }

  return (
    <>
      <AdminPageHeader
        title="Audit logs"
        description="Append-only operational audit trail. Filter by action or entity type."
      />
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        {loadError ? (
          <AdminStatusBanner tone="error">{loadError}</AdminStatusBanner>
        ) : null}
        <AdminFilterBar
          fields={[
            {
              type: "text",
              name: "action",
              label: "Action contains",
              defaultValue: params.action,
              placeholder: "member.updated, report.exported…",
            },
            {
              type: "text",
              name: "entityType",
              label: "Entity type",
              defaultValue: params.entityType,
              placeholder: "Member, Payment, report…",
            },
          ]}
        />
        <ResponsiveRecords
          mobile={
            result.items.length === 0 ? (
              <EmptyRecords message="No records match these filters." />
            ) : (
              result.items.map((log) => (
                <RecordCard
                  key={log.id}
                  title={log.action}
                  subtitle={log.createdAt
                    .toISOString()
                    .replace("T", " ")
                    .slice(0, 19)}
                  fields={[
                    {
                      label: "Actor",
                      value: log.actor?.email ?? "system",
                    },
                    {
                      label: "Entity",
                      value: (
                        <>
                          {log.entityType}
                          {log.entityId ? (
                            <span className="text-ink-500">
                              {" "}
                              · {log.entityId}
                            </span>
                          ) : null}
                        </>
                      ),
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
                  <TH>When</TH>
                  <TH>Actor</TH>
                  <TH>Action</TH>
                  <TH>Entity</TH>
                </TR>
              </THead>
              <TBody>
                {result.items.length === 0 ? (
                  <AdminEmptyRow colSpan={4} />
                ) : (
                  result.items.map((log) => (
                    <TR key={log.id}>
                      <TD className="text-xs whitespace-nowrap">
                        {log.createdAt
                          .toISOString()
                          .replace("T", " ")
                          .slice(0, 19)}
                      </TD>
                      <TD className="text-xs">
                        {log.actor?.email ?? "system"}
                      </TD>
                      <TD className="font-mono text-xs">{log.action}</TD>
                      <TD className="text-xs">
                        {log.entityType}
                        {log.entityId ? (
                          <span className="text-ink-500">
                            {" "}
                            · {log.entityId}
                          </span>
                        ) : null}
                      </TD>
                    </TR>
                  ))
                )}
              </TBody>
            </Table>
          }
        />
        <AdminPagination
          basePath="/admin/audit-logs"
          params={{
            action: params.action,
            entityType: params.entityType,
          }}
          page={result.page}
          pageSize={result.pageSize}
          total={result.total}
        />
      </div>
    </>
  );
}
