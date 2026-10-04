import { AnnouncementList } from "@/components/announcements";
import { Reveal } from "@/components/motion";
import { CatalogFilterBar } from "@/components/public/catalog-filter-bar";
import { EditorialPageHero } from "@/components/public/editorial-page-hero";
import { SiteContainer } from "@/components/public/site-container";
import {
  announcementCategoryLabel,
  type AnnouncementCategory,
} from "@/content/announcements";
import { publicPages } from "@/content/pages";
import { JsonLd } from "@/lib/json-ld";
import { metadataForPublicPage } from "@/lib/seo/metadata";
import { webPageJsonLd } from "@/lib/seo/structured-data";
import { loadPublishedAnnouncements } from "@/server/content/public-loaders";

export const metadata = metadataForPublicPage("announcements");

const CATEGORIES = (
  Object.keys(announcementCategoryLabel) as AnnouncementCategory[]
).map((value) => ({
  value,
  label: announcementCategoryLabel[value],
}));

export default async function AnnouncementsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const params = await searchParams;
  const q = params.q?.trim() || undefined;
  const category = params.category?.trim() || undefined;
  const items = await loadPublishedAnnouncements({ q, category });
  const page = publicPages.announcements;

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
      <SiteContainer className="space-y-10 pb-20 pt-10 sm:pb-28 sm:pt-14">
        <CatalogFilterBar
          action="/announcements"
          query={q}
          category={category}
          categories={CATEGORIES}
        />
        <Reveal>
          <AnnouncementList items={items} />
        </Reveal>
      </SiteContainer>
    </>
  );
}
