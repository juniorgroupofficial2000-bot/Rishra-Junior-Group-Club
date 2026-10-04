import {
  PujaMasonryGallery,
  PujaScheduleTimeline,
  PujaStatusBadge,
} from "@/components/heritage";
import { SiteContainer } from "@/components/public";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { buildMetadata } from "@/lib/seo/metadata";
import {
  loadPublishedPujaYearByYear,
  loadPublishedPujaYears,
} from "@/server/content/public-loaders";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{ year: string }>;
};

export async function generateStaticParams() {
  try {
    const years = await loadPublishedPujaYears();
    return years.map((year) => ({ year: String(year.year) }));
  } catch {
    // Build hosts may lack DB access; pages still render on demand.
    return [];
  }
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { year: yearParam } = await params;
  const yearNumber = Number(yearParam);
  if (!Number.isFinite(yearNumber)) {
    return { title: "Saraswati Puja archive" };
  }
  const record = await loadPublishedPujaYearByYear(yearNumber);
  if (!record) {
    return { title: "Saraswati Puja archive" };
  }
  return buildMetadata({
    title: record.title,
    description: record.summary,
    path: `/saraswati-puja/${record.year}`,
    image: record.coverImage
      ? {
          url: record.coverImage.src,
          width: record.coverImage.width,
          height: record.coverImage.height,
          alt: record.coverImage.alt,
        }
      : undefined,
  });
}

function formatRange(startsOn?: string, endsOn?: string) {
  if (!startsOn) return null;
  const start = new Date(startsOn);
  const end = endsOn ? new Date(endsOn) : null;
  const startLabel = start.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  if (!end) return startLabel;
  const endLabel = end.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return startLabel === endLabel ? startLabel : `${startLabel} – ${endLabel}`;
}

export default async function SaraswatiPujaYearPage({ params }: PageProps) {
  const { year: yearParam } = await params;
  const yearNumber = Number(yearParam);
  if (!Number.isFinite(yearNumber)) notFound();

  const record = await loadPublishedPujaYearByYear(yearNumber);
  if (!record) notFound();

  const dates = formatRange(record.startsOn, record.endsOn);
  const gallery = (record.gallery ?? []).map((item) => ({
    ...item,
    year: record.year,
  }));

  return (
    <>
      <div className="border-b border-border-subtle bg-surface-raised/80">
        <SiteContainer className="py-4">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Saraswati Puja", href: "/saraswati-puja" },
              { label: String(record.year), href: `/saraswati-puja/${record.year}` },
            ]}
          />
        </SiteContainer>
      </div>

      <header className="relative isolate overflow-hidden bg-ink-950 text-white">
        {record.coverImage ? (
          <div className="absolute inset-0">
            <Image
              src={record.coverImage.src}
              alt=""
              fill
              priority
              unoptimized={record.coverImage.src.endsWith(".svg")}
              className="object-cover opacity-55"
              sizes="100vw"
            />
            <div
              className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/75 to-ink-950/40"
              aria-hidden
            />
          </div>
        ) : null}
        <SiteContainer className="relative py-16 sm:py-24">
          <div className="flex flex-wrap items-center gap-3">
            <p className="type-caption text-marigold-400">Archive year</p>
            <PujaStatusBadge status={record.liveStatus} />
          </div>
          <h1 className="type-display mt-4 max-w-4xl text-balance">
            {record.title}
          </h1>
          {record.theme ? (
            <p className="mt-4 font-display text-2xl text-marigold-100/90">
              {record.theme}
            </p>
          ) : null}
          <p className="mt-6 max-w-2xl type-body-large text-ink-100">
            {record.summary}
          </p>
          <dl className="mt-8 grid gap-4 sm:grid-cols-2 lg:max-w-3xl">
            {dates ? (
              <div>
                <dt className="type-caption text-ink-300">Dates</dt>
                <dd className="mt-1 text-base text-white">{dates}</dd>
              </div>
            ) : null}
            {record.locationLabel ? (
              <div>
                <dt className="type-caption text-ink-300">Location</dt>
                <dd className="mt-1 text-base text-white">
                  {record.locationLabel}
                  {record.locationDetail ? (
                    <span className="mt-1 block text-sm text-ink-200">
                      {record.locationDetail}
                    </span>
                  ) : null}
                </dd>
              </div>
            ) : null}
          </dl>
        </SiteContainer>
      </header>

      <div className="space-y-16 py-14 sm:space-y-20 sm:py-20">
        {record.schedule?.length ? (
          <SiteContainer>
            <PujaScheduleTimeline items={record.schedule} />
          </SiteContainer>
        ) : null}

        {record.highlights?.length ? (
          <SiteContainer>
            <p className="type-caption text-alta-600">Highlights</p>
            <h2 className="type-h2 mt-2 text-ink-900">What stood out</h2>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {record.highlights.map((item) => (
                <li
                  key={item}
                  className="rounded-xl border border-border-subtle bg-surface-raised px-4 py-4 text-sm text-ink-700"
                >
                  {item}
                </li>
              ))}
            </ul>
          </SiteContainer>
        ) : null}

        {gallery.length > 0 ? (
          <SiteContainer>
            <PujaMasonryGallery
              items={gallery}
              title={`Photographs · ${record.year}`}
              description="Browse the published gallery for this celebration year."
            />
          </SiteContainer>
        ) : null}

        {record.videos?.length ? (
          <SiteContainer>
            <p className="type-caption text-alta-600">Videos</p>
            <h2 className="type-h2 mt-2 text-ink-900">Moving images</h2>
            <ul className="mt-6 space-y-3">
              {record.videos.map((video) => (
                <li key={video.url}>
                  <a
                    href={video.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-11 items-center text-sm font-medium text-ink-800 underline-offset-4 hover:underline"
                  >
                    {video.title}
                  </a>
                </li>
              ))}
            </ul>
          </SiteContainer>
        ) : null}

        {record.committeeNote ? (
          <SiteContainer>
            <p className="type-caption text-alta-600">Committee</p>
            <h2 className="type-h2 mt-2 text-ink-900">Organising note</h2>
            <p className="mt-4 max-w-3xl type-body text-ink-600">
              {record.committeeNote}
            </p>
          </SiteContainer>
        ) : null}

        {record.documents?.length ? (
          <SiteContainer>
            <p className="type-caption text-alta-600">Documents</p>
            <h2 className="type-h2 mt-2 text-ink-900">Published papers</h2>
            <ul className="mt-6 space-y-3">
              {record.documents.map((doc) => (
                <li key={doc.url}>
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-11 items-center text-sm font-medium text-ink-800 underline-offset-4 hover:underline"
                  >
                    {doc.title}
                  </a>
                </li>
              ))}
            </ul>
          </SiteContainer>
        ) : null}

        <SiteContainer>
          <Link
            href="/saraswati-puja#annual-archive"
            className="inline-flex min-h-11 items-center text-sm font-medium text-ink-800 underline-offset-4 hover:underline"
          >
            ← Back to archive
          </Link>
        </SiteContainer>
      </div>
    </>
  );
}
