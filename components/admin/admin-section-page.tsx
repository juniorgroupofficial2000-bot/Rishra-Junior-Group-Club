import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { EmptyAdminPanel } from "@/components/admin/empty-admin-panel";
import type { ReactNode } from "react";

export function AdminSectionPage({
  title,
  description,
  children,
  emptyTitle,
  emptyDescription,
  isEmpty = false,
}: {
  title: string;
  description: string;
  children?: ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
  isEmpty?: boolean;
}) {
  return (
    <>
      <AdminPageHeader title={title} description={description} />
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        {isEmpty && emptyTitle && emptyDescription ? (
          <EmptyAdminPanel title={emptyTitle} description={emptyDescription} />
        ) : (
          children
        )}
      </div>
    </>
  );
}
