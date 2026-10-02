import { AlbumGrid } from "@/components/gallery";
import { PublicPageShell } from "@/components/public";
import { galleryPageCopy, getPublishedAlbums } from "@/content/gallery";
import { siteConfig } from "@/content/site";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gallery",
  description: galleryPageCopy.description,
  alternates: { canonical: "/gallery" },
  openGraph: {
    title: `Gallery · ${siteConfig.name}`,
    description: galleryPageCopy.description,
    url: "/gallery",
    type: "website",
  },
};

export default function GalleryPage() {
  const albums = getPublishedAlbums();

  return (
    <PublicPageShell pageKey="gallery">
      <AlbumGrid albums={albums} />
      <p className="mt-10 max-w-2xl text-sm text-ink-500">
        SAMPLE albums demonstrate the CMS-ready album architecture. Replace media
        under <code className="font-mono text-xs">public/images/gallery</code>{" "}
        and update <code className="font-mono text-xs">content/gallery.ts</code>.
      </p>
    </PublicPageShell>
  );
}
