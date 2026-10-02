import { EmptyPanel } from "@/components/member/empty-panel";
import { MemberPageHeader } from "@/components/member/member-page-header";
import { requireMemberId } from "@/server/auth/member-context";
import { loadReceipts } from "@/server/services/member-portal-service";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Receipts",
  robots: { index: false, follow: false },
};

export default async function MemberReceiptsPage() {
  const { memberId } = await requireMemberId();
  const receipts = await loadReceipts(memberId);

  return (
    <>
      <MemberPageHeader
        title="Receipts"
        description="Issued receipts for verified/recorded payments."
      />
      <div className="p-4 sm:p-6 lg:p-8">
        {receipts.length === 0 ? (
          <EmptyPanel
            title="No receipts yet"
            body="Receipts appear after payments are verified and recorded by the club."
          />
        ) : (
          <ul className="divide-y divide-border-subtle rounded-xl border border-border-subtle bg-surface-raised shadow-xs">
            {receipts.map((receipt) => (
              <li
                key={receipt.id}
                className="flex flex-col gap-1 px-5 py-4 text-sm sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-mono font-medium text-ink-900">
                    {receipt.receiptNumber}
                  </p>
                  <p className="text-ink-500">
                    {receipt.amountLabel}
                    {receipt.isSample ? " · SAMPLE" : ""}
                  </p>
                </div>
                <p className="font-mono text-ink-500">{receipt.paidOn ?? "—"}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
