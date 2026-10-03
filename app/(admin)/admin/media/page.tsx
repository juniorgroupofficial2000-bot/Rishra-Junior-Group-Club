import { adminDeleteMediaAction } from "@/app/(admin)/actions/media";
import { AdminEmptyRow } from "@/components/admin/admin-empty-row";
import { AdminFilterBar } from "@/components/admin/admin-filter-bar";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { AdminStatusBanner } from "@/components/admin/admin-status-banner";
import { ConfirmFormDialog } from "@/components/admin/confirm-form-dialog";
import { MediaUploadForm } from "@/components/admin/media-upload-form";
import { ErrorBoundary } from "@/components/errors/error-boundary";
import { Badge } from "@/components/ui/badge";
import {
  EmptyRecords,
  RecordCard,
  ResponsiveRecords,
} from "@/components/ui/record-card";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { MEDIA_PURPOSES } from "@/lib/media/purposes";
import { parsePage } from "@/lib/admin/list-params";
import { requireAdminSession } from "@/server/auth/session";
import {
  Permissions,
  hasAnyPermission,
  hasPermission,
} from "@/server/domain/permissions";
import { readPermissionForPurpose } from "@/server/media/authorize-purpose";
import { listMediaAssets } from "@/server/services/media-service";
import type { MediaPurposeValue } from "@/lib/media/purposes";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Media library",
  robots: { index: false, follow: false },
};

