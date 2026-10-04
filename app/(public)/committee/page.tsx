import { CommitteeDirectory } from "@/components/committee";
import { EditorialPageHero } from "@/components/public/editorial-page-hero";
import { SiteContainer } from "@/components/public/site-container";
import { publicPages } from "@/content/pages";
import { JsonLd } from "@/lib/json-ld";
import { metadataForPublicPage } from "@/lib/seo/metadata";
import { webPageJsonLd } from "@/lib/seo/structured-data";
import { loadPublishedCommitteeMembers } from "@/server/content/public-loaders";

export const metadata = metadataForPublicPage("committee");

export default async function CommitteePage() {
  const members = await loadPublishedCommitteeMembers();
  const page = publicPages.committee;

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
        layout="band"
        crumbs={[
          { label: "Home", href: "/" },
          { label: page.title },
        ]}
        eyebrow={page.eyebrow}
        title={page.title}
        description={page.description}
      />
      <SiteContainer className="pb-20 pt-14 sm:pb-28 sm:pt-20">
        <CommitteeDirectory members={members} />
      </SiteContainer>
    </>
  );
}
