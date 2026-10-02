import { AdminSectionPage } from "@/components/admin/admin-section-page";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { Permissions } from "@/server/domain/permissions";
import { requirePermission } from "@/server/auth/session";
import { listAuditLogs } from "@/server/services/audit-service";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Audit logs",
  robots: { index: false, follow: false },
};

export default async function AdminAuditLogsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  await requirePermission(Permissions.AUDIT_READ, "/admin/audit-logs");
  const params = await searchParams;
  const page = Number(params.page ?? "1") || 1;
  const result = await listAuditLogs({ page, pageSize: 40 });

  return (
    <AdminSectionPage
      title="Audit logs"
      description="Server-recorded sensitive operations and administrative changes."
      isEmpty={result.items.length === 0}
      emptyTitle="No audit events"
      emptyDescription="Sensitive admin actions will appear here automatically."
    >
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
          {result.items.map((item) => (
            <TR key={item.id}>
              <TD className="whitespace-nowrap font-mono text-xs">
                {item.createdAt.toISOString().replace("T", " ").slice(0, 19)}
              </TD>
              <TD>
                <p className="font-medium">
                  {item.actor?.name ?? item.actor?.email ?? "System"}
                </p>
                {item.actor?.role ? (
                  <p className="text-xs text-ink-500">{item.actor.role}</p>
                ) : null}
              </TD>
              <TD className="font-mono text-xs">{item.action}</TD>
              <TD>
                <p>{item.entityType}</p>
                <p className="font-mono text-xs text-ink-500">
                  {item.entityId ?? "—"}
                </p>
              </TD>
            </TR>
          ))}
        </TBody>
      </Table>
      <p className="text-sm text-ink-500">
        Showing page {result.page} · {result.total} total events
      </p>
    </AdminSectionPage>
  );
}
