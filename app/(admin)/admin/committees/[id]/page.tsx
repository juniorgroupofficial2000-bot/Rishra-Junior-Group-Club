import {
  archiveCommitteeAction,
  deleteCommitteeAction,
  saveCommitteeAction,
} from "@/app/(admin)/actions/committees";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminStatusBanner } from "@/components/admin/admin-status-banner";
import { CommitteeForm } from "@/components/admin/committee-form";
import { requirePermission } from "@/server/auth/session";
import { Permissions } from "@/server/domain/permissions";
import {
  OrgCommitteeError,
  getAdminCommittee,
} from "@/server/services/org-committee-service";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Edit committee",
  robots: { index: false, follow: false },
};

export default async function AdminCommitteeDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; updated?: string; created?: string }>;
}) {
  await requirePermission(Permissions.COMMITTEE_READ, "/admin/committees");
  const { id } = await params;
  const query = await searchParams;

  let committee;
  try {
    committee = await getAdminCommittee(id);
  } catch (error) {
    if (error instanceof OrgCommitteeError) notFound();
    throw error;
  }

  return (
    <>
      <AdminPageHeader
        title={committee.name}
        description={`/${committee.slug} · ${committee.kind === "EXECUTIVE" ? "Executive" : "Sub-committee"}`}
        actions={
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/admin/committees/${committee.id}/members`}
              className="inline-flex min-h-11 items-center rounded-md bg-ink-900 px-3 text-sm font-medium text-white hover:bg-ink-800"
            >
              Manage members
            </Link>
            <Link
              href={`/committee/${committee.slug}`}
              className="inline-flex min-h-11 items-center rounded-md border border-border-default px-3 text-sm font-medium hover:bg-ink-50"
              target="_blank"
            >
              View public
            </Link>
            <Link
              href="/admin/committees"
              className="inline-flex min-h-11 items-center rounded-md border border-border-default px-3 text-sm font-medium hover:bg-ink-50"
            >
              Back
            </Link>
          </div>
        }
      />
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        {query.created ? (
          <AdminStatusBanner tone="success">
            Committee created successfully.
          </AdminStatusBanner>
        ) : null}
        {query.updated ? (
          <AdminStatusBanner tone="success">{query.updated}</AdminStatusBanner>
        ) : null}
        {query.error ? (
          <AdminStatusBanner tone="error">{query.error}</AdminStatusBanner>
        ) : null}

        <div className="max-w-3xl rounded-xl border border-border-subtle bg-surface-raised p-5 shadow-xs">
          <CommitteeForm
            action={saveCommitteeAction}
            committee={committee}
            submitLabel="Save committee"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          {committee.status !== "ARCHIVED" ? (
            <form action={archiveCommitteeAction}>
              <input type="hidden" name="id" value={committee.id} />
              <button
                type="submit"
                className="inline-flex min-h-11 items-center rounded-md border border-border-default px-3 text-sm font-medium hover:bg-ink-50"
              >
                Archive
              </button>
            </form>
          ) : null}
          {!committee.historicallyImportant ? (
            <form action={deleteCommitteeAction}>
              <input type="hidden" name="id" value={committee.id} />
              <button
                type="submit"
                className="inline-flex min-h-11 items-center rounded-md border border-red-200 px-3 text-sm font-medium text-red-700 hover:bg-red-50"
              >
                Delete
              </button>
            </form>
          ) : null}
        </div>
      </div>
    </>
  );
}
