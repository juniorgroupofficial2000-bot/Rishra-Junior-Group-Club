import { EnvironmentInfoPanel } from "@/components/admin/environment-info-panel";
import { StaffMfaSetup } from "@/components/admin/staff-mfa-setup";
import { AdminSectionPage } from "@/components/admin/admin-section-page";
import { Badge } from "@/components/ui/badge";
import { isStaffMfaRequiredByConfig } from "@/server/auth/mfa/policy";
import { hasPermission, Permissions } from "@/server/domain/permissions";
import { getAdminRuntimeDiagnostics } from "@/server/ops/runtime-diagnostics";
import { getRepositoryDriver } from "@/server/repositories";
import { getStaffMfaStatus } from "@/server/services/staff-mfa-service";
import { requirePermission } from "@/server/auth/session";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin settings",
  robots: { index: false, follow: false },
};

export default async function AdminSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ mfa?: string }>;
}) {
  const session = await requirePermission(
    Permissions.SETTINGS_READ,
    "/admin/settings",
  );
  const params = await searchParams;
  const canWrite = hasPermission(session.user.role, Permissions.SETTINGS_WRITE);
  const driver = getRepositoryDriver();
  const mfa = await getStaffMfaStatus(session.user.id);
  const mfaForced = isStaffMfaRequiredByConfig() || params.mfa === "1";
  const diagnostics = getAdminRuntimeDiagnostics();

  return (
    <AdminSectionPage
      title="Settings"
      description="Environment and portal configuration (read-mostly)."
    >
      <div className="space-y-6">
        <StaffMfaSetup enabled={mfa.enabled} forced={mfaForced && !mfa.enabled} />

        <EnvironmentInfoPanel info={diagnostics} />

        {!diagnostics.isProduction && canWrite ? (
          <p className="text-sm text-ink-600">
            Need SAMPLE fixtures?{" "}
            <Link
              href="/admin/developer"
              className="font-medium text-ink-900 underline-offset-2 hover:underline"
            >
              Open developer utilities
            </Link>
            .
          </p>
        ) : null}

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
          <div>
            <dt className="text-sm text-ink-500">Staff MFA policy</dt>
            <dd className="mt-1 font-medium text-ink-900">
              {isStaffMfaRequiredByConfig() ? "Required" : "Optional until live payments"}
            </dd>
          </div>
        </dl>
        <p className="text-sm text-ink-600">
          Mutable production settings (secrets, payment credentials) are never
          edited from the browser. Configure them via secure environment variables.
        </p>
      </div>
    </AdminSectionPage>
  );
}