export default async function AdminMediaPage({
  searchParams,
}: {
  searchParams: Promise<{
    query?: string;
    purpose?: string;
    page?: string;
    error?: string;
    updated?: string;
  }>;
}) {
  const session = await requireAdminSession("/admin/media");
  if (
    !hasAnyPermission(session.user.role, [
      Permissions.MEDIA_READ,
      Permissions.CONTENT_READ,
      Permissions.GALLERY_READ,
      Permissions.EVENTS_READ,
      Permissions.PUJA_READ,
    ])
  ) {
    redirect("/admin/dashboard");
  }
  const canWrite = hasAnyPermission(session.user.role, [
    Permissions.MEDIA_WRITE,
    Permissions.CONTENT_WRITE,
    Permissions.GALLERY_WRITE,
    Permissions.EVENTS_WRITE,
    Permissions.PUJA_WRITE,
  ]);

  const params = await searchParams;
  const page = parsePage(params.page);
  const purpose =
    params.purpose &&
    (MEDIA_PURPOSES as readonly string[]).includes(params.purpose)
      ? (params.purpose as MediaPurposeValue)
      : undefined;
  const allowedPurposes = MEDIA_PURPOSES.filter((p) =>
    hasPermission(session.user.role, readPermissionForPurpose(p)),
  ) as MediaPurposeValue[];

  let result;
  let loadError: string | null = null;
  try {
    result = await listMediaAssets({
      query: params.query,
      purpose,
      allowedPurposes,
      page,
      pageSize: 20,
    });
  } catch (error) {
    loadError =
      error instanceof Error ? error.message : "Could not load media.";
    result = { items: [], total: 0, page: 1, pageSize: 20 };
  }

  return (
    <>
      <AdminPageHeader
        title="Media library"
        description="Object-storage backed images with validation, optimization, alt text, and deletion protection."
      />
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        {params.error ? (
          <AdminStatusBanner tone="error">{params.error}</AdminStatusBanner>
        ) : null}
        {params.updated ? (
          <AdminStatusBanner tone="success">Media updated.</AdminStatusBanner>
        ) : null}
        {loadError ? (
          <AdminStatusBanner tone="error">{loadError}</AdminStatusBanner>
        ) : null}

        {canWrite ? (
          <ErrorBoundary
            name="media-upload"
            fallbackTitle="Upload form unavailable"
            fallbackDescription="The media library list below should still work. Reload the page to retry uploading."
          >
            <MediaUploadForm />
          </ErrorBoundary>
        ) : null}

        <AdminFilterBar
          fields={[
            {
              type: "text",
              name: "query",
              label: "Search",
              defaultValue: params.query,
              placeholder: "Alt, caption, filename…",
            },
            {
              type: "select",
              name: "purpose",
              label: "Purpose",
              defaultValue: params.purpose,
              options: [
                { value: "", label: "All purposes" },
                ...MEDIA_PURPOSES.map((p) => ({ value: p, label: p })),
              ],
            },
          ]}
        />

        <ResponsiveRecords
          mobile={
            result.items.length === 0 ? (
              <EmptyRecords message="No media assets yet." />
            ) : (
              result.items.map((item) => (
                <RecordCard
                  key={item.id}
                  title={item.alt}
                  subtitle={
                    <>
                      {item.originalFilename}
                      {item.caption ? ` · ${item.caption}` : ""}
                      <span className="mt-0.5 block font-mono text-ink-400">
                        {item.id}
                      </span>
                    </>
                  }
                  badge={<Badge variant="outline">{item.purpose}</Badge>}
                  fields={[
                    {
                      label: "Preview",
                      value: (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.url}
                          alt={item.alt}
                          width={72}
                          height={72}
                          className="h-18 w-18 rounded object-cover"
                        />
                      ),
                    },
                    {
                      label: "Protected",
                      value: item.historicallyImportant ? (
                        <Badge variant="outline">Historical</Badge>
                      ) : (
                        "—"
                      ),
                    },
                  ]}
                  actions={
                    canWrite && !item.historicallyImportant ? (
                      <ConfirmFormDialog
                        title="Delete this media asset?"
                        description="Soft-deletes the asset and hides it from delivery. Object bytes are retained for recovery."
                        triggerLabel="Delete"
                        confirmLabel="Soft delete"
                        action={adminDeleteMediaAction.bind(null, item.id)}
                      />
                    ) : undefined
                  }
                />
              ))
            )
          }
          desktop={
            <Table>
              <THead>
                <TR>
                  <TH>Preview</TH>
                  <TH>Details</TH>
                  <TH>Purpose</TH>
                  <TH>Protected</TH>
                  <TH />
                </TR>
              </THead>
              <TBody>
                {result.items.length === 0 ? (
                  <AdminEmptyRow colSpan={5} message="No media assets yet." />
                ) : (
                  result.items.map((item) => (
                    <TR key={item.id}>
                      <TD>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.url}
                          alt={item.alt}
                          width={72}
                          height={72}
                          className="h-18 w-18 rounded object-cover"
                        />
                      </TD>
                      <TD>
                        <p className="font-medium">{item.alt}</p>
                        <p className="text-xs text-ink-500">
                          {item.originalFilename}
                          {item.caption ? ` · ${item.caption}` : ""}
                        </p>
                        <p className="font-mono text-xs text-ink-400">
                          {item.id}
                        </p>
                      </TD>
                      <TD>
                        <Badge variant="outline">{item.purpose}</Badge>
                      </TD>
                      <TD>
                        {item.historicallyImportant ? (
                          <Badge variant="outline">Historical</Badge>
                        ) : (
                          "—"
                        )}
                      </TD>
                      <TD>
                        {canWrite && !item.historicallyImportant ? (
                          <ConfirmFormDialog
                            title="Delete this media asset?"
                            description="Soft-deletes the asset and hides it from delivery. Object bytes are retained for recovery."
                            triggerLabel="Delete"
                            confirmLabel="Soft delete"
                            action={adminDeleteMediaAction.bind(null, item.id)}
                          />
                        ) : null}
                      </TD>
                    </TR>
                  ))
                )}
              </TBody>
            </Table>
          }
        />
        <AdminPagination
          basePath="/admin/media"
          params={{
            query: params.query,
            purpose: params.purpose,
            page: params.page,
          }}
          page={result.page}
          pageSize={result.pageSize}
          total={result.total}
        />
      </div>
    </>
  );
}
