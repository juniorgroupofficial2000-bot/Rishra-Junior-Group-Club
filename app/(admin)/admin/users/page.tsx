import { AdminSectionPage } from "@/components/admin/admin-section-page";
import { Badge } from "@/components/ui/badge";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { Permissions } from "@/server/domain/permissions";
import { requirePermission } from "@/server/auth/session";
import { listAdminUsers } from "@/server/services/admin-catalog-service";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Users",
  robots: { index: false, follow: false },
};

export default async function AdminUsersPage() {
  await requirePermission(Permissions.USERS_READ, "/admin/users");
  const users = await listAdminUsers();

  return (
    <AdminSectionPage
      title="Users"
      description="Authentication identities and assigned staff roles."
      isEmpty={users.length === 0}
      emptyTitle="No users"
      emptyDescription="Seed or create users to manage portal access."
    >
      <Table>
        <THead>
          <TR>
            <TH>User</TH>
            <TH>Role</TH>
            <TH>Active</TH>
            <TH>Linked member</TH>
            <TH>Created</TH>
          </TR>
        </THead>
        <TBody>
          {users.map((user) => (
            <TR key={user.id}>
              <TD>
                <p className="font-medium">{user.name}</p>
                <p className="text-xs text-ink-500">{user.email}</p>
              </TD>
              <TD>
                <Badge variant="outline">{user.roleLabel}</Badge>
              </TD>
              <TD>{user.active ? "Yes" : "No"}</TD>
              <TD>
                {user.memberId ? (
                  <Link
                    href={`/admin/members/${user.memberId}`}
                    className="font-mono text-xs underline-offset-4 hover:underline"
                  >
                    {user.membershipNumber}
                  </Link>
                ) : (
                  "—"
                )}
              </TD>
              <TD>{user.createdAt.slice(0, 10)}</TD>
            </TR>
          ))}
        </TBody>
      </Table>
    </AdminSectionPage>
  );
}
