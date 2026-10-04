import { DigitalMembershipCard } from "@/components/membership/digital-membership-card";
import { SiteContainer } from "@/components/public";
import { membershipQrDataUrl } from "@/lib/membership/qr";
import { loadPublicMemberCardByToken } from "@/server/services/member-card-service";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Membership verification",
  robots: { index: false, follow: false },
};

export default async function VerifyMemberPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const card = await loadPublicMemberCardByToken(token);
  if (!card) notFound();

  const qrDataUrl = await membershipQrDataUrl(card.verifyUrl);

  return (
    <SiteContainer className="py-10 sm:py-16">
      <div className="mx-auto max-w-xl space-y-6">
        <header>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-alta-600">
            Verification
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-ink-900">
            Membership card
          </h1>
          <p className="mt-2 text-sm text-ink-500">
            This page confirms club membership status. It does not reveal phone,
            email, address, or other private details.
          </p>
        </header>

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

        <p
          className={`rounded-md border px-4 py-3 text-sm ${
            card.isActive
              ? "border-emerald-200 bg-emerald-50 text-emerald-900"
              : "border-amber-200 bg-amber-50 text-amber-900"
          }`}
          role="status"
        >
          {card.isActive
            ? "This membership is currently active."
            : `This membership is currently marked as ${card.statusLabel.toLowerCase()}.`}
        </p>
      </div>
    </SiteContainer>
  );
}
