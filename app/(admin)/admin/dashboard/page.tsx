import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { DashboardPanel } from "@/components/club/dashboard";
import { Permissions } from "@/server/domain/permissions";
import { requirePermission } from "@/server/auth/session";
import { loadAdminDashboard } from "@/server/services/admin-dashboard-service";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Admin dashboard",
  robots: { index: false, follow: false },
};

function AttentionLink({
  href,
  label,
  count,
  tone = "default",
}: {
  href: string;
  label: string;
  count: number;
  tone?: "default" | "urgent";
}) {
  return (
    <li>
      <Link
        href={href}
        className={`flex min-h-12 items-center justify-between gap-3 rounded-lg border px-4 py-3 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
          tone === "urgent"
            ? "border-alta-200 bg-alta-50 text-alta-800 hover:bg-alta-100"
            : "border-border-subtle bg-surface-raised text-ink-800 hover:bg-ink-50"
        }`}
      >
        <span className="font-medium">{label}</span>
        <span className="font-mono text-xs tabular-nums">{count}</span>
      </Link>
    </li>
  );
}

const kindLabel: Record<string, string> = {
  event: "Event",
  meeting: "Meeting",
  puja: "Puja",
  membership: "Membership",
};

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await requirePermission(Permissions.DASHBOARD_VIEW);
  const params = await searchParams;
  const data = await loadAdminDashboard(session.user.id);

  return (
    <>
      <AdminPageHeader
        title="Operations"
        description="Queues, deadlines, and shortcuts for day-to-day club administration."
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

        <p className="text-sm text-ink-600">
          {data.context.activeMembers} active members · Collected{" "}
          {data.context.paymentCollectionLabel}
          {data.context.outstandingDuesCount > 0
            ? ` · ${data.context.outstandingDuesCount} open invoice(s) (${data.context.outstandingDuesLabel})`
            : ""}
        </p>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <DashboardPanel
            title="Requires attention"
            description="Actionable queues — open a list to continue the workflow"
          >
            {data.attention.length === 0 ? (
              <p className="text-sm text-ink-500">
                Nothing waiting right now. Approvals, reconciliation, and
                memberships look clear.
              </p>
            ) : (
              <ul className="space-y-2">
                {data.attention.map((item) => (
                  <AttentionLink key={item.href + item.label} {...item} />
                ))}
              </ul>
            )}
          </DashboardPanel>

          <DashboardPanel
            title="Quick actions"
            description="Common operational tasks"
          >
            <ul className="grid gap-2 sm:grid-cols-2">
              {data.quickActions.map((action) => (
                <li key={action.href}>
                  <Link
                    href={action.href}
                    className="flex min-h-14 flex-col justify-center rounded-lg border border-border-subtle bg-surface-raised px-4 py-3 transition-colors hover:bg-ink-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span className="text-sm font-medium text-ink-900">
                      {action.label}
                    </span>
                    <span className="text-xs text-ink-500">
                      {action.description}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </DashboardPanel>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <DashboardPanel
            title="Upcoming"
            description="Events, meetings, Saraswati Puja milestones, and membership deadlines"
          >
            {data.upcoming.length === 0 ? (
              <p className="text-sm text-ink-500">
                No upcoming operational dates in the next 90 days.
              </p>
            ) : (
              <ul className="divide-y divide-border-subtle text-sm">
                {data.upcoming.map((item) => (
                  <li key={item.id} className="flex items-start justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="text-[11px] font-medium uppercase tracking-wide text-ink-400">
                        {kindLabel[item.kind] ?? item.kind}
                      </p>
                      <Link
                        href={item.href}
                        className="font-medium text-ink-900 underline-offset-4 hover:underline"
                      >
                        {item.title}
                      </Link>
                      <p className="text-ink-500">{item.subtitle}</p>
                    </div>
                    <time
                      dateTime={item.at}
                      className="shrink-0 font-mono text-xs text-ink-400"
                    >
                      {new Date(item.at).toLocaleString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </time>
                  </li>
                ))}
              </ul>
            )}
          </DashboardPanel>

          <DashboardPanel
            title="Recent activity"
            description="Actual audit events from the system"
          >
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
              className="mt-4 inline-flex min-h-11 items-center text-sm font-medium text-ink-800 underline-offset-4 hover:underline"
            >
              View audit logs
            </Link>
          </DashboardPanel>
        </div>
      </div>
    </>
  );
}
