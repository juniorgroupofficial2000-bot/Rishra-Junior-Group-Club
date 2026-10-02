import { ContentPlaceholder, PublicPageShell } from "@/components/public";
import { siteConfig } from "@/content/site";
import { metadataForPage } from "@/lib/public-metadata";

export const metadata = metadataForPage("privacy");

export default function PrivacyPage() {
  return (
    <PublicPageShell pageKey="privacy">
      <p className="mb-6 text-sm text-ink-500">
        Last updated: {siteConfig.legal.privacyUpdated}
      </p>
      <ContentPlaceholder
        title="Privacy policy"
        body="Full privacy policy text will be published after legal review. Do not treat this page as an operative policy yet."
      />
    </PublicPageShell>
  );
}
