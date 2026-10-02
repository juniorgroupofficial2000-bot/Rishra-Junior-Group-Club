import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { MemberFilters } from "@/components/admin/member-filters";
import { Badge } from "@/components/ui/badge";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { Permissions } from "@/server/domain/permissions";
import { requirePermission } from "@/server/auth/session";
import { searchMembers } from "@/server/services/member-admin-service";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Members",
  robots: { index: false, follow: false },
};

export default async function AdminMembersPage({
  searchParams,
}: {
  searchParams: Promise<{
    query?: string;
    status?: string;
    page?: string;
    deleted?: string;
  }>;
}) {
  await requirePermission(Permissions.MEMBERS_READ, "/admin/members");
  const params = await searchParams;
  const page = Number(params.page ?? "1") || 1;

  const result = await searchMembers({
    query: params.query,
    status: params.status || undefined,
    page,
    pageSize: 20,
  });

  const totalPages = Math.max(1, Math.ceil(result.total / result.pageSize));

  return (
    <>
      <AdminPageHeader
        title="Members"
        description="Search, filter, and manage membership records."
      />
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        {params.deleted ? (
          <p
            role="status"
            className="rounded-md border border-border-subtle bg-surface-muted px-4 py-3 text-sm text-ink-700"
          >
            Member was soft-deleted and recorded in the audit log.
          </p>
        ) : null}

        <MemberFilters query={params.query} status={params.status} />

        <p className="text-sm text-ink-500">
          {result.total} member{result.total === 1 ? "" : "s"} found
        </p>

        <Table>
          <THead>
            <TR>
              <TH>Member</TH>
              <TH>Number</TH>
              <TH>Status</TH>
              <TH>Plan</TH>
              <TH>Joined</TH>
            </TR>
          </THead>
          <TBody>
            {result.items.length === 0 ? (
              <TR>
                <TD colSpan={5} className="text-ink-500">
                  No members match these filters.
                </TD>
              </TR>
            ) : (
              result.items.map((member) => (
                <TR key={member.id}>
                  <TD>
                    <Link
                      href={`/admin/members/${member.id}`}
                      className="font-medium text-ink-900 underline-offset-4 hover:underline"
                    >
                      {member.displayName}
                    </Link>
                    <p className="text-xs text-ink-500">{member.email}</p>
                  </TD>
                  <TD className="font-mono text-xs">{member.membershipNumber}</TD>
                  <TD>
                    <Badge variant="outline">{member.status}</Badge>
                    {member.isSample ? (
                      <span className="ml-2 text-xs text-ink-400">SAMPLE</span>
                    ) : null}
                  </TD>
                  <TD>{member.currentPlanLabel ?? "—"}</TD>
                  <TD>
                    {member.joinedOn
                      ? member.joinedOn.toISOString().slice(0, 10)
                      : "—"}
                  </TD>
                </TR>
              ))
            )}
          </TBody>
        </Table>

        {totalPages > 1 ? (
          <div className="flex items-center justify-between gap-3 text-sm">
            <p className="text-ink-500">
              Page {result.page} of {totalPages}
            </p>
            <div className="flex gap-2">
              {result.page > 1 ? (
                <Link
                  href={`/admin/members?${new URLSearchParams({
                    ...(params.query ? { query: params.query } : {}),
                    ...(params.status ? { status: params.status } : {}),
                    page: String(result.page - 1),
                  }).toString()}`}
                  className="rounded-md border border-border-default px-3 py-2 hover:bg-ink-50"
                >
                  Previous
                </Link>
              ) : null}
              {result.page < totalPages ? (
                <Link
                  href={`/admin/members?${new URLSearchParams({
                    ...(params.query ? { query: params.query } : {}),
                    ...(params.status ? { status: params.status } : {}),
                    page: String(result.page + 1),
                  }).toString()}`}
                  className="rounded-md border border-border-default px-3 py-2 hover:bg-ink-50"
                >
                  Next
                </Link>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
}
