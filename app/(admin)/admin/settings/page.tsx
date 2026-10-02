import { AdminSectionPage } from "@/components/admin/admin-section-page";
import { Badge } from "@/components/ui/badge";
import { hasPermission, Permissions } from "@/server/domain/permissions";
import { getRepositoryDriver } from "@/server/repositories";
import { requirePermission } from "@/server/auth/session";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin settings",
  robots: { index: false, follow: false },
};

export default async function AdminSettingsPage() {
  const session = await requirePermission(
    Permissions.SETTINGS_READ,
    "/admin/settings",
  );
  const canWrite = hasPermission(session.user.role, Permissions.SETTINGS_WRITE);
  const driver = getRepositoryDriver();

  return (
    <AdminSectionPage
      title="Settings"
      description="Environment and portal configuration (read-mostly)."
    >
      <dl className="grid gap-4 rounded-xl border border-border-subtle bg-surface-raised p-5 shadow-xs sm:grid-cols-2">
        <div>
          <dt className="text-sm text-ink-500">Repository driver</dt>
          <dd className="mt-1">
            <Badge variant="outline">{driver}</Badge>
          </dd>
        </div>
        <div>
          <dt className="text-sm text-ink-500">Your role</dt>
          <dd className="mt-1 font-medium text-ink-900">{session.user.role}</dd>
        </div>
        <div>
          <dt className="text-sm text-ink-500">Settings write access</dt>
          <dd className="mt-1 font-medium text-ink-900">
            {canWrite ? "Allowed" : "Read only"}
          </dd>
        </div>
        <div>
          <dt className="text-sm text-ink-500">Auth session</dt>
          <dd className="mt-1 font-medium text-ink-900">JWT · 8 hour max age</dd>
        </div>
      </dl>
      <p className="text-sm text-ink-600">
        Mutable production settings (secrets, payment credentials) are never
        edited from the browser. Configure them via secure environment variables.
      </p>
    </AdminSectionPage>
  );
}
