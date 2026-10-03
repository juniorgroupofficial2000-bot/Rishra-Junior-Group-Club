import { AdminEmptyRow } from "@/components/admin/admin-empty-row";
import { AdminFilterBar } from "@/components/admin/admin-filter-bar";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { AdminStatusBanner } from "@/components/admin/admin-status-banner";
import { Badge } from "@/components/ui/badge";
import {
  EmptyRecords,
  RecordCard,
  ResponsiveRecords,
} from "@/components/ui/record-card";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import {
  contentTypeMeta,
  isContentType,
} from "@/lib/admin/content-types";
import { parsePage } from "@/lib/admin/list-params";
import { requirePermission } from "@/server/auth/session";
import { listContentCollection } from "@/server/services/content-cms-service";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ type: string }>;
}): Promise<Metadata> {
  const { type } = await params;
  if (!isContentType(type)) return { title: "Content" };
  return {
    title: contentTypeMeta[type].label,
    robots: { index: false, follow: false },
  };
}

function rowTitle(type: string, item: Record<string, unknown>) {
  switch (type) {
    case "homepage":
      return String(item.title ?? item.key ?? "Block");
    case "timeline":
    case "events":
    case "announcements":
    case "gallery":
    case "puja-years":
    case "positions":
      return String(item.title ?? "Untitled");
    case "faqs":
      return String(item.question ?? "FAQ");
    case "committee-roster":
      return String(item.displayName ?? item.name ?? "Member");
    case "gallery-media":
      return String(item.caption ?? item.url ?? "Media");
    default:
      return String(item.id ?? "Item");
  }
}

function rowStatus(type: string, item: Record<string, unknown>) {
  if (type === "events" || type === "gallery" || type === "gallery-media") {
    return String(item.contentStatus ?? "—");
  }
  if (type === "positions") {
    return item.active ? "ACTIVE" : "INACTIVE";
  }
  return String(item.status ?? "—");
}

export default async function AdminContentListPage({
  params,
  searchParams,
}: {
  params: Promise<{ type: string }>;
  searchParams: Promise<{ query?: string; status?: string; page?: string }>;
}) {
  const { type } = await params;
  if (!isContentType(type)) notFound();
  const meta = contentTypeMeta[type];
  await requirePermission(meta.readPermission, `/admin/content/${type}`);

  const sp = await searchParams;
  const page = parsePage(sp.page);

  let result;
  let loadError: string | null = null;
  try {
    result = await listContentCollection(type, {
      query: sp.query,
      status: sp.status || undefined,
      page,
      pageSize: 20,
    });
  } catch (error) {
    loadError =
      error instanceof Error ? error.message : "Could not load content.";
    result = { items: [], total: 0, page: 1, pageSize: 20 };
  }

  return (
    <>
      <AdminPageHeader
        title={meta.label}
        description={meta.description}
        actions={
          <Link
            href={`/admin/content/${type}/new`}
            className="inline-flex h-11 items-center rounded-md bg-ink-900 px-5 text-sm font-medium text-white hover:bg-ink-800"
          >
            New
          </Link>
        }
      />
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        {loadError ? (
          <AdminStatusBanner tone="error">{loadError}</AdminStatusBanner>
        ) : null}
        <AdminFilterBar
          fields={[
            {
              type: "text",
              name: "query",
              label: "Search",
              defaultValue: sp.query,
              placeholder: "Search…",
            },
            ...(meta.supportsStatusFilter
              ? [
                  {
                    type: "select" as const,
                    name: "status",
                    label: "Status",
                    defaultValue: sp.status,
                    options: [
                      { value: "", label: "All statuses" },
                      { value: "DRAFT", label: "DRAFT" },
                      { value: "PUBLISHED", label: "PUBLISHED" },
                      { value: "ARCHIVED", label: "ARCHIVED" },
                    ],
                  },
                ]
              : []),
          ]}
        />
        <p className="text-sm text-ink-500">
          <Link href="/admin/content" className="underline-offset-4 hover:underline">
            ← All content
          </Link>
        </p>
        <ResponsiveRecords
          mobile={
            result.items.length === 0 ? (
              <EmptyRecords message="No content matches these filters." />
            ) : (
              result.items.map((item) => {
                const row = item as unknown as Record<string, unknown>;
                const id = String(row.id);
                return (
                  <RecordCard
                    key={id}
                    title={rowTitle(type, row)}
                    subtitle={
                      typeof row.slug === "string" ||
                      typeof row.key === "string" ? (
                        <span className="font-mono">
                          {String(row.slug ?? row.key)}
                        </span>
                      ) : undefined
                    }
                    badge={
                      <Badge variant="outline">{rowStatus(type, row)}</Badge>
                    }
                    fields={[
                      {
                        label: "Protected",
                        value: row.historicallyImportant ? (
                          <Badge variant="outline">Historical</Badge>
                        ) : (
                          "—"
                        ),
                      },
                    ]}
                    actions={
                      <Link
                        href={`/admin/content/${type}/${id}`}
                        className="text-sm font-medium underline-offset-4 hover:underline"
                      >
                        Edit
                      </Link>
                    }
                  />
                );
              })
            )
          }
          desktop={
            <Table>
              <THead>
                <TR>
                  <TH>Item</TH>
                  <TH>Status</TH>
                  <TH>Protected</TH>
                  <TH />
                </TR>
              </THead>
              <TBody>
                {result.items.length === 0 ? (
                  <AdminEmptyRow
                    colSpan={4}
                    message="No content matches these filters."
                  />
                ) : (
                  result.items.map((item) => {
                    const row = item as unknown as Record<string, unknown>;
                    const id = String(row.id);
                    return (
                      <TR key={id}>
                        <TD>
                          <p className="font-medium">{rowTitle(type, row)}</p>
                          {typeof row.slug === "string" ||
                          typeof row.key === "string" ? (
                            <p className="font-mono text-xs text-ink-500">
                              {String(row.slug ?? row.key)}
                            </p>
                          ) : null}
                        </TD>
                        <TD>
                          <Badge variant="outline">
                            {rowStatus(type, row)}
                          </Badge>
                        </TD>
                        <TD>
                          {row.historicallyImportant ? (
                            <Badge variant="outline">Historical</Badge>
                          ) : (
                            "—"
                          )}
                        </TD>
                        <TD>
                          <Link
                            href={`/admin/content/${type}/${id}`}
                            className="text-sm font-medium underline-offset-4 hover:underline"
                          >
                            Edit
                          </Link>
                        </TD>
                      </TR>
                    );
                  })
                )}
              </TBody>
            </Table>
          }
        />
        <AdminPagination
          basePath={`/admin/content/${type}`}
          params={{ query: sp.query, status: sp.status, page: sp.page }}
          page={result.page}
          pageSize={result.pageSize}
          total={result.total}
        />
      </div>
    </>
  );
}
