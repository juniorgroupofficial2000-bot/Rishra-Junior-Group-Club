import { transitionAnnouncementAction } from "@/app/(admin)/actions/content";
import { AdminEmptyRow } from "@/components/admin/admin-empty-row";
import { AdminFilterBar } from "@/components/admin/admin-filter-bar";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { AdminStatusBanner } from "@/components/admin/admin-status-banner";
import { ContentLifecycleActions } from "@/components/admin/content-lifecycle-actions";
import { Badge } from "@/components/ui/badge";
import {
  EmptyRecords,
  RecordCard,
  ResponsiveRecords,
} from "@/components/ui/record-card";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { parsePage } from "@/lib/admin/list-params";
import { requirePermission } from "@/server/auth/session";
import { Permissions } from "@/server/domain/permissions";
import { searchAdminAnnouncements } from "@/server/services/admin-list-service";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Announcements",
  robots: { index: false, follow: false },
};

function lifecycleFor(status: string) {
  const transitions: Array<{
    value: "publish" | "unpublish" | "archive";
    label: string;
  }> = [];
  if (status !== "PUBLISHED") {
    transitions.push({ value: "publish", label: "Publish" });
  } else {
    transitions.push({ value: "unpublish", label: "Unpublish" });
  }
  if (status !== "ARCHIVED") {
    transitions.push({ value: "archive", label: "Archive" });
  }
  return transitions;
}

export default async function AdminAnnouncementsPage({
  searchParams,
}: {
  searchParams: Promise<{
    query?: string;
    status?: string;
    page?: string;
    error?: string;
    updated?: string;
  }>;
}) {
  await requirePermission(
    Permissions.ANNOUNCEMENTS_READ,
    "/admin/announcements",
  );
  const params = await searchParams;
  const page = parsePage(params.page);

  let result;
  let loadError: string | null = null;
  try {
    result = await searchAdminAnnouncements({
      query: params.query,
      status: params.status || undefined,
      page,
      pageSize: 20,
    });
  } catch (error) {
    loadError =
      error instanceof Error ? error.message : "Could not load announcements.";
    result = { items: [], total: 0, page: 1, pageSize: 20 };
  }

  return (
    <>
      <AdminPageHeader
        title="Announcements"
        description="Draft, schedule, publish, and archive notices. The public site reads this same content."
        actions={
          <Link
            href="/admin/content/announcements/new"
            className="inline-flex min-h-11 items-center rounded-md bg-ink-900 px-3 text-sm font-medium text-white hover:bg-ink-800"
          >
            Create announcement
          </Link>
        }
      />
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        {loadError || params.error ? (
          <AdminStatusBanner tone="error">
            {params.error || loadError}
          </AdminStatusBanner>
        ) : null}
        {params.updated ? (
          <AdminStatusBanner tone="success">
            Announcement {params.updated}.
          </AdminStatusBanner>
        ) : null}
        <AdminFilterBar
          fields={[
            {
              type: "text",
              name: "query",
              label: "Search",
              defaultValue: params.query,
              placeholder: "Title or slug…",
            },
            {
              type: "select",
              name: "status",
              label: "Status",
              defaultValue: params.status,
              options: [
                { value: "", label: "All statuses" },
                { value: "DRAFT", label: "DRAFT" },
                { value: "SCHEDULED", label: "SCHEDULED" },
                { value: "PUBLISHED", label: "PUBLISHED" },
                { value: "ARCHIVED", label: "ARCHIVED" },
              ],
            },
          ]}
        />
        <ResponsiveRecords
          mobile={
            result.items.length === 0 ? (
              <EmptyRecords message="No announcements match these filters." />
            ) : (
              result.items.map((item) => (
                <RecordCard
                  key={item.id}
                  title={item.title}
                  subtitle={
                    <span className="font-mono">{item.slug}</span>
                  }
                  href={`/admin/content/announcements/${item.id}`}
                  badge={<Badge variant="outline">{item.status}</Badge>}
                  fields={[
                    { label: "Pinned", value: item.pinned ? "Yes" : "No" },
                    {
                      label: "Publish date",
                      value:
                        item.publishedAt?.toISOString().slice(0, 10) ?? "—",
                    },
                  ]}
                  actions={
                    <ContentLifecycleActions
                      action={transitionAnnouncementAction}
                      id={item.id}
                      transitions={lifecycleFor(item.status)}
                    />
                  }
                />
              ))
            )
          }
          desktop={
            <Table>
              <THead>
                <TR>
                  <TH>Title</TH>
                  <TH>Status</TH>
                  <TH>Pinned</TH>
                  <TH>Publish date</TH>
                  <TH>Actions</TH>
                </TR>
              </THead>
              <TBody>
                {result.items.length === 0 ? (
                  <AdminEmptyRow colSpan={5} />
                ) : (
                  result.items.map((item) => (
                    <TR key={item.id}>
                      <TD>
                        <Link
                          href={`/admin/content/announcements/${item.id}`}
                          className="font-medium underline-offset-4 hover:underline"
                        >
                          {item.title}
                        </Link>
                        <p className="font-mono text-xs text-ink-500">
                          {item.slug}
                        </p>
                      </TD>
                      <TD>
                        <Badge variant="outline">{item.status}</Badge>
                      </TD>
                      <TD>{item.pinned ? "Yes" : "No"}</TD>
                      <TD className="text-xs">
                        {item.publishedAt?.toISOString().slice(0, 10) ?? "—"}
                      </TD>
                      <TD>
                        <div className="space-y-2">
                          <Link
                            href={`/admin/content/announcements/${item.id}`}
                            className="text-sm font-medium underline-offset-4 hover:underline"
                          >
                            Edit
                          </Link>
                          <ContentLifecycleActions
                            action={transitionAnnouncementAction}
                            id={item.id}
                            transitions={lifecycleFor(item.status)}
                          />
                        </div>
                      </TD>
                    </TR>
                  ))
                )}
              </TBody>
            </Table>
          }
        />
        <AdminPagination
          basePath="/admin/announcements"
          params={{ query: params.query, status: params.status }}
          page={result.page}
          pageSize={result.pageSize}
          total={result.total}
        />
      </div>
    </>
  );
}
