import { adminCreateUserAction } from "@/app/(admin)/actions/users";
import { AdminEmptyRow } from "@/components/admin/admin-empty-row";
import { AdminFilterBar } from "@/components/admin/admin-filter-bar";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { AdminStatusBanner } from "@/components/admin/admin-status-banner";
import { UserRoleForm } from "@/components/admin/user-role-form";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { PendingSubmitButton } from "@/components/ui/pending-submit-button";
import {
  EmptyRecords,
  RecordCard,
  ResponsiveRecords,
} from "@/components/ui/record-card";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { parsePage } from "@/lib/admin/list-params";
import { requirePermission } from "@/server/auth/session";
import { Permissions, hasPermission } from "@/server/domain/permissions";
import { searchAdminUsers } from "@/server/services/admin-list-service";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin users",
  robots: { index: false, follow: false },
};

const staffRoles = [
  "SUPER_ADMIN",
  "PRESIDENT",
  "SECRETARY",
  "TREASURER",
  "VICE_PRESIDENT",
  "COMMITTEE_MEMBER",
  "CONTENT_MANAGER",
  "EVENT_MANAGER",
] as const;

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{
    query?: string;
    role?: string;
    active?: string;
    page?: string;
    error?: string;
    created?: string;
    updated?: string;
  }>;
}) {
  const session = await requirePermission(Permissions.USERS_READ, "/admin/users");
  const params = await searchParams;
  const page = parsePage(params.page);
  const canWrite = hasPermission(session.user.role, Permissions.USERS_WRITE);

  let result;
  let loadError: string | null = null;
  try {
    result = await searchAdminUsers({
      query: params.query,
      role: params.role || undefined,
      active: params.active || undefined,
      page,
      pageSize: 20,
    });
  } catch (error) {
    loadError =
      error instanceof Error ? error.message : "Could not load users.";
    result = { items: [], total: 0, page: 1, pageSize: 20 };
  }

  return (
    <>
      <AdminPageHeader
        title="Admin users"
        description="Staff identities and roles. Creating users requires USERS_WRITE (SUPER_ADMIN service gate)."
      />
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        {params.error || loadError ? (
          <AdminStatusBanner tone="error">
            {params.error || loadError}
          </AdminStatusBanner>
        ) : null}
        {params.created ? (
          <AdminStatusBanner tone="success">
            Staff user created. Share the temporary password out-of-band.
          </AdminStatusBanner>
        ) : null}
        {params.updated ? (
          <AdminStatusBanner tone="success">Role updated.</AdminStatusBanner>
        ) : null}

        <AdminFilterBar
          fields={[
            {
              type: "text",
              name: "query",
              label: "Search",
              defaultValue: params.query,
              placeholder: "Name or email…",
            },
            {
              type: "select",
              name: "role",
              label: "Role",
              defaultValue: params.role,
              options: [
                { value: "", label: "All roles" },
                ...staffRoles.map((value) => ({ value, label: value })),
                { value: "MEMBER", label: "MEMBER" },
              ],
            },
            {
              type: "select",
              name: "active",
              label: "Active",
              defaultValue: params.active,
              options: [
                { value: "", label: "Any" },
                { value: "true", label: "Active" },
                { value: "false", label: "Inactive" },
              ],
            },
          ]}
        />

        {canWrite ? (
          <form
            action={adminCreateUserAction}
            className="grid gap-3 rounded-xl border border-border-subtle bg-surface-raised p-4 shadow-xs sm:grid-cols-2 lg:grid-cols-4"
          >
            <Input id="new-name" name="name" label="Name" required />
            <Input
              id="new-email"
              name="email"
              type="email"
              label="Email"
              required
            />
            <div className="flex flex-col gap-1.5">
              <label htmlFor="new-role" className="text-sm font-medium">
                Role
              </label>
              <select
                id="new-role"
                name="role"
                required
                className="h-11 rounded-md border border-border-default bg-surface-raised px-3 text-sm"
                defaultValue="COMMITTEE_MEMBER"
              >
                {staffRoles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>
            <Input
              id="new-password"
              name="temporaryPassword"
              type="password"
              label="Temporary password"
              required
              hint="Min 10 characters. Not stored in audit logs."
            />
            <div className="flex items-end sm:col-span-2 lg:col-span-4">
              <PendingSubmitButton pendingLabel="Creating…">
                Create staff user
              </PendingSubmitButton>
            </div>
          </form>
        ) : null}

        <ResponsiveRecords
          mobile={
            result.items.length === 0 ? (
              <EmptyRecords message="No records match these filters." />
            ) : (
              result.items.map((user) => (
                <RecordCard
                  key={user.id}
                  title={user.name}
                  subtitle={user.email}
                  badge={<Badge variant="outline">{user.roleLabel}</Badge>}
                  fields={[
                    { label: "Active", value: user.active ? "Yes" : "No" },
                    {
                      label: "Member link",
                      value: (
                        <span className="font-mono text-xs">
                          {user.membershipNumber ?? "—"}
                        </span>
                      ),
                    },
                    {
                      label: "Created",
                      value: user.createdAt.slice(0, 10),
                    },
                  ]}
                  actions={
                    canWrite && user.role !== "MEMBER" ? (
                      <UserRoleForm
                        userId={user.id}
                        currentRole={user.role}
                        userName={user.name}
                      />
                    ) : undefined
                  }
                />
              ))
            )
          }
          desktop={
            <Table>
              <THead>
                <TR>
                  <TH>User</TH>
                  <TH>Role</TH>
                  <TH>Active</TH>
                  <TH>Member link</TH>
                  <TH>Created</TH>
                  {canWrite ? <TH>Actions</TH> : null}
                </TR>
              </THead>
              <TBody>
                {result.items.length === 0 ? (
                  <AdminEmptyRow colSpan={canWrite ? 6 : 5} />
                ) : (
                  result.items.map((user) => (
                    <TR key={user.id}>
                      <TD>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-xs text-ink-500">{user.email}</p>
                      </TD>
                      <TD>
                        <Badge variant="outline">{user.roleLabel}</Badge>
                      </TD>
                      <TD>{user.active ? "Yes" : "No"}</TD>
                      <TD className="font-mono text-xs">
                        {user.membershipNumber ?? "—"}
                      </TD>
                      <TD className="text-xs">
                        {user.createdAt.slice(0, 10)}
                      </TD>
                      {canWrite ? (
                        <TD>
                          {user.role !== "MEMBER" ? (
                            <UserRoleForm
                              userId={user.id}
                              currentRole={user.role}
                              userName={user.name}
                            />
                          ) : (
                            <span className="text-xs text-ink-400">—</span>
                          )}
                        </TD>
                      ) : null}
                    </TR>
                  ))
                )}
              </TBody>
            </Table>
          }
        />

        <AdminPagination
          basePath="/admin/users"
          params={{
            query: params.query,
            role: params.role,
            active: params.active,
          }}
          page={result.page}
          pageSize={result.pageSize}
          total={result.total}
        />
      </div>
    </>
  );
}
