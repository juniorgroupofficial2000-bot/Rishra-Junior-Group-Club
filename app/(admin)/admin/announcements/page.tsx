import { AdminSectionPage } from "@/components/admin/admin-section-page";
import { Badge } from "@/components/ui/badge";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { Permissions } from "@/server/domain/permissions";
import { requirePermission } from "@/server/auth/session";
import { listAdminAnnouncements } from "@/server/services/admin-catalog-service";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Announcements",
  robots: { index: false, follow: false },
};

export default async function AdminAnnouncementsPage() {
  await requirePermission(
    Permissions.ANNOUNCEMENTS_READ,
    "/admin/announcements",
  );
  const items = await listAdminAnnouncements();

  return (
    <AdminSectionPage
      title="Announcements"
      description="Database announcement records for operations. The public announcements page currently reads from content/announcements.ts — admin edits here do not automatically publish until content is unified."
      isEmpty={items.length === 0}
      emptyTitle="No announcements"
      emptyDescription="Create announcements here for internal tracking until public CMS unification."
    >
      <Table>
        <THead>
          <TR>
            <TH>Title</TH>
            <TH>Status</TH>
            <TH>Pinned</TH>
            <TH>Published</TH>
          </TR>
        </THead>
        <TBody>
          {items.map((item) => (
            <TR key={item.id}>
              <TD>
                <p className="font-medium">{item.title}</p>
                <p className="font-mono text-xs text-ink-500">{item.slug}</p>
              </TD>
              <TD>
                <Badge variant="outline">{item.status}</Badge>
              </TD>
              <TD>{item.pinned ? "Yes" : "No"}</TD>
              <TD>
                {item.publishedAt
                  ? item.publishedAt.toISOString().slice(0, 10)
                  : "—"}
              </TD>
            </TR>
          ))}
        </TBody>
      </Table>
    </AdminSectionPage>
  );
}
