import { AdminSectionPage } from "@/components/admin/admin-section-page";
import { EmptyAdminPanel } from "@/components/admin/empty-admin-panel";
import { Permissions } from "@/server/domain/permissions";
import { requirePermission } from "@/server/auth/session";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Documents",
  robots: { index: false, follow: false },
};

export default async function AdminDocumentsPage() {
  await requirePermission(Permissions.DOCUMENTS_READ, "/admin/documents");

  return (
    <AdminSectionPage
      title="Documents"
      description="Club document registry for policies, minutes, and notices."
    >
      <EmptyAdminPanel
        title="Document store not connected yet"
        description="This admin surface is permission-gated. Unrestricted file uploads are intentionally disabled until a signed, typed upload pipeline is implemented."
      />
    </AdminSectionPage>
  );
}
