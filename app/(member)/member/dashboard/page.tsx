import {
  DashboardGrid,
  DashboardPanel,
  StatTile,
} from "@/components/club/dashboard";
import { Badge } from "@/components/ui/badge";
import { MemberPageHeader } from "@/components/member/member-page-header";
import { requireMemberId } from "@/server/auth/member-context";
import { isMockRepositoryDriver } from "@/server/repositories";
import { loadMemberDashboard } from "@/server/services/member-portal-service";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

const quickLinks = [
  { href: "/member/payments", label: "Payments" },
  { href: "/member/mandate", label: "Mandate" },
  { href: "/member/membership", label: "Membership" },
  { href: "/member/events", label: "Events" },
  { href: "/member/receipts", label: "Receipts" },
  { href: "/member/settings", label: "Settings" },
] as const;

function PanelLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="mt-4 inline-flex min-h-11 items-center text-sm font-medium text-ink-800 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {children}
    </Link>
  );
}

export default async function MemberDashboardPage() {
  const { userId } = await requireMemberId();
  const dashboard = await loadMemberDashboard(userId);
  if (!dashboard) notFound();

  const actionItems: Array<{ href: string; label: string; detail: string }> = [];

  if (dashboard.profile.status === "pending") {
    actionItems.push({
      href: "/member/membership",
      label: "Membership pending approval",
      detail: "The committee is reviewing your membership.",
    });
  }
  if (dashboard.profile.status === "suspended") {
    actionItems.push({
      href: "/contact",
      label: "Membership suspended",
      detail: "Contact the club for help restoring access.",
    });
  }
  if (dashboard.nextPaymentOn) {
    actionItems.push({
      href: "/member/payments",
      label: "Payment due",
      detail: `Next scheduled payment: ${dashboard.nextPaymentOn}`,
    });
  }
  if (
    dashboard.mandate.status !== "active" &&
    dashboard.mandate.status !== "pending"
  ) {
    actionItems.push({
      href: "/member/mandate",
      label: "Set up recurring mandate",
      detail: "Optional — enables automatic dues collection when available.",
    });
  }
  if (dashboard.upcomingEvents[0]) {
    actionItems.push({
      href: "/member/events",
      label: "Next event",
      detail: `${dashboard.upcomingEvents[0].title} · ${dashboard.upcomingEvents[0].startsAt}`,
    });
  }

  return (
    <>
      <MemberPageHeader
        title={`Hello, ${dashboard.profile.displayName}`}
        description="Your membership status, dues, and club activity."
      />
      <div className="space-y-6 p-4 pb-24 sm:space-y-8 sm:p-6 lg:p-8 lg:pb-8">
        {isMockRepositoryDriver() ? (
          <p className="rounded-md border border-dashed border-border-strong bg-surface-muted px-4 py-3 text-xs text-ink-500 sm:text-sm">
            Showing MOCK repository data. No live payment provider is connected.
          </p>
        ) : null}

        {actionItems.length > 0 ? (
          <section
            aria-labelledby="member-actions-heading"
            className="rounded-xl border border-border-subtle bg-surface-raised p-5 shadow-xs"
          >
            <h2
              id="member-actions-heading"
              className="font-display text-lg font-semibold text-ink-900"
            >
              What you need to know
            </h2>
            <ul className="mt-4 space-y-2">
              {actionItems.map((item) => (
                <li key={item.href + item.label}>
                  <Link
                    href={item.href}
                    className="flex min-h-12 flex-col justify-center rounded-lg border border-border-subtle px-4 py-3 transition-colors hover:bg-ink-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span className="text-sm font-medium text-ink-900">
                      {item.label}
                    </span>
                    <span className="text-xs text-ink-500">{item.detail}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <nav aria-label="Quick links" className="md:hidden">
          <ul className="grid grid-cols-2 gap-2">
            {quickLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="flex min-h-12 items-center justify-center rounded-xl border border-border-subtle bg-surface-raised px-3 text-center text-sm font-medium text-ink-800 shadow-xs transition-colors hover:bg-ink-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <DashboardGrid>
          <StatTile
            label="Member status"
            value={dashboard.profile.status}
            hint={dashboard.profile.membershipNumber}
          />
          <StatTile
            label="Current dues"
            value={dashboard.currentDuesLabel}
            hint={
              dashboard.currentDuesLabel === "—"
                ? "No dues on file"
                : "From your membership plan"
            }
          />
          <StatTile
            label="Next payment"
            value={dashboard.nextPaymentOn ?? "—"}
            hint={
              dashboard.nextPaymentOn
                ? "Scheduled due date"
                : "No payment scheduled"
            }
          />
          <StatTile
            label="Mandate"
            value={dashboard.mandate.status.replaceAll("_", " ")}
            hint={dashboard.mandate.providerLabel}
          />
        </DashboardGrid>

        <div className="grid gap-6 lg:grid-cols-2">
          <DashboardPanel title="Membership" description="Plan summary">
            <dl className="space-y-3 text-sm">
              <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:gap-4">
                <dt className="text-ink-500">Plan</dt>
                <dd className="font-medium text-ink-900">
                  {dashboard.membership.planLabel}
                </dd>
              </div>
              <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:gap-4">
                <dt className="text-ink-500">Cycle</dt>
                <dd className="font-medium text-ink-900">
                  {dashboard.membership.billingCycleLabel}
                </dd>
              </div>
              <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:gap-4">
                <dt className="text-ink-500">Joined</dt>
                <dd className="font-medium text-ink-900">
                  {dashboard.profile.joinedOn}
                </dd>
              </div>
            </dl>
            <PanelLink href="/member/membership">View membership</PanelLink>
          </DashboardPanel>

          <DashboardPanel
            title="Mandate status"
            description="Recurring payment authority"
          >
            <p className="text-sm leading-relaxed text-ink-600">
              {dashboard.mandate.note}
            </p>
            <Badge className="mt-4" variant="outline">
              {dashboard.mandate.status}
            </Badge>
            <div>
              <PanelLink href="/member/mandate">Mandate details</PanelLink>
            </div>
          </DashboardPanel>
        </div>

        <DashboardPanel
          title="Recent payments"
          description="History of verified payments"
        >
          <ul className="divide-y divide-border-subtle">
            {dashboard.recentPayments.length === 0 ? (
              <li className="py-3 text-sm text-ink-500">
                Your payment history will appear here after your first payment.
              </li>
            ) : (
              dashboard.recentPayments.map((payment) => (
                <li
                  key={payment.id}
                  className="flex flex-col gap-2 py-3 text-sm sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-ink-900">
                      {payment.amountLabel}
                    </p>
                    <p className="text-ink-500">
                      {payment.methodLabel}
                      {payment.isSample ? " · SAMPLE" : ""}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 sm:flex-col sm:items-end sm:gap-1">
                    <Badge variant="outline">
                      {payment.status.replaceAll("_", " ")}
                    </Badge>
                    <p className="font-mono text-xs text-ink-500">
                      {payment.paidOn ?? "—"}
                    </p>
                  </div>
                </li>
              ))
            )}
          </ul>
          <PanelLink href="/member/payments">All payments</PanelLink>
        </DashboardPanel>

        <div className="grid gap-6 lg:grid-cols-2">
          <DashboardPanel title="Upcoming events">
            <ul className="space-y-3 text-sm">
              {dashboard.upcomingEvents.length === 0 ? (
                <li className="text-ink-500">
                  No upcoming events yet. Check back when the committee
                  publishes the calendar.
                </li>
              ) : (
                dashboard.upcomingEvents.map((event) => (
                  <li key={event.id}>
                    <Link
                      href="/member/events"
                      className="inline-flex min-h-11 items-center font-medium text-ink-900 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {event.title}
                    </Link>
                    <p className="text-ink-500">
                      {event.startsAt} · {event.venueLabel}
                    </p>
                  </li>
                ))
              )}
            </ul>
            <PanelLink href="/member/events">Register for events</PanelLink>
          </DashboardPanel>
          <DashboardPanel title="Announcements">
            <ul className="space-y-3 text-sm">
              {dashboard.announcements.length === 0 ? (
                <li className="text-ink-500">No announcements yet.</li>
              ) : (
                dashboard.announcements.map((item) => (
                  <li key={item.id}>
                    <Link
                      href={item.href}
                      className="inline-flex min-h-11 items-center font-medium text-ink-900 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {item.title}
                    </Link>
                    <p className="text-ink-500">{item.publishedAt}</p>
                  </li>
                ))
              )}
            </ul>
          </DashboardPanel>
        </div>
      </div>
    </>
  );
}
