import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminStatusBanner } from "@/components/admin/admin-status-banner";
import { EmptyAdminPanel } from "@/components/admin/empty-admin-panel";
import { requirePermission } from "@/server/auth/session";
import { Permissions } from "@/server/domain/permissions";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Documents",
  robots: { index: false, follow: false },
};

export default async function AdminDocumentsPage() {
  await requirePermission(Permissions.DOCUMENTS_READ, "/admin/documents");

  return (
    <>
      <AdminPageHeader
        title="Documents"
        description="Club document library. Upload pipeline is not enabled in this release."
      />
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        <AdminStatusBanner>
          Empty state by design — binary uploads stay disabled until a storage
          provider and virus-scan path are configured.
        </AdminStatusBanner>
        <EmptyAdminPanel
          title="No documents yet"
          description="When document storage is enabled, this page will list searchable, paginated files with confirmation for deletes."
        />
      </div>
    </>
  );
}
