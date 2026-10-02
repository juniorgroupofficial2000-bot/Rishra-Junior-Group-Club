import { PublicPageShell } from "@/components/public";
import { metadataForPage } from "@/lib/public-metadata";

export const metadata = metadataForPage("committee");

export default function CommitteePage() {
  return <PublicPageShell pageKey="committee" />;
}
