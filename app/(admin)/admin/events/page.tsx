import { AdminSectionPage } from "@/components/admin/admin-section-page";
import { Badge } from "@/components/ui/badge";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { Permissions } from "@/server/domain/permissions";
import { requirePermission } from "@/server/auth/session";
import { listAdminEvents } from "@/server/services/admin-catalog-service";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Events",
  robots: { index: false, follow: false },
};

export default async function AdminEventsPage() {
  await requirePermission(Permissions.EVENTS_READ, "/admin/events");
  const events = await listAdminEvents();

  return (
    <AdminSectionPage
      title="Events"
      description="Database event records for operations. The public website currently reads from content/events.ts — admin edits here do not automatically publish to the public site until content is unified."
      isEmpty={events.length === 0}
      emptyTitle="No events"
      emptyDescription="Create events to manage registrations and attendance."
    >
      <Table>
        <THead>
          <TR>
            <TH>Event</TH>
            <TH>Starts</TH>
            <TH>Status</TH>
            <TH>Published</TH>
            <TH>Registrations</TH>
          </TR>
        </THead>
        <TBody>
          {events.map((event) => (
            <TR key={event.id}>
              <TD>
                <p className="font-medium">{event.title}</p>
                <p className="text-xs text-ink-500">{event.venueLabel ?? "TBA"}</p>
              </TD>
              <TD>{event.startsAt.toISOString().slice(0, 16).replace("T", " ")}</TD>
              <TD>
                <Badge variant="outline">{event.status}</Badge>
              </TD>
              <TD>{event.published ? "Yes" : "No"}</TD>
              <TD>{event._count.registrations}</TD>
            </TR>
          ))}
        </TBody>
      </Table>
    </AdminSectionPage>
  );
}
