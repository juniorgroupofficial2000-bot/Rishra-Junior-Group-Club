import { logoutAction } from "@/app/(auth)/actions";
import { PendingSubmitButton } from "@/components/ui/pending-submit-button";
import { MemberPageHeader } from "@/components/member/member-page-header";
import { requireMemberId } from "@/server/auth/member-context";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Settings",
  robots: { index: false, follow: false },
};

export default async function MemberSettingsPage() {
  const { session } = await requireMemberId();

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
          <Link
            href="/member/profile"
            className="mt-4 inline-flex min-h-11 items-center text-sm font-medium text-ink-800 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            View profile
          </Link>
        </section>

        <section className="max-w-xl rounded-xl border border-border-subtle bg-surface-raised p-5 shadow-xs">
          <h2 className="font-display text-lg font-semibold text-ink-900">
            Session
          </h2>
          <p className="mt-2 text-sm text-ink-600">
            Sign out clears your secure session cookie on this device.
          </p>
          <form action={logoutAction} className="mt-4">
            <PendingSubmitButton variant="accent" pendingLabel="Signing out…">
              Sign out securely
            </PendingSubmitButton>
          </form>
        </section>

        <section className="max-w-xl rounded-xl border border-dashed border-border-strong bg-surface-muted/50 p-5">
          <h2 className="font-display text-lg font-semibold text-ink-900">
            Password and preferences
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-600">
            Password changes and notification preferences are managed by the
            committee. Contact the club if you need your sign-in details
            updated.
          </p>
          <Link
            href="/contact"
            className="mt-4 inline-flex min-h-11 items-center text-sm font-medium text-ink-800 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Contact the club
          </Link>
        </section>
      </div>
    </>
  );
}
