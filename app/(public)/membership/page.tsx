import { PublicPageShell } from "@/components/public";
import { metadataForPage } from "@/lib/public-metadata";

export const metadata = metadataForPage("membership");

export default function MembershipPage() {
  return <PublicPageShell pageKey="membership" />;
}
