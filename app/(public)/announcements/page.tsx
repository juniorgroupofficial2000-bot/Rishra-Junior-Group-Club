import { AnnouncementList } from "@/components/announcements";
import { Reveal } from "@/components/motion";
import { CatalogFilterBar } from "@/components/public/catalog-filter-bar";
import { EditorialPageHero } from "@/components/public/editorial-page-hero";
import { SiteContainer } from "@/components/public/site-container";
import { noticeChannels } from "@/content/club-roster";
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
        <section>
          <h2 className="font-display text-2xl text-logo-blue">Official communication</h2>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-[#555]">
            Channel tags for broadcasting updates to members.
          </p>
          <ul className="mt-6 grid gap-4 md:grid-cols-2">
            {noticeChannels.map((channel) => (
              <li key={channel.title} className="border border-[#eee] p-4">
                <h3 className="font-display text-lg text-logo-blue">{channel.title}</h3>
                <p className="mt-2 text-sm leading-6">{channel.summary}</p>
              </li>
            ))}
          </ul>
        </section>
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
