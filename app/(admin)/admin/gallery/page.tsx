import { AdminSectionPage } from "@/components/admin/admin-section-page";
import { Badge } from "@/components/ui/badge";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { Permissions } from "@/server/domain/permissions";
import { requirePermission } from "@/server/auth/session";
import { listAdminGallery } from "@/server/services/admin-catalog-service";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gallery",
  robots: { index: false, follow: false },
};

export default async function AdminGalleryPage() {
  await requirePermission(Permissions.GALLERY_READ, "/admin/gallery");
  const albums = await listAdminGallery();

  return (
    <AdminSectionPage
      title="Gallery"
      description="Database gallery records for operations. The public gallery currently reads from content/gallery.ts — admin edits here do not automatically publish until content is unified."
      isEmpty={albums.length === 0}
      emptyTitle="No albums"
      emptyDescription="Gallery albums will appear here for content managers."
    >
      <Table>
        <THead>
          <TR>
            <TH>Album</TH>
            <TH>Published</TH>
            <TH>Media</TH>
            <TH>Updated</TH>
          </TR>
        </THead>
        <TBody>
          {albums.map((album) => (
            <TR key={album.id}>
              <TD>
                <p className="font-medium">{album.title}</p>
                <p className="font-mono text-xs text-ink-500">{album.slug}</p>
              </TD>
              <TD>
                <Badge variant="outline">
                  {album.published ? "Published" : "Draft"}
                </Badge>
              </TD>
              <TD>{album._count.media}</TD>
              <TD>{album.updatedAt.toISOString().slice(0, 10)}</TD>
            </TR>
          ))}
        </TBody>
      </Table>
    </AdminSectionPage>
  );
}
