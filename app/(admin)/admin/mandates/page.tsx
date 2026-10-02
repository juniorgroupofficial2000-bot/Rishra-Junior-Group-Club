import { AdminSectionPage } from "@/components/admin/admin-section-page";
import { Badge } from "@/components/ui/badge";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { Permissions } from "@/server/domain/permissions";
import { requirePermission } from "@/server/auth/session";
import { formatAmountLabel } from "@/server/repositories/prisma/mappers";
import { listAdminMandates } from "@/server/services/admin-catalog-service";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Mandates",
  robots: { index: false, follow: false },
};

const filters = [
  { href: "/admin/mandates", label: "All" },
  { href: "/admin/mandates?status=ALL_ACTIVE", label: "Active" },
  { href: "/admin/mandates?status=ALL_FAILED", label: "Failed" },
  { href: "/admin/mandates?status=ALL_CANCELLED", label: "Cancelled" },
  { href: "/admin/mandates?status=PENDING", label: "Pending" },
] as const;

export default async function AdminMandatesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requirePermission(Permissions.MANDATES_READ, "/admin/mandates");
  const params = await searchParams;
  const status = params.status as
    | "PENDING"
    | "ALL_ACTIVE"
    | "ALL_FAILED"
    | "ALL_CANCELLED"
    | undefined;
  const mandates = await listAdminMandates({ status });

  return (
    <AdminSectionPage
      title="Mandates"
      description="Provider mandate references only — payment credentials are never stored."
      isEmpty={mandates.length === 0}
      emptyTitle="No mandates"
      emptyDescription="Mandate records appear when members start setup."
    >
      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <Link
            key={filter.href}
            href={filter.href}
            className="rounded-md border border-border-default px-3 py-2 text-sm hover:bg-ink-50"
          >
            {filter.label}
          </Link>
        ))}
      </div>
      <Table>
        <THead>
          <TR>
            <TH>Member</TH>
            <TH>Status</TH>
            <TH>Amount</TH>
            <TH>Next debit</TH>
            <TH>Provider</TH>
            <TH>Reference</TH>
          </TR>
        </THead>
        <TBody>
          {mandates.map((mandate) => (
            <TR key={mandate.id}>
              <TD>
                <Link
                  href={`/admin/members/${mandate.memberId}`}
                  className="font-medium underline-offset-4 hover:underline"
                >
                  {mandate.memberName}
                </Link>
                <p className="font-mono text-xs text-ink-500">
                  {mandate.membershipNumber}
                </p>
              </TD>
              <TD>
                <Badge variant="outline">{mandate.status}</Badge>
              </TD>
              <TD>
                {mandate.amountPaise != null
                  ? formatAmountLabel(mandate.amountPaise)
                  : "—"}
              </TD>
              <TD>
                {mandate.nextDebitAt
                  ? mandate.nextDebitAt.slice(0, 10)
                  : "—"}
              </TD>
              <TD>{mandate.provider ?? "—"}</TD>
              <TD className="font-mono text-xs">
                {mandate.providerMandateRef ?? "—"}
              </TD>
            </TR>
          ))}
        </TBody>
      </Table>
    </AdminSectionPage>
  );
}
