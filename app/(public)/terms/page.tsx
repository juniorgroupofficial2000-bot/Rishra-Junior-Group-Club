import { ContentPlaceholder, PublicPageShell } from "@/components/public";
import { siteConfig } from "@/content/site";
import { metadataForPage } from "@/lib/public-metadata";

export const metadata = metadataForPage("terms");

export default function TermsPage() {
  return (
    <PublicPageShell pageKey="terms">
      <p className="mb-6 text-sm text-ink-500">
        Last updated: {siteConfig.legal.termsUpdated}
      </p>
      <ContentPlaceholder
        title="Terms of use"
        body="Full terms will be published after legal review. Do not treat this page as operative terms yet."
      />
    </PublicPageShell>
  );
}
