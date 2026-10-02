import { PublicPageShell } from "@/components/public";
import { metadataForPage } from "@/lib/public-metadata";

export const metadata = metadataForPage("faq");

export default function FaqPage() {
  return <PublicPageShell pageKey="faq" />;
}
