import { AlbumMediaGrid } from "@/components/gallery";
import { ProvenanceBadge } from "@/components/heritage/provenance-badge";
import { SiteContainer } from "@/components/public";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import {
  getAlbumBySlug,
  getPublishedAlbums,
  galleryPageCopy,
} from "@/content/gallery";
import { siteConfig } from "@/content/site";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getPublishedAlbums().map((album) => ({ slug: album.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const album = getAlbumBySlug(slug);
  if (!album) return { title: "Album not found" };

  return {
    title: album.title.replace(/^\[SAMPLE\]\s*/, ""),
    description: album.description,
    alternates: { canonical: `/gallery/${album.slug}` },
    openGraph: {
      title: `${album.title} · ${siteConfig.name}`,
      description: album.description,
      url: `/gallery/${album.slug}`,
      images: [
        {
          url: album.coverImage.src,
          width: album.coverImage.width,
          height: album.coverImage.height,
          alt: album.coverImage.alt,
        },
      ],
    },
  };
}

export default async function GalleryAlbumPage({ params }: PageProps) {
  const { slug } = await params;
  const album = getAlbumBySlug(slug);
  if (!album) notFound();

  return (
    <>
      <SiteContainer as="header" className="pb-6 pt-8 sm:pb-8 sm:pt-10">
        <Breadcrumbs
          className="mb-5"
          items={[
            { label: "Home", href: "/" },
            { label: galleryPageCopy.title, href: "/gallery" },
            { label: album.title },
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
          {album.title}
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-ink-500">
          {album.description}
        </p>
      </SiteContainer>
      <SiteContainer className="pb-16 sm:pb-20">
        <AlbumMediaGrid media={album.media} />
        <p className="mt-10">
          <Link
            href="/gallery"
            className="text-sm font-medium text-ink-800 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            ← All albums
          </Link>
        </p>
      </SiteContainer>
    </>
  );
}
