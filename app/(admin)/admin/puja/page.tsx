import { AdminSectionPage } from "@/components/admin/admin-section-page";
import { EmptyAdminPanel } from "@/components/admin/empty-admin-panel";
import { Permissions } from "@/server/domain/permissions";
import { requirePermission } from "@/server/auth/session";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Puja admin",
  robots: { index: false, follow: false },
};

export default async function AdminPujaPage() {
  await requirePermission(Permissions.PUJA_READ, "/admin/puja");

  return (
    <AdminSectionPage
      title="Saraswati Puja"
      description="Operational workspace for the flagship puja programme."
    >
      <EmptyAdminPanel
        title="Programme workspace ready"
        description="Use this section for future schedule, seva roster, and archive controls. Public content remains on the Saraswati Puja page."
      />
      <p className="text-sm text-ink-600">
        Public page:{" "}
        <Link
          href="/saraswati-puja"
          className="font-medium underline-offset-4 hover:underline"
        >
          /saraswati-puja
        </Link>
      </p>
    </AdminSectionPage>
  );
}
