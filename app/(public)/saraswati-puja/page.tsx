import {
  PujaArchive,
  PujaHero,
  PujaMasonryGallery,
  PujaScheduleTimeline,
  PujaSection,
  PujaSpotlight,
} from "@/components/heritage";
import { SiteContainer } from "@/components/public";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { saraswatiPujaContent } from "@/content/heritage";
import { breadcrumbsForPage } from "@/content/pages";
import { saraswatiPujaPageJsonLd } from "@/lib/heritage-structured-data";
import { JsonLd } from "@/lib/json-ld";
import { publicPages } from "@/content/pages";
import { buildMetadata } from "@/lib/seo/metadata";
import {
  loadPublishedAnnouncements,
  loadPublishedPujaYears,
} from "@/server/content/public-loaders";
import Link from "next/link";

const page = publicPages["saraswati-puja"];

export const metadata = buildMetadata({
  title: page.title,
  description: page.description,
  path: page.path,
  image: {
    url: saraswatiPujaContent.hero.image.src,
    width: saraswatiPujaContent.hero.image.width,
    height: saraswatiPujaContent.hero.image.height,
    alt: saraswatiPujaContent.hero.image.alt,
  },
});

export default async function SaraswatiPujaPage() {
  const crumbs = breadcrumbsForPage("saraswati-puja");
  const [years, announcements] = await Promise.all([
    loadPublishedPujaYears(),
    loadPublishedAnnouncements(),
  ]);

  const featured =
    years.find(
      (year) =>
        year.liveStatus === "live" ||
        year.liveStatus === "today" ||
        year.liveStatus === "upcoming",
    ) ?? years[0] ?? null;

  const schedule = featured?.schedule ?? [];
  const galleryItems = years.flatMap((year) =>
    (year.gallery ?? []).map((item) => ({ ...item, year: year.year })),
  );
  const pujaAnnouncements = announcements.filter(
    (item) => item.category === "puja",
  );

  return (
    <>
      <JsonLd data={saraswatiPujaPageJsonLd()} />
      <div className="border-b border-border-subtle bg-surface-raised/80">
        <SiteContainer className="py-4">
          <Breadcrumbs items={crumbs} />
        </SiteContainer>
      </div>

      <PujaHero
        status={featured?.liveStatus}
        statusLabel={featured ? featured.title : null}
      />

      <PujaSpotlight year={featured} />

      {schedule.length > 0 ? (
        <section
          id="puja-schedule"
          className="border-b border-border-subtle py-16 sm:py-20"
        >
          <SiteContainer>
            <PujaScheduleTimeline
              items={schedule}
              title={`${featured?.title ?? "Saraswati Puja"} schedule`}
              description="Only stages configured by the committee are shown. Status updates from the published times."
            />
          </SiteContainer>
        </section>
      ) : null}

      <PujaSection section={saraswatiPujaContent.history} />

      {galleryItems.length > 0 ? (
        <section
          id="puja-gallery"
          className="border-y border-border-subtle bg-surface-raised/60 py-16 sm:py-20"
        >
          <SiteContainer>
            <PujaMasonryGallery
              items={galleryItems}
              title="Puja gallery"
              description="Photographs from published archive years. Filter by year or category when available."
              enableYearFilter
            />
          </SiteContainer>
        </section>
      ) : null}

      {pujaAnnouncements.length > 0 ? (
        <section
          id="puja-announcements"
          className="border-b border-border-subtle py-16 sm:py-20"
        >
          <SiteContainer>
            <p className="type-caption text-alta-600">Announcements</p>
            <h2 className="type-h2 mt-2 text-ink-900">Puja notices</h2>
            <ul className="mt-8 divide-y divide-border-subtle border-y border-border-subtle">
              {pujaAnnouncements.slice(0, 6).map((item) => (
                <li key={item.id} className="py-4">
                  <Link
                    href={`/announcements/${item.slug}`}
                    className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <p className="font-display text-xl text-ink-900 transition-colors group-hover:text-alta-600">
                      {item.title}
                    </p>
                    <p className="mt-1 text-sm text-ink-500">{item.summary}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </SiteContainer>
        </section>
      ) : null}

      <PujaArchive years={years} />
    </>
  );
}
