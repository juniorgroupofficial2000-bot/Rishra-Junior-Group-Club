import {
  MembershipApplicationPanel,
  MembershipCta,
  MembershipSections,
} from "@/components/membership";
import { PublicPageShell } from "@/components/public";
import { metadataForPublicPage } from "@/lib/seo/metadata";

export const metadata = metadataForPublicPage("membership");

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
