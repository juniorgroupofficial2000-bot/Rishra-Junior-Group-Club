import { PublicPageShell } from "@/components/public";
import { metadataForPage } from "@/lib/public-metadata";

export const metadata = metadataForPage("about");

export default function AboutPage() {
  return <PublicPageShell pageKey="about" />;
}
