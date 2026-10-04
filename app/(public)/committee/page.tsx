import { CommitteeExperience } from "@/components/committee/committee-experience";
import { EditorialPageHero } from "@/components/public/editorial-page-hero";
import { SiteContainer } from "@/components/public/site-container";
import { standingCommitteePageCopy } from "@/content/standing-committees";
import { JsonLd } from "@/lib/json-ld";
import { buildMetadata } from "@/lib/seo/metadata";
import { webPageJsonLd } from "@/lib/seo/structured-data";
import {
  loadCommitteeSearchIndex,
  loadHeroMediaBySlot,
  loadPublishedCommitteeMembers,
  loadPublishedCommittees,
} from "@/server/content/public-loaders";

export async function generateMetadata() {
  return buildMetadata({
    title: standingCommitteePageCopy.title,
    description: standingCommitteePageCopy.description,
    path: "/committee",
  });
}

export default async function CommitteePage() {
  const [members, committees, searchIndex, heroMedia] = await Promise.all([
    loadPublishedCommitteeMembers(),
    loadPublishedCommittees(),
    loadCommitteeSearchIndex(),
    loadHeroMediaBySlot("committee.hero"),
  ]);

  return (
    <>
      <JsonLd
        data={webPageJsonLd({
          path: "/committee",
          name: `${standingCommitteePageCopy.title} · Rishra Junior Group Club`,
          description: standingCommitteePageCopy.description,
          breadcrumbs: [
            { name: "Home", path: "/" },
            { name: standingCommitteePageCopy.title, path: "/committee" },
          ],
        })}
      />
      <EditorialPageHero
        layout={heroMedia ? "overlay" : "band"}
        crumbs={[
          { label: "Home", href: "/" },
          { label: standingCommitteePageCopy.title },
        ]}
        eyebrow={standingCommitteePageCopy.eyebrow}
        title={standingCommitteePageCopy.title}
        description={standingCommitteePageCopy.description}
        media={
          heroMedia
            ? {
                id: "committee-hero",
                src: heroMedia.src,
                alt: heroMedia.alt,
                width: heroMedia.width,
                height: heroMedia.height,
              }
            : undefined
        }
      />
      <SiteContainer className="pb-20 pt-14 sm:pb-28 sm:pt-20">
        <CommitteeExperience
          executiveMembers={members}
          committees={committees}
          searchIndex={searchIndex}
        />
        <aside className="mt-20 border-y border-border-subtle py-8 text-sm leading-relaxed text-ink-600">
          <p className="font-semibold text-ink-800">Privacy</p>
          <p className="mt-2 max-w-2xl">
            {standingCommitteePageCopy.privacyNote}
          </p>
        </aside>
      </SiteContainer>
    </>
  );
}
