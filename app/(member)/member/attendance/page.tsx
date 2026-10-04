import { Badge } from "@/components/ui/badge";
import { EmptyPanel } from "@/components/member/empty-panel";
import { MemberPageHeader } from "@/components/member/member-page-header";
import { requireMemberId } from "@/server/auth/member-context";
import { loadAttendance } from "@/server/services/member-portal-service";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Attendance",
  robots: { index: false, follow: false },
};

export default async function MemberAttendancePage() {
  const { memberId } = await requireMemberId();
  const rows = await loadAttendance(memberId);

  return (
    <>
      <MemberPageHeader
        title="Attendance"
        description="Your recorded attendance for club events."
      />
      <div className="p-4 sm:p-6 lg:p-8">
        {rows.length === 0 ? (
          <EmptyPanel
            title="No attendance records"
            body="Attendance will appear after events are marked by the committee."
          />
        ) : (
          <ul className="divide-y divide-border-subtle rounded-xl border border-border-subtle bg-surface-raised shadow-xs">
            {rows.map((row) => (
              <li
                key={row.id}
                className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium text-ink-900">{row.eventTitle}</p>
                  <p className="font-mono text-xs text-ink-500">{row.occurredOn}</p>
                </div>
                <Badge variant="outline">{row.status}</Badge>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
