import { ContentPlaceholder, PublicPageShell } from "@/components/public";
import { metadataForPage } from "@/lib/public-metadata";

export const metadata = metadataForPage("saraswati-puja");

export default function SaraswatiPujaPage() {
  return (
    <PublicPageShell pageKey="saraswati-puja">
      <ContentPlaceholder
        title="Puja archive"
        body="Year-by-year archive entries, photos, and notes will appear here once curated. Organizing since 1 February 2000."
      />
    </PublicPageShell>
  );
}
