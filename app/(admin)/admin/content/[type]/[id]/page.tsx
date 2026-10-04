import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminStatusBanner } from "@/components/admin/admin-status-banner";
import { ContentEditorForm } from "@/components/admin/content-editor-form";
import {
  contentTypeMeta,
  isContentType,
} from "@/lib/admin/content-types";
import { requirePermission } from "@/server/auth/session";
import { prisma } from "@/server/db/prisma";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ type: string; id: string }>;
}): Promise<Metadata> {
  const { type } = await params;
  if (!isContentType(type)) return { title: "Edit content" };
  return {
    title: `Edit · ${contentTypeMeta[type].label}`,
    robots: { index: false, follow: false },
  };
}

async function loadRecord(type: string, id: string) {
  if (id === "new") return null;
  switch (type) {
    case "homepage":
      return prisma.siteContentBlock.findFirst({
        where: { id, deletedAt: null },
      });
    case "timeline":
      return prisma.timelineEntry.findFirst({
        where: { id, deletedAt: null },
      });
    case "faqs":
      return prisma.faqItem.findFirst({ where: { id, deletedAt: null } });
    case "puja-years":
      return prisma.pujaYear.findFirst({
        where: { id, deletedAt: null },
        include: {
          scheduleItems: {
            where: { deletedAt: null },
            orderBy: [{ sortOrder: "asc" }, { startsAt: "asc" }],
          },
        },
      });
    case "committee-roster":
      return prisma.publicCommitteeMember.findFirst({
        where: { id, deletedAt: null },
      });
    case "positions":
      return prisma.committeePosition.findFirst({
        where: { id, deletedAt: null },
      });
    case "events":
      return prisma.event.findFirst({ where: { id, deletedAt: null } });
    case "announcements":
      return prisma.announcement.findFirst({
        where: { id, deletedAt: null },
      });
    case "gallery":
      return prisma.galleryAlbum.findFirst({
        where: { id, deletedAt: null },
      });
    case "gallery-media":
      return prisma.galleryMedia.findFirst({
        where: { id, deletedAt: null },
      });
    default:
      return null;
  }
}

export default async function AdminContentEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ type: string; id: string }>;
  searchParams: Promise<{ error?: string; updated?: string }>;
}) {
  const { type, id } = await params;
  if (!isContentType(type)) notFound();
  const meta = contentTypeMeta[type];
  await requirePermission(meta.writePermission, `/admin/content/${type}`);

  const sp = await searchParams;
  const record = await loadRecord(type, id);
  if (id !== "new" && !record) notFound();

  const albumOptions =
    type === "gallery-media"
      ? await prisma.galleryAlbum.findMany({
          where: { deletedAt: null },
          select: { id: true, title: true },
          orderBy: { title: "asc" },
        })
      : [];

  return (
    <>
      <AdminPageHeader
        title={id === "new" ? `New · ${meta.label}` : `Edit · ${meta.label}`}
        description="Validated on save. Changes are written to the audit log."
      />
      <div className="mx-auto max-w-3xl space-y-6 p-4 sm:p-6 lg:p-8">
        <p className="text-sm text-ink-500">
          <Link
            href={`/admin/content/${type}`}
            className="underline-offset-4 hover:underline"
          >
            ← Back to {meta.label}
          </Link>
        </p>
        {sp.error ? (
          <AdminStatusBanner tone="error">{sp.error}</AdminStatusBanner>
        ) : null}
        {sp.updated ? (
          <AdminStatusBanner tone="success">
            Content saved. Audit log updated.
          </AdminStatusBanner>
        ) : null}
        <div className="rounded-lg border border-border-subtle bg-white p-5">
          <ContentEditorForm
            type={type}
            record={record as Record<string, unknown> | null}
            albumOptions={albumOptions}
          />
        </div>
      </div>
    </>
  );
}
