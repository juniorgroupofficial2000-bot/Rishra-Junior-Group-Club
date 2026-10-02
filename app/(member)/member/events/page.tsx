import { EmptyPanel } from "@/components/member/empty-panel";
import { MemberPageHeader } from "@/components/member/member-page-header";
import { requireMemberId } from "@/server/auth/member-context";
import { loadMemberEvents } from "@/server/services/member-portal-service";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "My events",
  robots: { index: false, follow: false },
};

export default async function MemberEventsPage() {
  const { memberId } = await requireMemberId();
  const events = await loadMemberEvents(memberId);

  return (
    <>
      <MemberPageHeader
        title="Events"
        description="Upcoming club events relevant to members."
      />
      <div className="p-4 sm:p-6 lg:p-8">
        {events.length === 0 ? (
          <EmptyPanel
            title="No upcoming events"
            body="When events are published, they will appear here."
          />
        ) : (
          <ul className="space-y-3">
            {events.map((event) => (
              <li
                key={event.id}
                className="rounded-xl border border-border-subtle bg-surface-raised p-5 shadow-xs"
              >
                <Link
                  href={event.href}
                  className="font-display text-lg font-semibold text-ink-900 underline-offset-4 hover:underline"
                >
                  {event.title}
                </Link>
                <p className="mt-1 text-sm text-ink-500">
                  {event.startsAt} · {event.venueLabel}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
