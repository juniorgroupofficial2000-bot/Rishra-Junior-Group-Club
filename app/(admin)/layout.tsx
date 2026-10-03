import { AdminShell } from "@/components/admin/admin-shell";
import { EnvironmentRibbon } from "@/components/env/environment-badge";
import { ToastProvider } from "@/components/ui/toast";
import {
  allowsDeveloperUtilities,
  environmentBadgeLabel,
} from "@/config/app-env";
import { getPublicEnv } from "@/config/public";
import { adminNav } from "@/content/admin-nav";
import { siteConfig } from "@/content/site";
import { privatePageMetadata } from "@/lib/seo/metadata";
import { hasPermission, Permissions } from "@/server/domain/permissions";
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
  const { appEnv, appName } = getPublicEnv();
  const envLabel = environmentBadgeLabel(appEnv);
  const navItems = adminNav.filter((item) => {
    if (item.href === "/admin/developer") {
      return (
        allowsDeveloperUtilities(appEnv) &&
        hasPermission(session.user.role, Permissions.SETTINGS_WRITE)
      );
    }
    return hasPermission(session.user.role, item.permission);
  });

  return (
    <ToastProvider>
      <EnvironmentRibbon
        appEnv={appEnv}
        brandName={(appName || siteConfig.name).toUpperCase()}
      />
      <AdminShell
        userName={session.user.name ?? session.user.email ?? "Admin"}
        roleLabel={formatRoleLabel(session.user.role)}
        navItems={navItems}
        environmentLabel={envLabel}
        brandName={appName || siteConfig.name}
      >
        {children}
      </AdminShell>
    </ToastProvider>
  );
}
