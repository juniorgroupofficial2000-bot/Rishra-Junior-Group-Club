import { EventRegistrationControls } from "@/components/member/event-registration-controls";
import { EmptyPanel } from "@/components/member/empty-panel";
import { MemberPageHeader } from "@/components/member/member-page-header";
import { AdminStatusBanner } from "@/components/admin/admin-status-banner";
import { requireMemberId } from "@/server/auth/member-context";
import { listMemberEventRegistrations } from "@/server/services/event-registration-service";
import { loadMemberEvents } from "@/server/services/member-portal-service";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "My events",
  robots: { index: false, follow: false },
};

export default async function MemberEventsPage({
  searchParams,
}: {
  searchParams: Promise<{
    error?: string;
    registered?: string;
    cancelled?: string;
  }>;
}) {
  const { memberId } = await requireMemberId();
  const params = await searchParams;
  const [events, registrations] = await Promise.all([
    loadMemberEvents(memberId),
    listMemberEventRegistrations(memberId),
  ]);
  const registrationByEvent = new Map(
    registrations.map((row) => [row.eventId, row.status]),
  );

  return (
    <>
      <MemberPageHeader
        title="Events"
        description="Upcoming club events. Register when the event requires confirmation."
      />
      <div className="space-y-4 p-4 sm:p-6 lg:p-8">
        {params.error ? (
          <AdminStatusBanner tone="error">{params.error}</AdminStatusBanner>
        ) : null}
        {params.registered ? (
          <AdminStatusBanner tone="success">
            Your registration was saved.
          </AdminStatusBanner>
        ) : null}
        {params.cancelled ? (
          <AdminStatusBanner tone="success">
            Registration cancelled.
          </AdminStatusBanner>
        ) : null}

        {events.length === 0 ? (
          <EmptyPanel
            title="No upcoming events"
            body="When events are published, they will appear here so you can register."
          />
        ) : (
          <ul className="space-y-3">
            {events.map((event) => {
              const registrationStatus =
                registrationByEvent.get(event.id) ?? null;
              const registered = Boolean(registrationStatus);
              const seatsLeft =
                event.capacity != null
                  ? Math.max(0, event.capacity - event.registeredCount)
                  : null;
              return (
                <li
                  key={event.id}
                  className="rounded-xl border border-border-subtle bg-surface-raised p-5 shadow-xs"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <Link
                        href={event.href}
                        className="font-display text-lg font-semibold text-ink-900 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        {event.title}
                      </Link>
                      <p className="mt-1 text-sm text-ink-500">
                        {event.startsAt} · {event.venueLabel}
                      </p>
                      {event.capacity != null ? (
                        <p className="mt-1 text-xs text-ink-400">
                          Capacity {event.registeredCount} / {event.capacity}
                        </p>
                      ) : null}
                    </div>
                    <EventRegistrationControls
                      eventId={event.id}
                      eventTitle={event.title}
                      registered={registered}
                      registrationStatus={
                        registrationStatus === "WAITLISTED" ||
                        registrationStatus === "REGISTERED"
                          ? registrationStatus
                          : null
                      }
                      registrationRequired={event.registrationRequired}
                      seatsLeft={seatsLeft}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </>
  );
}
