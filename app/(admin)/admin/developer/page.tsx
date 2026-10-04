import { DeveloperUtilitiesPanel } from "@/components/admin/developer-utilities-panel";
import { AdminSectionPage } from "@/components/admin/admin-section-page";
import { assertDeveloperUtilitiesPage } from "@/server/dev/guard";
import { Permissions } from "@/server/domain/permissions";
import { requirePermission } from "@/server/auth/session";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Developer utilities",
  robots: { index: false, follow: false },
};

export default async function AdminDeveloperPage() {
  assertDeveloperUtilitiesPage();
  await requirePermission(Permissions.SETTINGS_WRITE, "/admin/developer");

  return (
    <AdminSectionPage
      title="Developer utilities"
      description="Local, development, and staging tools only. These routes return 404 in production."
    >
      <div className="space-y-4">
        <p className="rounded-md border border-border-subtle bg-ink-50 px-3 py-2 text-sm text-ink-700">
          All created records are SAMPLE / fictional. Seed and reset wipe SAMPLE
          demo data — never point these tools at production databases.
        </p>
        <DeveloperUtilitiesPanel />
      </div>
    </AdminSectionPage>
  );
}
