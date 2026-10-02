import { MemberPageHeader } from "@/components/member/member-page-header";
import { requireMemberId } from "@/server/auth/member-context";
import { loadMemberProfile } from "@/server/services/member-portal-service";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Profile",
  robots: { index: false, follow: false },
};

export default async function MemberProfilePage() {
  const { userId } = await requireMemberId();
  const profile = await loadMemberProfile(userId);
  if (!profile) notFound();

  return (
    <>
      <MemberPageHeader
        title="Profile"
        description="Your membership profile. Sensitive identity documents are never shown here."
      />
      <div className="p-4 sm:p-6 lg:p-8">
        <dl className="max-w-xl space-y-4 rounded-xl border border-border-subtle bg-surface-raised p-5 text-sm shadow-xs">
          <div>
            <dt className="text-ink-500">Name</dt>
            <dd className="mt-1 font-medium text-ink-900">{profile.displayName}</dd>
          </div>
          <div>
            <dt className="text-ink-500">Membership number</dt>
            <dd className="mt-1 font-mono text-ink-900">{profile.membershipNumber}</dd>
          </div>
          <div>
            <dt className="text-ink-500">Email</dt>
            <dd className="mt-1 text-ink-900">{profile.email}</dd>
          </div>
          <div>
            <dt className="text-ink-500">Phone</dt>
            <dd className="mt-1 text-ink-900">{profile.phoneMasked}</dd>
          </div>
          <div>
            <dt className="text-ink-500">Status</dt>
            <dd className="mt-1 capitalize text-ink-900">{profile.status}</dd>
          </div>
          <div>
            <dt className="text-ink-500">Address on file</dt>
            <dd className="mt-1 text-ink-900">{profile.addressLine}</dd>
          </div>
        </dl>
      </div>
    </>
  );
}
