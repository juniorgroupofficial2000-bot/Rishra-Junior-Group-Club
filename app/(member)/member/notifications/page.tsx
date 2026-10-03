import { markAllNotificationsReadAction } from "@/app/(member)/actions/notifications";
import { EmptyPanel } from "@/components/member/empty-panel";
import { MarkNotificationReadButton } from "@/components/member/mark-notification-read-button";
import { MemberPageHeader } from "@/components/member/member-page-header";
import { PendingSubmitButton } from "@/components/ui/pending-submit-button";
import { requireMemberId } from "@/server/auth/member-context";
import { loadNotifications } from "@/server/services/member-portal-service";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Notifications",
  robots: { index: false, follow: false },
};

export default async function MemberNotificationsPage() {
  const { memberId } = await requireMemberId();
  const items = await loadNotifications(memberId);
  const unreadCount = items.filter((item) => !item.read).length;

  return (
    <>
      <MemberPageHeader
        title="Notifications"
        description="In-app notices for your membership account."
        actions={
          unreadCount > 0 ? (
            <form action={markAllNotificationsReadAction}>
              <PendingSubmitButton
                size="sm"
                variant="outline"
                pendingLabel="Updating…"
              >
                Mark all as read
              </PendingSubmitButton>
            </form>
          ) : undefined
        }
      />
      <div className="p-4 sm:p-6 lg:p-8">
        {items.length === 0 ? (
          <EmptyPanel
            title="No notifications"
            body="You are all caught up. Payment and membership notices will appear here."
          />
        ) : (
          <ul className="space-y-3">
            {items.map((item) => (
              <li
                key={item.id}
                className="rounded-xl border border-border-subtle bg-surface-raised p-5 shadow-xs"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-display text-lg font-semibold text-ink-900">
                        {item.title}
                      </h2>
                      {!item.read ? (
                        <span className="text-xs font-semibold uppercase tracking-wide text-alta-600">
                          Unread
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-ink-600">
                      {item.body}
                    </p>
                    <p className="mt-2 font-mono text-xs text-ink-400">
                      {item.createdAt}
                    </p>
                  </div>
                  {!item.read ? (
                    <MarkNotificationReadButton notificationId={item.id} />
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
