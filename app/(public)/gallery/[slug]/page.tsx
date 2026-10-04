import { AlbumMediaGrid } from "@/components/gallery";
import { ProvenanceBadge } from "@/components/heritage/provenance-badge";
import { SiteContainer } from "@/components/public";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { galleryPageCopy } from "@/content/gallery";
import { JsonLd } from "@/lib/json-ld";
import { buildMetadata, notFoundMetadata } from "@/lib/seo/metadata";
import {
  breadcrumbJsonLd,
  organizationJsonLd,
  webPageJsonLd,
} from "@/lib/seo/structured-data";
import {
  loadPublishedAlbumBySlug,
  loadPublishedAlbums,
} from "@/server/content/public-loaders";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  try {
    const albums = await loadPublishedAlbums();
    return albums.map((album) => ({ slug: album.slug }));
  } catch {
    // Build hosts may lack DB access; pages still render on demand.
    return [];
  }
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const album = await loadPublishedAlbumBySlug(slug);
  if (!album) return notFoundMetadata("Album not found");

  return buildMetadata({
    title: album.title.replace(/^\[SAMPLE\]\s*/i, ""),
    description: album.description,
    path: `/gallery/${album.slug}`,
    noIndex: album.provenance === "sample",
    image: album.coverImage
      ? {
          url: album.coverImage.src,
          width: album.coverImage.width,
          height: album.coverImage.height,
          alt: album.coverImage.alt,
        }
      : undefined,
  });
}

export default async function GalleryAlbumPage({ params }: PageProps) {
  const { slug } = await params;
  const album = await loadPublishedAlbumBySlug(slug);
  if (!album) notFound();

  const title = album.title.replace(/^\[SAMPLE\]\s*/i, "");

  return (
    <>
      <JsonLd
        data={[
          organizationJsonLd(),
          webPageJsonLd({
            path: `/gallery/${album.slug}`,
            name: `${title} · Rishra Junior Group Club`,
            description: album.description,
            breadcrumbs: [
              { name: "Home", path: "/" },
              { name: galleryPageCopy.title, path: "/gallery" },
              { name: title, path: `/gallery/${album.slug}` },
            ],
          }),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: galleryPageCopy.title, path: "/gallery" },
            { name: title, path: `/gallery/${album.slug}` },
          ]),
        ]}
      />
      <SiteContainer as="header" className="pb-6 pt-8 sm:pb-8 sm:pt-10">
        <Breadcrumbs
          className="mb-5"
          items={[
            { label: "Home", href: "/" },
            { label: galleryPageCopy.title, href: "/gallery" },
            { label: title },
          ]}
        />
        <div className="flex flex-wrap items-center gap-2">
          <ProvenanceBadge provenance={album.provenance} />
          {album.year ? (
            <span className="font-mono text-sm font-semibold text-alta-600">
              {album.year}
            </span>
          ) : null}
          {album.event ? (
            <span className="text-sm text-ink-500">{album.event}</span>
          ) : null}
        </div>
        <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl">
          {title}
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-ink-500">
          {album.description}
        </p>
      </SiteContainer>
      <SiteContainer className="min-w-0 pb-16 sm:pb-20">
        <AlbumMediaGrid media={album.media} />
        <p className="mt-10">
          <Link
            href="/gallery"
            className="text-sm font-medium text-ink-800 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            All albums
          </Link>
        </p>
      </SiteContainer>
    </>
  );
}
