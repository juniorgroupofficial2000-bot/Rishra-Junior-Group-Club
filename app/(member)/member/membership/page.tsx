import { MemberPageHeader } from "@/components/member/member-page-header";
import { requireMemberId } from "@/server/auth/member-context";
import { loadMembership } from "@/server/services/member-portal-service";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Membership",
  robots: { index: false, follow: false },
};

export default async function MemberMembershipPage() {
  const { memberId } = await requireMemberId();
  const membership = await loadMembership(memberId);
  if (!membership) notFound();

  return (
    <>
      <MemberPageHeader
        title="Membership"
        description="Plan and billing cycle information for your membership."
      />
      <div className="p-4 sm:p-6 lg:p-8">
        <dl className="max-w-xl space-y-4 rounded-xl border border-border-subtle bg-surface-raised p-5 text-sm shadow-xs">
          <div>
            <dt className="text-ink-500">Plan</dt>
            <dd className="mt-1 font-medium text-ink-900">{membership.planLabel}</dd>
          </div>
          <div>
            <dt className="text-ink-500">Status</dt>
            <dd className="mt-1 capitalize text-ink-900">{membership.status}</dd>
          </div>
          <div>
            <dt className="text-ink-500">Billing cycle</dt>
            <dd className="mt-1 text-ink-900">{membership.billingCycleLabel}</dd>
          </div>
          <div>
            <dt className="text-ink-500">Dues amount</dt>
            <dd className="mt-1 text-ink-900">{membership.duesAmountLabel}</dd>
          </div>
          <div>
            <dt className="text-ink-500">Next due</dt>
            <dd className="mt-1 text-ink-900">{membership.nextDueOn ?? "—"}</dd>
          </div>
        </dl>
      </div>
    </>
  );
}
