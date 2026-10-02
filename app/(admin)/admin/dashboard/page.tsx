import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { SimpleBarChart } from "@/components/admin/simple-bar-chart";
import {
  DashboardGrid,
  DashboardPanel,
  StatTile,
} from "@/components/club/dashboard";
import { formatAmountLabel } from "@/server/repositories/prisma/mappers";
import { Permissions } from "@/server/domain/permissions";
import { requirePermission } from "@/server/auth/session";
import { loadAdminDashboard } from "@/server/services/admin-dashboard-service";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Admin dashboard",
  robots: { index: false, follow: false },
};

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await requirePermission(Permissions.DASHBOARD_VIEW);
  const params = await searchParams;
  const data = await loadAdminDashboard();

  return (
    <>
      <AdminPageHeader
        title="Dashboard"
        description="Operational overview for membership, dues, and club activity."
      />
      <div className="space-y-8 p-4 sm:p-6 lg:p-8">
        {params.error === "forbidden" ? (
          <p
            role="alert"
            className="rounded-md border border-alta-100 bg-alta-50 px-4 py-3 text-sm text-alta-700"
          >
            You do not have permission for that section.
          </p>
        ) : null}

        <DashboardGrid>
          <StatTile label="Total members" value={data.totalMembers} />
          <StatTile label="Active members" value={data.activeMembers} />
          <StatTile label="Pending members" value={data.pendingMembers} />
          <StatTile
            label="Payment collection"
            value={data.paymentCollectionLabel}
            hint="Recorded payments (not live checkout)"
          />
          <StatTile
            label="Outstanding dues"
            value={data.outstandingDuesLabel}
            hint={`${data.outstandingDuesCount} open invoice(s)`}
          />
          <StatTile label="Payment failures" value={data.paymentFailures} />
          <StatTile label="Active mandates" value={data.activeMandates} />
          <StatTile label="Upcoming events" value={data.upcomingEvents} />
        </DashboardGrid>

        <div className="grid gap-6 lg:grid-cols-2">
          <DashboardPanel
            title="Membership status"
            description="Useful for spotting onboarding backlog"
          >
            <SimpleBarChart data={data.memberStatusSeries} />
          </DashboardPanel>
          <DashboardPanel
            title="Collection by month"
            description="Recorded payment totals — informational only"
          >
            <SimpleBarChart
              data={data.collectionByMonth.map((row) => ({
                label: row.label,
                value: row.amountPaise,
              }))}
              valueFormatter={(value) => formatAmountLabel(value)}
            />
          </DashboardPanel>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <DashboardPanel title="Upcoming events">
            {data.upcomingEventItems.length === 0 ? (
              <p className="text-sm text-ink-500">No upcoming published events.</p>
            ) : (
              <ul className="space-y-3 text-sm">
                {data.upcomingEventItems.map((event) => (
                  <li key={event.id}>
                    <p className="font-medium text-ink-900">{event.title}</p>
                    <p className="text-ink-500">
                      {new Date(event.startsAt).toLocaleString("en-IN")}
                      {event.venueLabel ? ` · ${event.venueLabel}` : ""}
                    </p>
                  </li>
                ))}
              </ul>
            )}
            <Link
              href="/admin/events"
              className="mt-4 inline-flex text-sm font-medium text-ink-800 underline-offset-4 hover:underline"
            >
              Manage events
            </Link>
          </DashboardPanel>

          <DashboardPanel title="Recent activity">
            {data.recentActivity.length === 0 ? (
              <p className="text-sm text-ink-500">No audit events yet.</p>
            ) : (
              <ul className="divide-y divide-border-subtle text-sm">
                {data.recentActivity.map((item) => (
                  <li key={item.id} className="py-3">
                    <p className="font-medium text-ink-900">{item.action}</p>
                    <p className="text-ink-500">
                      {item.actorName} · {item.entityType}
                      {item.entityId ? ` · ${item.entityId.slice(0, 8)}…` : ""}
                    </p>
                    <p className="font-mono text-xs text-ink-400">
                      {new Date(item.createdAt).toLocaleString("en-IN")}
                    </p>
                  </li>
                ))}
              </ul>
            )}
            <Link
              href="/admin/audit-logs"
              className="mt-4 inline-flex text-sm font-medium text-ink-800 underline-offset-4 hover:underline"
            >
              View audit logs
            </Link>
          </DashboardPanel>
        </div>
      </div>
    </>
  );
}
