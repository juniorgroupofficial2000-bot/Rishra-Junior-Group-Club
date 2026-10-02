import {
  DashboardGrid,
  DashboardPanel,
  StatTile,
} from "@/components/club/dashboard";
import { Badge } from "@/components/ui/badge";
import { MemberPageHeader } from "@/components/member/member-page-header";
import { requireMemberSession } from "@/server/auth/session";
import { isMockRepositoryDriver } from "@/server/repositories";
import { loadMemberDashboard } from "@/server/services/member-portal-service";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

export default async function MemberDashboardPage() {
  const session = await requireMemberSession();
  const dashboard = await loadMemberDashboard(session.user.id);
  if (!dashboard) notFound();

  return (
    <>
      <MemberPageHeader
        title="Dashboard"
        description="Overview of your membership, dues, and club activity."
      />
      <div className="space-y-8 p-4 sm:p-6 lg:p-8">
        {isMockRepositoryDriver() ? (
          <p className="rounded-md border border-dashed border-border-strong bg-surface-muted px-4 py-3 text-xs text-ink-500">
            Showing MOCK repository data. No live payment provider is connected.
          </p>
        ) : null}

        <DashboardGrid>
          <StatTile
            label="Member status"
            value={dashboard.profile.status}
            hint={dashboard.profile.membershipNumber}
          />
          <StatTile
            label="Current dues"
            value={dashboard.currentDuesLabel}
            hint="Amount labels are placeholders until billing is configured"
          />
          <StatTile
            label="Next payment"
            value={dashboard.nextPaymentOn ?? "—"}
            hint="Scheduled due date when available"
          />
          <StatTile
            label="Mandate"
            value={dashboard.mandate.status.replaceAll("_", " ")}
            hint={dashboard.mandate.providerLabel}
          />
        </DashboardGrid>

        <div className="grid gap-6 lg:grid-cols-2">
          <DashboardPanel title="Membership" description="Plan summary">
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-ink-500">Plan</dt>
                <dd className="font-medium text-ink-900">
                  {dashboard.membership.planLabel}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-ink-500">Cycle</dt>
                <dd className="font-medium text-ink-900">
                  {dashboard.membership.billingCycleLabel}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-ink-500">Joined</dt>
                <dd className="font-medium text-ink-900">
                  {dashboard.profile.joinedOn}
                </dd>
              </div>
            </dl>
            <Link
              href="/member/membership"
              className="mt-4 inline-flex text-sm font-medium text-ink-800 underline-offset-4 hover:underline"
            >
              View membership
            </Link>
          </DashboardPanel>

          <DashboardPanel
            title="Mandate status"
            description="Recurring payment authority"
          >
            <p className="text-sm text-ink-600">{dashboard.mandate.note}</p>
            <Badge className="mt-4" variant="outline">
              {dashboard.mandate.status}
            </Badge>
            <Link
              href="/member/mandate"
              className="mt-4 block text-sm font-medium text-ink-800 underline-offset-4 hover:underline"
            >
              Mandate details
            </Link>
          </DashboardPanel>
        </div>

        <DashboardPanel title="Recent payments" description="History only — not a live checkout">
          <ul className="divide-y divide-border-subtle">
            {dashboard.recentPayments.map((payment) => (
              <li
                key={payment.id}
                className="flex flex-col gap-1 py-3 text-sm sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium text-ink-900">{payment.amountLabel}</p>
                  <p className="text-ink-500">
                    {payment.methodLabel}
                    {payment.isSample ? " · SAMPLE" : ""}
                  </p>
                </div>
                <div className="text-ink-500 sm:text-right">
                  <p>{payment.status.replaceAll("_", " ")}</p>
                  <p className="font-mono text-xs">{payment.paidOn ?? "—"}</p>
                </div>
              </li>
            ))}
          </ul>
          <Link
            href="/member/payments"
            className="mt-2 inline-flex text-sm font-medium text-ink-800 underline-offset-4 hover:underline"
          >
            All payments
          </Link>
        </DashboardPanel>

        <div className="grid gap-6 lg:grid-cols-2">
          <DashboardPanel title="Upcoming events">
            <ul className="space-y-3 text-sm">
              {dashboard.upcomingEvents.map((event) => (
                <li key={event.id}>
                  <Link
                    href={event.href}
                    className="font-medium text-ink-900 underline-offset-4 hover:underline"
                  >
                    {event.title}
                  </Link>
                  <p className="text-ink-500">
                    {event.startsAt} · {event.venueLabel}
                  </p>
                </li>
              ))}
            </ul>
          </DashboardPanel>
          <DashboardPanel title="Announcements">
            <ul className="space-y-3 text-sm">
              {dashboard.announcements.map((item) => (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    className="font-medium text-ink-900 underline-offset-4 hover:underline"
                  >
                    {item.title}
                  </Link>
                  <p className="text-ink-500">{item.publishedAt}</p>
                </li>
              ))}
            </ul>
          </DashboardPanel>
        </div>
      </div>
    </>
  );
}
