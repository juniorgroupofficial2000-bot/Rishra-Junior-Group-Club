import { Badge } from "@/components/ui/badge";
import { MemberPageHeader } from "@/components/member/member-page-header";
import { requireMemberId } from "@/server/auth/member-context";
import { loadMandate } from "@/server/services/member-portal-service";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Mandate",
  robots: { index: false, follow: false },
};

export default async function MemberMandatePage() {
  const { memberId } = await requireMemberId();
  const mandate = await loadMandate(memberId);
  if (!mandate) notFound();

  return (
    <>
      <MemberPageHeader
        title="E-mandate"
        description="Recurring payment authority status. Setup is disabled until a payment provider is integrated."
      />
      <div className="space-y-4 p-4 sm:p-6 lg:p-8">
        <div className="max-w-xl rounded-xl border border-border-subtle bg-surface-raised p-5 shadow-xs">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">{mandate.status.replaceAll("_", " ")}</Badge>
            <span className="text-sm text-ink-500">{mandate.providerLabel}</span>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-ink-600">{mandate.note}</p>
          <p className="mt-3 text-xs text-ink-400">
            Last updated: {mandate.lastUpdatedOn ?? "—"}
          </p>
        </div>
        <p className="max-w-xl text-sm text-ink-500">
          No mandate creation or bank authorization is performed in this build.
          When enabled, setup will use the payment provider abstraction with
          verified webhooks.
        </p>
      </div>
    </>
  );
}
