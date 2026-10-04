import { createCommitteeAction } from "@/app/(admin)/actions/committees";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminStatusBanner } from "@/components/admin/admin-status-banner";
import { CommitteeForm } from "@/components/admin/committee-form";
import { requirePermission } from "@/server/auth/session";
import { Permissions } from "@/server/domain/permissions";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Create committee",
  robots: { index: false, follow: false },
};

export default async function AdminCreateCommitteePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await requirePermission(Permissions.COMMITTEE_WRITE, "/admin/committees/new");
  const params = await searchParams;

  return (
    <>
      <AdminPageHeader
        title="Create committee"
        description="Add a standing committee. After creation you can assign existing members."
        actions={
          <Link
            href="/admin/committees"
            className="inline-flex min-h-11 items-center rounded-md border border-border-default px-3 text-sm font-medium hover:bg-ink-50"
          >
            Back
          </Link>
        }
      />
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        {params.error ? (
          <AdminStatusBanner tone="error">{params.error}</AdminStatusBanner>
        ) : null}
        <div className="max-w-3xl rounded-xl border border-border-subtle bg-surface-raised p-5 shadow-xs">
          <CommitteeForm
            action={createCommitteeAction}
            submitLabel="Create committee"
          />
        </div>
      </div>
    </>
  );
}
