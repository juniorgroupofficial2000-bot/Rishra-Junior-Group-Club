import { AdminSectionPage } from "@/components/admin/admin-section-page";
import { Badge } from "@/components/ui/badge";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { Permissions } from "@/server/domain/permissions";
import { requirePermission } from "@/server/auth/session";
import { listAdminCommittee } from "@/server/services/admin-catalog-service";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Committee",
  robots: { index: false, follow: false },
};

export default async function AdminCommitteePage() {
  await requirePermission(Permissions.COMMITTEE_READ, "/admin/committee");
  const positions = await listAdminCommittee();

  return (
    <AdminSectionPage
      title="Committee"
      description="Current committee positions and assignments."
      isEmpty={positions.length === 0}
      emptyTitle="No committee positions"
      emptyDescription="Committee positions will appear here once configured."
    >
      <div className="space-y-6">
        {positions.map((position) => (
          <section
            key={position.id}
            className="rounded-xl border border-border-subtle bg-surface-raised p-5 shadow-xs"
          >
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="font-display text-lg font-semibold text-ink-900">
                {position.title}
              </h2>
              <Badge variant="outline">{position.code}</Badge>
              {!position.active ? (
                <Badge variant="neutral">Inactive</Badge>
              ) : null}
            </div>
            {position.assignments.length === 0 ? (
              <p className="mt-3 text-sm text-ink-500">No current assignment.</p>
            ) : (
              <Table className="mt-4 min-w-0">
                <THead>
                  <TR>
                    <TH>Member</TH>
                    <TH>Number</TH>
                    <TH>Status</TH>
                    <TH>Since</TH>
                  </TR>
                </THead>
                <TBody>
                  {position.assignments.map((assignment) => (
                    <TR key={assignment.id}>
                      <TD>
                        <Link
                          href={`/admin/members/${assignment.memberId}`}
                          className="font-medium underline-offset-4 hover:underline"
                        >
                          {assignment.memberName}
                        </Link>
                      </TD>
                      <TD className="font-mono text-xs">
                        {assignment.membershipNumber}
                      </TD>
                      <TD>{assignment.memberStatus}</TD>
                      <TD>{assignment.startsOn}</TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            )}
          </section>
        ))}
      </div>
    </AdminSectionPage>
  );
}
