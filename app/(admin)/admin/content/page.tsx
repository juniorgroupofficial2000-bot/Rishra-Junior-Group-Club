import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { CONTENT_TYPES, contentTypeMeta } from "@/lib/admin/content-types";
import { requirePermission } from "@/server/auth/session";
import { Permissions } from "@/server/domain/permissions";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Content",
  robots: { index: false, follow: false },
};

export default async function AdminContentHubPage() {
  await requirePermission(Permissions.CONTENT_READ, "/admin/content");

  return (
    <>
      <AdminPageHeader
        title="Content"
        description="Manage public club content without code changes. Draft, publish, or archive records. Historically important items cannot be deleted."
      />
      <div className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3 sm:p-6 lg:p-8">
        {CONTENT_TYPES.map((type) => {
          const meta = contentTypeMeta[type];
          return (
            <Link
              key={type}
              href={`/admin/content/${type}`}
              className="rounded-lg border border-border-subtle bg-white p-5 transition hover:border-ink-300"
            >
              <h2 className="font-medium text-ink-900">{meta.label}</h2>
              <p className="mt-2 text-sm text-ink-500">{meta.description}</p>
            </Link>
          );
        })}
      </div>
    </>
  );
}
