import { recordAttendanceAction } from "@/app/(admin)/actions/events";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminStatusBanner } from "@/components/admin/admin-status-banner";
import { Badge } from "@/components/ui/badge";
import { PendingSubmitButton } from "@/components/ui/pending-submit-button";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { requirePermission } from "@/server/auth/session";
import { Permissions } from "@/server/domain/permissions";
import { prisma } from "@/server/db/prisma";
import {
  getEventRegistrationStats,
  listEventAttendanceForAdmin,
  listEventRegistrationsForAdmin,
} from "@/server/services/event-registration-service";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Event operations",
  robots: { index: false, follow: false },
};

export default async function AdminEventOpsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; updated?: string }>;
}) {
  await requirePermission(Permissions.EVENTS_READ, "/admin/events");
  const { id } = await params;
  const query = await searchParams;

  const event = await prisma.event.findFirst({
    where: { id, deletedAt: null },
  });
  if (!event) notFound();

  const [stats, registrations, attendance] = await Promise.all([
    getEventRegistrationStats(event.id),
    listEventRegistrationsForAdmin(event.id),
    listEventAttendanceForAdmin(event.id),
  ]);

  const attendanceByMember = new Map(
    attendance.map((row) => [row.memberId, row]),
  );

  return (
    <>
      <AdminPageHeader
        title={event.title}
        description="Registration roster, capacity, and attendance for this event."
        actions={
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/admin/content/events/${event.id}`}
              className="inline-flex min-h-11 items-center rounded-md border border-border-default px-3 text-sm font-medium text-ink-800 hover:bg-ink-50"
            >
              Edit content
            </Link>
            <Link
              href="/admin/events"
              className="inline-flex min-h-11 items-center rounded-md px-3 text-sm text-ink-600 hover:bg-ink-50"
            >
              Back to events
            </Link>
          </div>
        }
      />
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        {query.error ? (
          <AdminStatusBanner tone="error">{query.error}</AdminStatusBanner>
        ) : null}
        {query.updated ? (
          <AdminStatusBanner tone="success">
            Attendance saved.
          </AdminStatusBanner>
        ) : null}

        <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-border-subtle bg-surface-raised p-4">
            <dt className="text-xs font-semibold uppercase tracking-wide text-ink-400">
              Registered
            </dt>
            <dd className="mt-1 font-mono text-2xl font-semibold text-ink-900">
              {stats.registered}
              {event.capacity != null ? (
                <span className="text-base text-ink-400">
                  {" "}
                  / {event.capacity}
                </span>
              ) : null}
            </dd>
          </div>
          <div className="rounded-xl border border-border-subtle bg-surface-raised p-4">
            <dt className="text-xs font-semibold uppercase tracking-wide text-ink-400">
              Waitlisted
            </dt>
            <dd className="mt-1 font-mono text-2xl font-semibold text-ink-900">
              {stats.waitlisted}
            </dd>
          </div>
          <div className="rounded-xl border border-border-subtle bg-surface-raised p-4">
            <dt className="text-xs font-semibold uppercase tracking-wide text-ink-400">
              Attendance marked
            </dt>
            <dd className="mt-1 font-mono text-2xl font-semibold text-ink-900">
              {stats.attended}
            </dd>
          </div>
          <div className="rounded-xl border border-border-subtle bg-surface-raised p-4">
            <dt className="text-xs font-semibold uppercase tracking-wide text-ink-400">
              Registration
            </dt>
            <dd className="mt-1 text-sm font-medium text-ink-900">
              {event.registrationRequired ? "Required" : "Not required"}
            </dd>
          </div>
        </dl>

        <section className="space-y-3">
          <h2 className="font-display text-xl font-semibold text-ink-900">
            Registered members
          </h2>
          {registrations.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border-strong px-4 py-6 text-sm text-ink-500">
              No registrations yet.
            </p>
          ) : (
            <Table>
              <THead>
                <TR>
                  <TH>Member</TH>
                  <TH>Status</TH>
                  <TH>Attendance</TH>
                  <TH>Actions</TH>
                </TR>
              </THead>
              <TBody>
                {registrations.map((row) => {
                  const marked = attendanceByMember.get(row.memberId);
                  return (
                    <TR key={row.id}>
                      <TD>
                        <Link
                          href={`/admin/members/${row.member.id}`}
                          className="font-medium underline-offset-4 hover:underline"
                        >
                          {row.member.displayName}
                        </Link>
                        <p className="font-mono text-xs text-ink-500">
                          {row.member.membershipNumber}
                        </p>
                      </TD>
                      <TD>
                        <Badge variant="outline">{row.status}</Badge>
                      </TD>
                      <TD>
                        {marked ? (
                          <Badge variant="outline">{marked.status}</Badge>
                        ) : (
                          <span className="text-xs text-ink-400">—</span>
                        )}
                      </TD>
                      <TD>
                        {row.status === "REGISTERED" ||
                        row.status === "WAITLISTED" ? (
                          <div className="flex flex-wrap gap-2">
                            <form action={recordAttendanceAction}>
                              <input
                                type="hidden"
                                name="eventId"
                                value={event.id}
                              />
                              <input
                                type="hidden"
                                name="memberId"
                                value={row.memberId}
                              />
                              <input
                                type="hidden"
                                name="status"
                                value="PRESENT"
                              />
                              <PendingSubmitButton
                                size="sm"
                                pendingLabel="Saving…"
                              >
                                Present
                              </PendingSubmitButton>
                            </form>
                            <form action={recordAttendanceAction}>
                              <input
                                type="hidden"
                                name="eventId"
                                value={event.id}
                              />
                              <input
                                type="hidden"
                                name="memberId"
                                value={row.memberId}
                              />
                              <input
                                type="hidden"
                                name="status"
                                value="ABSENT"
                              />
                              <PendingSubmitButton
                                size="sm"
                                variant="outline"
                                pendingLabel="Saving…"
                              >
                                Absent
                              </PendingSubmitButton>
                            </form>
                          </div>
                        ) : (
                          <span className="text-xs text-ink-400">—</span>
                        )}
                      </TD>
                    </TR>
                  );
                })}
              </TBody>
            </Table>
          )}
        </section>
      </div>
    </>
  );
}
