import { logoutAction } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { MemberPageHeader } from "@/components/member/member-page-header";
import { requireMemberSession } from "@/server/auth/session";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings",
  robots: { index: false, follow: false },
};

export default async function MemberSettingsPage() {
  const session = await requireMemberSession();

  return (
    <>
      <MemberPageHeader
        title="Settings"
        description="Account session and security controls."
      />
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        <section className="max-w-xl rounded-xl border border-border-subtle bg-surface-raised p-5 shadow-xs">
          <h2 className="font-display text-lg font-semibold text-ink-900">
            Signed in as
          </h2>
          <p className="mt-2 text-sm text-ink-600">{session.user.email}</p>
          <p className="mt-1 text-xs uppercase tracking-wide text-ink-400">
            Role: {session.user.role}
          </p>
        </section>
        <section className="max-w-xl rounded-xl border border-border-subtle bg-surface-raised p-5 shadow-xs">
          <h2 className="font-display text-lg font-semibold text-ink-900">
            Session
          </h2>
          <p className="mt-2 text-sm text-ink-600">
            Sign out clears your secure session cookie on this device.
          </p>
          <form action={logoutAction} className="mt-4">
            <Button type="submit" variant="accent">
              Sign out securely
            </Button>
          </form>
        </section>
        <p className="max-w-xl text-sm text-ink-500">
          Password change and notification preferences will connect to the
          production identity service when Prisma auth is enabled.
        </p>
      </div>
    </>
  );
}
