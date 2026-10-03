import {
  MembershipApplicationPanel,
  MembershipCta,
  MembershipSections,
} from "@/components/membership";
import { EditorialPageHero } from "@/components/public/editorial-page-hero";
import { SiteContainer } from "@/components/public/site-container";
import { publicPages } from "@/content/pages";
import { siteMedia } from "@/content/site-media";
import { JsonLd } from "@/lib/json-ld";
import { metadataForPublicPage } from "@/lib/seo/metadata";
import { webPageJsonLd } from "@/lib/seo/structured-data";
import Link from "next/link";

export const metadata = metadataForPublicPage("membership");

export default function MembershipPage() {
  const page = publicPages.membership;

  return (
    <>
      <JsonLd
        data={webPageJsonLd({
          path: page.path,
          name: `${page.title} · Rishra Junior Group Club`,
          description: page.description,
          breadcrumbs: [
            { name: "Home", path: "/" },
            { name: page.title, path: page.path },
          ],
        })}
      />
      <EditorialPageHero
        layout="split"
        crumbs={[
          { label: "Home", href: "/" },
          { label: page.title },
        ]}
        eyebrow={page.eyebrow}
        title={page.title}
        description={page.description}
        media={siteMedia.membership}
        actions={
          <Link
            href="/login"
            className="inline-flex min-h-11 items-center rounded-md bg-alta-500 px-4 text-sm font-semibold text-white hover:bg-alta-600"
          >
            Member login
          </Link>
        }
      />
      <SiteContainer className="space-y-16 pb-20 pt-12 sm:space-y-20 sm:pb-28 sm:pt-16">
        <MembershipSections />
        <MembershipApplicationPanel />
        <MembershipCta />
      </SiteContainer>
    </>
  );
}
