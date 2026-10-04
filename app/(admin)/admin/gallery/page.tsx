import {
  deleteGalleryMediaAction,
  reorderGalleryMediaAction,
} from "@/app/(admin)/actions/content";
import { AdminEmptyRow } from "@/components/admin/admin-empty-row";
import { AdminFilterBar } from "@/components/admin/admin-filter-bar";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { AdminStatusBanner } from "@/components/admin/admin-status-banner";
import { Badge } from "@/components/ui/badge";
import { PendingSubmitButton } from "@/components/ui/pending-submit-button";
import {
  EmptyRecords,
  RecordCard,
  ResponsiveRecords,
} from "@/components/ui/record-card";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { parsePage } from "@/lib/admin/list-params";
import { requirePermission } from "@/server/auth/session";
import { Permissions } from "@/server/domain/permissions";
import { prisma } from "@/server/db/prisma";
import { searchAdminGallery } from "@/server/services/admin-list-service";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Gallery",
  robots: { index: false, follow: false },
};

export default async function AdminGalleryPage({
  searchParams,
}: {
  searchParams: Promise<{
    query?: string;
    published?: string;
    page?: string;
    error?: string;
    updated?: string;
  }>;
}) {
  await requirePermission(Permissions.GALLERY_READ, "/admin/gallery");
  const params = await searchParams;
  const page = parsePage(params.page);

  let result;
  let loadError: string | null = null;
  try {
    result = await searchAdminGallery({
      query: params.query,
      published: params.published || undefined,
      page,
      pageSize: 20,
    });
  } catch (error) {
    loadError =
      error instanceof Error ? error.message : "Could not load gallery.";
    result = { items: [], total: 0, page: 1, pageSize: 20 };
  }

  const albumIds = result.items.map((album) => album.id);
  const mediaPreview =
    albumIds.length === 0
      ? []
      : await prisma.galleryMedia.findMany({
          where: { deletedAt: null, albumId: { in: albumIds } },
          orderBy: [{ albumId: "asc" }, { sortOrder: "asc" }],
          take: 40,
          select: {
            id: true,
            albumId: true,
            url: true,
            caption: true,
            alt: true,
            sortOrder: true,
            contentStatus: true,
            album: { select: { title: true } },
          },
        });

  return (
    <>
      <AdminPageHeader
        title="Gallery"
        description="Albums and media for the public gallery. Upload, caption, reorder, and publish from here."
        actions={
          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin/content/gallery/new"
              className="inline-flex min-h-11 items-center rounded-md bg-ink-900 px-3 text-sm font-medium text-white hover:bg-ink-800"
            >
              New album
            </Link>
            <Link
              href="/admin/content/gallery-media/new"
              className="inline-flex min-h-11 items-center rounded-md border border-border-default px-3 text-sm font-medium hover:bg-ink-50"
            >
              Add media
            </Link>
            <Link
              href="/admin/media"
              className="inline-flex min-h-11 items-center rounded-md border border-border-default px-3 text-sm font-medium hover:bg-ink-50"
            >
              Upload files
            </Link>
          </div>
        }
      />
      <div className="space-y-8 p-4 sm:p-6 lg:p-8">
        {loadError || params.error ? (
          <AdminStatusBanner tone="error">
            {params.error || loadError}
          </AdminStatusBanner>
        ) : null}
        {params.updated ? (
          <AdminStatusBanner tone="success">
            Gallery {params.updated}.
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
              name: "published",
              label: "Published",
              defaultValue: params.published,
              options: [
                { value: "", label: "Any" },
                { value: "true", label: "Published" },
                { value: "false", label: "Unpublished" },
              ],
            },
          ]}
        />
        <ResponsiveRecords
          mobile={
            result.items.length === 0 ? (
              <EmptyRecords message="No albums match these filters." />
            ) : (
              result.items.map((album) => (
                <RecordCard
                  key={album.id}
                  title={album.title}
                  subtitle={
                    <span className="font-mono">{album.slug}</span>
                  }
                  href={`/admin/content/gallery/${album.id}`}
                  badge={
                    <Badge variant="outline">
                      {album.published ? "Published" : "Draft"}
                    </Badge>
                  }
                  fields={[
                    { label: "Media", value: album._count.media },
                    {
                      label: "Updated",
                      value: album.updatedAt.toISOString().slice(0, 10),
                    },
                  ]}
                />
              ))
            )
          }
          desktop={
            <Table>
              <THead>
                <TR>
                  <TH>Album</TH>
                  <TH>Media</TH>
                  <TH>Published</TH>
                  <TH>Updated</TH>
                  <TH>Actions</TH>
                </TR>
              </THead>
              <TBody>
                {result.items.length === 0 ? (
                  <AdminEmptyRow colSpan={5} />
                ) : (
                  result.items.map((album) => (
                    <TR key={album.id}>
                      <TD>
                        <Link
                          href={`/admin/content/gallery/${album.id}`}
                          className="font-medium underline-offset-4 hover:underline"
                        >
                          {album.title}
                        </Link>
                        <p className="font-mono text-xs text-ink-500">
                          {album.slug}
                        </p>
                      </TD>
                      <TD>{album._count.media}</TD>
                      <TD>
                        <Badge variant="outline">
                          {album.published ? "Published" : "Draft"}
                        </Badge>
                      </TD>
                      <TD className="text-xs">
                        {album.updatedAt.toISOString().slice(0, 10)}
                      </TD>
                      <TD>
                        <Link
                          href={`/admin/content/gallery/${album.id}`}
                          className="text-sm font-medium underline-offset-4 hover:underline"
                        >
                          Edit
                        </Link>
                      </TD>
                    </TR>
                  ))
                )}
              </TBody>
            </Table>
          }
        />

        <section className="space-y-3">
          <div>
            <h2 className="text-base font-semibold text-ink-900">
              Media preview & reorder
            </h2>
            <p className="text-sm text-ink-500">
              Caption, publish status, and sort order for items in the albums
              above. Deleting removes the gallery item (not financial data).
            </p>
          </div>
          {mediaPreview.length === 0 ? (
            <p className="text-sm text-ink-500">
              No media on this page yet. Add media to an album to preview and
              reorder.
            </p>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {mediaPreview.map((item) => (
                <li
                  key={item.id}
                  className="overflow-hidden rounded-lg border border-border-subtle bg-surface-raised"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.url}
                    alt={item.alt ?? item.caption ?? "Gallery media"}
                    className="aspect-[4/3] w-full object-cover bg-ink-100"
                  />
                  <div className="space-y-2 p-3">
                    <p className="text-sm font-medium text-ink-900">
                      {item.caption || item.alt || "Untitled media"}
                    </p>
                    <p className="text-xs text-ink-500">
                      {item.album.title} · order {item.sortOrder} ·{" "}
                      {item.contentStatus}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <form action={reorderGalleryMediaAction}>
                        <input type="hidden" name="id" value={item.id} />
                        <input type="hidden" name="direction" value="up" />
                        <PendingSubmitButton
                          pendingLabel="…"
                          variant="outline"
                          size="sm"
                        >
                          Move up
                        </PendingSubmitButton>
                      </form>
                      <form action={reorderGalleryMediaAction}>
                        <input type="hidden" name="id" value={item.id} />
                        <input type="hidden" name="direction" value="down" />
                        <PendingSubmitButton
                          pendingLabel="…"
                          variant="outline"
                          size="sm"
                        >
                          Move down
                        </PendingSubmitButton>
                      </form>
                      <Link
                        href={`/admin/content/gallery-media/${item.id}`}
                        className="inline-flex min-h-9 items-center text-xs font-medium underline-offset-4 hover:underline"
                      >
                        Edit
                      </Link>
                      <form action={deleteGalleryMediaAction.bind(null, item.id)}>
                        <PendingSubmitButton
                          pendingLabel="…"
                          variant="outline"
                          size="sm"
                        >
                          Delete
                        </PendingSubmitButton>
                      </form>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <AdminPagination
          basePath="/admin/gallery"
          params={{ query: params.query, published: params.published }}
          page={result.page}
          pageSize={result.pageSize}
          total={result.total}
        />
      </div>
    </>
  );
}
