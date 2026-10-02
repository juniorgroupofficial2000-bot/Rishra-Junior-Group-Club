import { AdminSectionPage } from "@/components/admin/admin-section-page";
import { SimpleBarChart } from "@/components/admin/simple-bar-chart";
import { DashboardPanel } from "@/components/club/dashboard";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { Permissions } from "@/server/domain/permissions";
import { requirePermission } from "@/server/auth/session";
import { loadAdminReportsSummary } from "@/server/services/admin-catalog-service";
import { ReportTypes } from "@/server/reports/report-service";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reports",
  robots: { index: false, follow: false },
};

const reportLabels: Record<(typeof ReportTypes)[number], string> = {
  members: "Member report",
  "payment-collection": "Payment collection report",
  "outstanding-dues": "Outstanding dues report",
  "failed-payments": "Failed payment report",
  mandates: "Mandate report",
  "event-attendance": "Event attendance report",
};

export default async function AdminReportsPage() {
  await requirePermission(Permissions.REPORTS_VIEW, "/admin/reports");
  const reports = await loadAdminReportsSummary();

  return (
    <AdminSectionPage
      title="Reports"
      description="Operational summaries with CSV export. Exports are authorization-checked on the server."
    >
      <DashboardPanel
        title="CSV exports"
        description="Download full report tables for offline review"
      >
        <ul className="grid gap-2 sm:grid-cols-2">
          {ReportTypes.map((type) => (
            <li key={type}>
              <a
                href={`/api/admin/reports/${type}`}
                className="flex min-h-11 items-center rounded-md border border-border-default px-3 text-sm font-medium text-ink-800 hover:bg-ink-50"
              >
                {reportLabels[type]} (CSV)
              </a>
            </li>
          ))}
        </ul>
      </DashboardPanel>

      <div className="grid gap-6 lg:grid-cols-2">
        <DashboardPanel title="Members by status">
          <SimpleBarChart
            data={reports.membersByStatus.map((row) => ({
              label: row.status,
              value: row.count,
            }))}
          />
        </DashboardPanel>
        <DashboardPanel title="Mandates by status">
          <SimpleBarChart
            data={reports.mandatesByStatus.map((row) => ({
              label: row.status.replaceAll("_", " "),
              value: row.count,
            }))}
          />
        </DashboardPanel>
      </div>

      <DashboardPanel
        title="Payments by status"
        description="Counts and recorded totals — not live settlement data"
      >
        <Table>
          <THead>
            <TR>
              <TH>Status</TH>
              <TH>Count</TH>
              <TH>Amount</TH>
            </TR>
          </THead>
          <TBody>
            {reports.paymentsByStatus.map((row) => (
              <TR key={row.status}>
                <TD>{row.status.replaceAll("_", " ")}</TD>
                <TD>{row.count}</TD>
                <TD>{row.amountLabel}</TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </DashboardPanel>
    </AdminSectionPage>
  );
}
