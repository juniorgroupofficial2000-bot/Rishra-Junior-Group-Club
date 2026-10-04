import {
  transitionEventAction,
} from "@/app/(admin)/actions/content";
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
import { searchAdminEvents } from "@/server/services/admin-list-service";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Events",
  robots: { index: false, follow: false },
};

function lifecycleFor(event: {
  published: boolean;
  contentStatus: string;
  status: string;
}) {
  const transitions: Array<{
    value: "publish" | "unpublish" | "cancel" | "archive";
    label: string;
  }> = [];
  if (!event.published || event.contentStatus !== "PUBLISHED") {
    transitions.push({ value: "publish", label: "Publish" });
  } else {
    transitions.push({ value: "unpublish", label: "Unpublish" });
  }
  if (event.status !== "CANCELLED") {
    transitions.push({ value: "cancel", label: "Cancel" });
  }
  if (event.contentStatus !== "ARCHIVED") {
    transitions.push({ value: "archive", label: "Archive" });
  }
  return transitions;
}

export default async function AdminEventsPage({
  searchParams,
}: {
  searchParams: Promise<{
    query?: string;
    status?: string;
    published?: string;
    needsAction?: string;
    page?: string;
    error?: string;
    updated?: string;
  }>;
}) {
  await requirePermission(Permissions.EVENTS_READ, "/admin/events");
  const params = await searchParams;
  const page = parsePage(params.page);

  let result;
  let loadError: string | null = null;
  try {
    result = await searchAdminEvents({
      query: params.query,
      status: params.status || undefined,
      published: params.published || undefined,
      needsAction: params.needsAction || undefined,
      page,
      pageSize: 20,
    });
  } catch (error) {
    loadError =
      error instanceof Error ? error.message : "Could not load events.";
    result = { items: [], total: 0, page: 1, pageSize: 20 };
  }

  return (
    <>
      <AdminPageHeader
        title="Events"
        description="Create, publish, and manage club events and meetings. Public pages use this same data."
        actions={
          <Link
            href="/admin/content/events/new"
            className="inline-flex min-h-11 items-center rounded-md bg-ink-900 px-3 text-sm font-medium text-white hover:bg-ink-800"
          >
            Create event
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
            Event {params.updated}.
          </AdminStatusBanner>
        ) : null}
        <AdminFilterBar
          fields={[
            {
              type: "text",
              name: "query",
              label: "Search",
              defaultValue: params.query,
              placeholder: "Title, slug, venue…",
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
                { value: "CANCELLED", label: "CANCELLED" },
                { value: "COMPLETED", label: "COMPLETED" },
              ],
            },
            {
              type: "select",
              name: "published",
              label: "Published",
              defaultValue: params.published,
              options: [
                { value: "", label: "Any" },
                { value: "true", label: "Published" },
                { value: "false", label: "Unpublished" },
              ],
            },
            {
              type: "select",
              name: "needsAction",
              label: "Queue",
              defaultValue: params.needsAction,
              options: [
                { value: "", label: "All events" },
                { value: "1", label: "Needs action" },
              ],
            },
          ]}
        />
        <ResponsiveRecords
          mobile={
            result.items.length === 0 ? (
              <EmptyRecords message="No events match these filters." />
            ) : (
              result.items.map((event) => (
                <RecordCard
                  key={event.id}
                  title={event.title}
                  subtitle={
                    <span className="font-mono">{event.slug}</span>
                  }
                  href={`/admin/events/${event.id}`}
                  badge={<Badge variant="outline">{event.status}</Badge>}
                  fields={[
                    {
                      label: "Starts",
                      value: event.startsAt
                        .toISOString()
                        .slice(0, 16)
                        .replace("T", " "),
                    },
                    { label: "Location", value: event.venueLabel ?? "—" },
                    {
                      label: "Type",
                      value: event.category === "meeting" ? "Meeting" : "Event",
                    },
                    {
                      label: "Published",
                      value: event.published ? "Yes" : "No",
                    },
                    {
                      label: "Regs",
                      value: `${event._count.registrations}${
                        event.capacity != null ? ` / ${event.capacity}` : ""
                      }`,
                    },
                  ]}
                  actions={
                    <div className="space-y-2">
                      <Link
                        href={`/admin/content/events/${event.id}`}
                        className="text-sm font-medium underline-offset-4 hover:underline"
                      >
                        Edit
                      </Link>
                      <ContentLifecycleActions
                        action={transitionEventAction}
                        id={event.id}
                        transitions={lifecycleFor(event)}
                      />
                    </div>
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
                  <TH>Starts</TH>
                  <TH>Location</TH>
                  <TH>Status</TH>
                  <TH>Regs</TH>
                  <TH>Actions</TH>
                </TR>
              </THead>
              <TBody>
                {result.items.length === 0 ? (
                  <AdminEmptyRow colSpan={6} />
                ) : (
                  result.items.map((event) => (
                    <TR key={event.id}>
                      <TD>
                        <Link
                          href={`/admin/events/${event.id}`}
                          className="font-medium underline-offset-4 hover:underline"
                        >
                          {event.title}
                        </Link>
                        <p className="font-mono text-xs text-ink-500">
                          {event.slug}
                          {event.category === "meeting" ? " · meeting" : ""}
                        </p>
                      </TD>
                      <TD className="text-xs">
                        {event.startsAt
                          .toISOString()
                          .slice(0, 16)
                          .replace("T", " ")}
                      </TD>
                      <TD>{event.venueLabel ?? "—"}</TD>
                      <TD>
                        <Badge variant="outline">{event.status}</Badge>
                        {event.published ? null : (
                          <span className="ml-2 text-xs text-ink-400">
                            unpublished
                          </span>
                        )}
                      </TD>
                      <TD>
                        {event._count.registrations}
                        {event.capacity != null ? ` / ${event.capacity}` : ""}
                      </TD>
                      <TD>
                        <div className="space-y-2">
                          <Link
                            href={`/admin/events/${event.id}`}
                            className="block text-sm font-medium underline-offset-4 hover:underline"
                          >
                            Roster
                          </Link>
                          <Link
                            href={`/admin/content/events/${event.id}`}
                            className="block text-sm font-medium underline-offset-4 hover:underline"
                          >
                            Edit
                          </Link>
                          <ContentLifecycleActions
                            action={transitionEventAction}
                            id={event.id}
                            transitions={lifecycleFor(event)}
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
          basePath="/admin/events"
          params={{
            query: params.query,
            status: params.status,
            published: params.published,
            needsAction: params.needsAction,
          }}
          page={result.page}
          pageSize={result.pageSize}
          total={result.total}
        />
      </div>
    </>
  );
}
