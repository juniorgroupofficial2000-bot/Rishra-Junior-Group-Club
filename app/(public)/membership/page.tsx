import {
  MembershipApplicationPanel,
  MembershipCta,
  MembershipSections,
} from "@/components/membership";
import { PublicPageShell } from "@/components/public";
import { membershipPageCopy } from "@/content/membership";
import { siteConfig } from "@/content/site";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Membership",
  description: membershipPageCopy.description,
  alternates: { canonical: "/membership" },
  openGraph: {
    title: `Membership · ${siteConfig.name}`,
    description: membershipPageCopy.description,
    url: "/membership",
    type: "website",
  },
};

export default function MembershipPage() {
  return (
    <PublicPageShell pageKey="membership">
      <div className="space-y-12">
        <MembershipSections />
        <MembershipApplicationPanel />
        <MembershipCta />
      </div>
    </PublicPageShell>
  );
}
