import {
  archiveCommitteeAction,
  reorderCommitteesAction,
} from "@/app/(admin)/actions/committees";
import { AdminEmptyRow } from "@/components/admin/admin-empty-row";
import { AdminFilterBar } from "@/components/admin/admin-filter-bar";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminStatusBanner } from "@/components/admin/admin-status-banner";
import { ReorderableList } from "@/components/admin/reorderable-list";
import { Badge } from "@/components/ui/badge";
import {
  EmptyRecords,
  RecordCard,
  ResponsiveRecords,
} from "@/components/ui/record-card";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { PendingSubmitButton } from "@/components/ui/pending-submit-button";
import { requirePermission } from "@/server/auth/session";
import { Permissions } from "@/server/domain/permissions";
import { listAdminCommittees } from "@/server/services/org-committee-service";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Committees",
  robots: { index: false, follow: false },
};

export default async function AdminCommitteesPage({
  searchParams,
}: {
  searchParams: Promise<{
    query?: string;
    status?: string;
    kind?: string;
    updated?: string;
    error?: string;
  }>;
}) {
  await requirePermission(Permissions.COMMITTEE_READ, "/admin/committees");
  const params = await searchParams;

  let items: Awaited<ReturnType<typeof listAdminCommittees>> = [];
  let loadError: string | null = null;
  try {
    items = await listAdminCommittees({
      query: params.query,
      status: params.status || undefined,
      kind: params.kind || undefined,
    });
  } catch (error) {
    loadError =
      error instanceof Error ? error.message : "Could not load committees.";
  }

  return (
    <>
      <AdminPageHeader
        title="Committees"
        description="Executive leadership and standing sub-committees. Changes publish to /committee automatically."
        actions={
          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin/committees/new"
              className="inline-flex min-h-11 items-center rounded-md bg-ink-900 px-3 text-sm font-medium text-white hover:bg-ink-800"
            >
              Create committee
            </Link>
            <Link
              href="/admin/committee"
              className="inline-flex min-h-11 items-center rounded-md border border-border-default px-3 text-sm font-medium hover:bg-ink-50"
            >
              Legacy roster
            </Link>
          </div>
        }
      />
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        {params.updated ? (
          <AdminStatusBanner tone="success">{params.updated}</AdminStatusBanner>
        ) : null}
        {params.error || loadError ? (
          <AdminStatusBanner tone="error">
            {params.error || loadError}
          </AdminStatusBanner>
        ) : null}

        <AdminFilterBar
          fields={[
            {
              type: "text",
              name: "query",
              label: "Search",
              defaultValue: params.query,
              placeholder: "Committee name…",
            },
            {
              type: "select",
              name: "kind",
              label: "Kind",
              defaultValue: params.kind,
              options: [
                { value: "", label: "All" },
                { value: "EXECUTIVE", label: "Executive" },
                { value: "SUB", label: "Sub-committee" },
              ],
            },
            {
              type: "select",
              name: "status",
              label: "Status",
              defaultValue: params.status,
              options: [
                { value: "", label: "All" },
                { value: "DRAFT", label: "Draft" },
                { value: "PUBLISHED", label: "Published" },
                { value: "ARCHIVED", label: "Archived" },
              ],
            },
          ]}
        />

        <ResponsiveRecords
          mobile={
            items.length === 0 ? (
              <EmptyRecords message="No committees yet. Create the first standing committee to appear on the public site." />
            ) : (
              items.map((row) => (
                <RecordCard
                  key={row.id}
                  title={row.name}
                  subtitle={`${row.kind === "EXECUTIVE" ? "Executive" : "Sub-committee"} · ${row.memberCount} members`}
                  href={`/admin/committees/${row.id}`}
                  badge={<Badge variant="outline">{row.status}</Badge>}
                  fields={[
                    { label: "Chair / lead", value: row.chairpersonName ?? "—" },
                    { label: "Convenor", value: row.convenorName ?? "—" },
                    { label: "Term", value: row.termYear ?? "—" },
                  ]}
                />
              ))
            )
          }
          desktop={
            <Table>
              <THead>
                <TR>
                  <TH>Committee</TH>
                  <TH>Members</TH>
                  <TH>Chairperson</TH>
                  <TH>Convenor</TH>
                  <TH>Term</TH>
                  <TH>Status</TH>
                  <TH>Actions</TH>
                </TR>
              </THead>
              <TBody>
                {items.length === 0 ? (
                  <AdminEmptyRow colSpan={7} />
                ) : (
                  items.map((row) => (
                    <TR key={row.id}>
                      <TD>
                        <Link
                          href={`/admin/committees/${row.id}`}
                          className="font-medium underline-offset-4 hover:underline"
                        >
                          {row.name}
                        </Link>
                        <p className="mt-0.5 text-xs text-ink-500">
                          {row.kind === "EXECUTIVE"
                            ? "Executive"
                            : "Sub-committee"}{" "}
                          · /committee/{row.slug}
                        </p>
                      </TD>
                      <TD>{row.memberCount}</TD>
                      <TD>{row.chairpersonName ?? "—"}</TD>
                      <TD>{row.convenorName ?? "—"}</TD>
                      <TD>{row.termYear ?? "—"}</TD>
                      <TD>
                        <Badge variant="outline">{row.status}</Badge>
                      </TD>
                      <TD>
                        <div className="flex flex-wrap gap-3 text-sm">
                          <Link
                            href={`/committee/${row.slug}`}
                            className="font-medium underline-offset-4 hover:underline"
                            target="_blank"
                          >
                            View
                          </Link>
                          <Link
                            href={`/admin/committees/${row.id}`}
                            className="font-medium underline-offset-4 hover:underline"
                          >
                            Edit
                          </Link>
                          <Link
                            href={`/admin/committees/${row.id}/members`}
                            className="font-medium underline-offset-4 hover:underline"
                          >
                            Manage members
                          </Link>
                          {row.status !== "ARCHIVED" ? (
                            <form action={archiveCommitteeAction}>
                              <input type="hidden" name="id" value={row.id} />
                              <button
                                type="submit"
                                className="font-medium text-ink-600 underline-offset-4 hover:underline"
                              >
                                Archive
                              </button>
                            </form>
                          ) : null}
                        </div>
                      </TD>
                    </TR>
                  ))
                )}
              </TBody>
            </Table>
          }
        />

        {items.length > 1 ? (
          <section className="rounded-xl border border-border-subtle bg-surface-raised p-5">
            <h2 className="font-display text-lg font-semibold text-ink-900">
              Reorder committees
            </h2>
            <form action={reorderCommitteesAction} className="mt-4 space-y-4">
              <ReorderableList
                items={items.map((row) => ({
                  id: row.id,
                  label: row.name,
                  meta: row.kind === "EXECUTIVE" ? "Executive" : "Sub-committee",
                }))}
              />
              <PendingSubmitButton className="inline-flex min-h-11 items-center rounded-md border border-border-default px-3 text-sm font-medium hover:bg-ink-50">
                Save order
              </PendingSubmitButton>
            </form>
          </section>
        ) : null}
      </div>
    </>
  );
}
