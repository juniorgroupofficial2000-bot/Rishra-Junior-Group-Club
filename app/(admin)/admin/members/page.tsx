import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { AdminStatusBanner } from "@/components/admin/admin-status-banner";
import { MemberFilters } from "@/components/admin/member-filters";
import { MembersOpsTable } from "@/components/admin/member-bulk-toolbar";
import { parsePage } from "@/lib/admin/list-params";
import { memberStatusLabel } from "@/server/domain/member-lifecycle";
import {
  hasPermission,
  Permissions,
} from "@/server/domain/permissions";
import { requirePermission } from "@/server/auth/session";
import { searchMembers } from "@/server/services/member-admin-service";
import type { MemberStatusInput } from "@/server/validation/member";
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
    planId?: string;
    committeeRole?: string;
    joinedFrom?: string;
    joinedTo?: string;
    sortBy?: string;
    sortDir?: string;
    page?: string;
    deleted?: string;
    error?: string;
  }>;
}) {
  const session = await requirePermission(
    Permissions.MEMBERS_READ,
    "/admin/members",
  );
  const params = await searchParams;
  const page = parsePage(params.page);
  const canExport = hasPermission(session.user.role, Permissions.MEMBERS_EXPORT);

  let result;
  let loadError: string | null = null;
  try {
    result = await searchMembers({
      query: params.query,
      status: params.status || undefined,
      planId: params.planId || undefined,
      committeeRole: params.committeeRole || undefined,
      joinedFrom: params.joinedFrom || undefined,
      joinedTo: params.joinedTo || undefined,
      sortBy: params.sortBy || undefined,
      sortDir: params.sortDir || undefined,
      page,
      pageSize: 20,
    });
  } catch (error) {
    loadError =
      error instanceof Error ? error.message : "Could not load members.";
    result = { items: [], total: 0, page: 1, pageSize: 20 };
  }

  const exportParams = new URLSearchParams();
  if (params.query) exportParams.set("query", params.query);
  if (params.status) exportParams.set("status", params.status);
  if (params.planId) exportParams.set("planId", params.planId);
  if (params.committeeRole)
    exportParams.set("committeeRole", params.committeeRole);
  if (params.joinedFrom) exportParams.set("joinedFrom", params.joinedFrom);
  if (params.joinedTo) exportParams.set("joinedTo", params.joinedTo);
  if (params.sortBy) exportParams.set("sortBy", params.sortBy);
  if (params.sortDir) exportParams.set("sortDir", params.sortDir);
  const exportHref = `/api/admin/export/members${
    exportParams.size > 0 ? `?${exportParams.toString()}` : ""
  }`;

  return (
    <>
      <AdminPageHeader
        title="Members"
        description="Search, filter, approve, and manage the membership lifecycle."
        actions={
          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin/members?status=PENDING"
              className="inline-flex min-h-11 items-center rounded-md border border-border-default px-3 text-sm font-medium hover:bg-ink-50"
            >
              Pending review
            </Link>
            {canExport ? (
              <a
                href={exportHref}
                className="inline-flex min-h-11 items-center rounded-md bg-ink-900 px-3 text-sm font-medium text-white hover:bg-ink-800"
              >
                Export CSV
              </a>
            ) : null}
          </div>
        }
      />
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        {params.deleted ? (
          <AdminStatusBanner tone="success">
            Member was archived. Financial history is retained.
          </AdminStatusBanner>
        ) : null}
        {params.error || loadError ? (
          <AdminStatusBanner tone="error">
            {params.error || loadError}
          </AdminStatusBanner>
        ) : null}

        <MemberFilters
          query={params.query}
          status={params.status}
          planId={params.planId}
          committeeRole={params.committeeRole}
          joinedFrom={params.joinedFrom}
          joinedTo={params.joinedTo}
          sortBy={params.sortBy}
          sortDir={params.sortDir}
        />

        <MembersOpsTable
          canExport={canExport}
          exportHref={exportHref}
          members={result.items.map((member) => ({
            id: member.id,
            displayName: member.displayName,
            email: member.email,
            membershipNumber: member.membershipNumber,
            statusLabel: memberStatusLabel(member.status as MemberStatusInput),
            currentPlanLabel: member.currentPlanLabel,
            committeeRoleLabel: member.committeeRoleLabel,
            joinedOn: member.joinedOn
              ? member.joinedOn.toISOString().slice(0, 10)
              : null,
          }))}
        />

        <AdminPagination
          basePath="/admin/members"
          params={{
            query: params.query,
            status: params.status,
            planId: params.planId,
            committeeRole: params.committeeRole,
            joinedFrom: params.joinedFrom,
            joinedTo: params.joinedTo,
            sortBy: params.sortBy,
            sortDir: params.sortDir,
          }}
          page={result.page}
          pageSize={result.pageSize}
          total={result.total}
        />
      </div>
    </>
  );
}
