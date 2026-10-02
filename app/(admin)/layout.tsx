import { AdminShell } from "@/components/admin/admin-shell";
import { adminNav } from "@/content/admin-nav";
import { privatePageMetadata } from "@/lib/seo/metadata";
import { hasPermission } from "@/server/domain/permissions";
import { formatRoleLabel } from "@/server/domain/roles";
import { requireAdminSession } from "@/server/auth/session";
import type { ReactNode } from "react";

export const metadata = privatePageMetadata(
  "Admin portal",
  "Secure administration portal for Rishra Junior Group Club.",
);

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await requireAdminSession();
  const navItems = adminNav.filter((item) =>
    hasPermission(session.user.role, item.permission),
  );

  return (
    <AdminShell
      userName={session.user.name ?? session.user.email ?? "Admin"}
      roleLabel={formatRoleLabel(session.user.role)}
      navItems={navItems}
    >
      {children}
    </AdminShell>
  );
}
