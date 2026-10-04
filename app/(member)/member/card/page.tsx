import { DigitalMembershipCard } from "@/components/membership/digital-membership-card";
import { EmptyPanel } from "@/components/member/empty-panel";
import { MemberPageHeader } from "@/components/member/member-page-header";
import { membershipQrDataUrl } from "@/lib/membership/qr";
import { requireMemberId } from "@/server/auth/member-context";
import { loadMemberCardForOwner } from "@/server/services/member-card-service";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Membership card",
  robots: { index: false, follow: false },
};

export default async function MemberCardPage() {
  const { memberId } = await requireMemberId();
  const card = await loadMemberCardForOwner(memberId);

  if (!card) {
    return (
      <>
        <MemberPageHeader
          title="Membership card"
          description="Your digital membership card."
        />
        <div className="p-4 sm:p-6 lg:p-8">
          <EmptyPanel
            title="Card unavailable"
            body="Your digital membership card will appear here once your membership record is ready."
          />
        </div>
      </>
    );
  }

  const qrDataUrl = await membershipQrDataUrl(card.verifyUrl);

  return (
    <>
      <MemberPageHeader
        title="Membership card"
        description="Show this card at club events. The QR code only opens a public verification page."
      />
      <div className="space-y-4 p-4 sm:p-6 lg:p-8">
        <div className="max-w-xl">
          <DigitalMembershipCard
            displayName={card.displayName}
            membershipNumber={card.membershipNumber}
            membershipType={card.membershipType}
            statusLabel={card.statusLabel}
            joinedOn={card.joinedOn}
            validThrough={card.validThrough}
            portraitUrl={card.portraitUrl}
            qrDataUrl={qrDataUrl}
          />
        </div>
        <p className="max-w-xl text-sm text-ink-500">
          Verification link:{" "}
          <Link
            href={card.verifyUrl}
            className="font-medium underline-offset-4 hover:underline"
          >
            Open public card
          </Link>
        </p>
      </div>
    </>
  );
}
