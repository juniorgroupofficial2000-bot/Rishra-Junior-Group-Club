import type { ContentProvenance, MediaItem } from "./shared/media";

/**
 * Album-based gallery — CMS-ready collection.
 * SAMPLE albums demonstrate layout only.
 */

export type GalleryAlbum = {
  id: string;
  slug: string;
  title: string;
  description: string;
  year?: number;
  /** Related event label or slug reference for CMS linking */
  event?: string;
  coverImage: MediaItem;
  media: MediaItem[];
  sortOrder: number;
  published: boolean;
  provenance: ContentProvenance;
};

const sampleImage = (
  id: string,
  src: string,
  alt: string,
  width: number,
  height: number,
  caption?: string,
): MediaItem => ({
  id,
  kind: "image",
  src,
  alt,
  width,
  height,
  caption,
  provenance: "sample",
});

export const galleryPageCopy = {
  eyebrow: "Moments",
  title: "Gallery",
  description:
    "Albums from club celebrations and gatherings. SAMPLE albums are labelled and exist to demonstrate the CMS-ready gallery.",
} as const;

export const galleryAlbums: GalleryAlbum[] = [
  {
    id: "album-puja-2026",
    slug: "saraswati-puja-2026",
    title: "[SAMPLE] Saraswati Puja 2026",
    description:
      "[SAMPLE] Example album for Saraswati Puja 2026. Replace with verified photographs when available.",
    year: 2026,
    event: "Saraswati Puja",
    coverImage: sampleImage(
      "cov-puja-2026",
      "/images/gallery/cover-puja-2026.svg",
      "SAMPLE cover for Saraswati Puja 2026",
      1600,
      1000,
    ),
    media: [
      sampleImage(
        "m-puja26-1",
        "/images/gallery/media-01.svg",
        "SAMPLE media — Saraswati Puja 2026",
        1200,
        900,
        "[SAMPLE] Caption placeholder",
      ),
      sampleImage(
        "m-puja26-2",
        "/images/gallery/media-02.svg",
        "SAMPLE media — Saraswati Puja 2026",
        1200,
        1200,
        "[SAMPLE] Caption placeholder",
      ),
      {
        id: "m-puja26-video",
        kind: "video",
        src: "https://example.com/sample-puja-2026.mp4",
        alt: "SAMPLE video — Saraswati Puja 2026",
        width: 1280,
        height: 720,
        caption: "[SAMPLE] Optional video item — replace with hosted club footage",
        poster: "/images/gallery/video-poster.svg",
        provenance: "sample",
      },
      sampleImage(
        "m-puja26-3",
        "/images/gallery/media-03.svg",
        "SAMPLE media — Saraswati Puja 2026",
        1200,
        800,
      ),
    ],
    sortOrder: 10,
    published: true,
    provenance: "sample",
  },
  {
    id: "album-puja-2025",
    slug: "saraswati-puja-2025",
    title: "[SAMPLE] Saraswati Puja 2025",
    description:
      "[SAMPLE] Example album for Saraswati Puja 2025.",
    year: 2025,
    event: "Saraswati Puja",
    coverImage: sampleImage(
      "cov-puja-2025",
      "/images/gallery/cover-puja-2025.svg",
      "SAMPLE cover for Saraswati Puja 2025",
      1600,
      1000,
    ),
    media: [
      sampleImage(
        "m-puja25-1",
        "/images/gallery/media-02.svg",
        "SAMPLE media — Saraswati Puja 2025",
        1200,
        1200,
      ),
      sampleImage(
        "m-puja25-2",
        "/images/gallery/media-04.svg",
        "SAMPLE media — Saraswati Puja 2025",
        1200,
        1200,
        "[SAMPLE] Caption placeholder",
      ),
    ],
    sortOrder: 20,
    published: true,
    provenance: "sample",
  },
  {
    id: "album-sports",
    slug: "sports-day",
    title: "[SAMPLE] Sports Day",
    description: "[SAMPLE] Example Sports Day album for CMS layout.",
    year: 2024,
    event: "Sports Day",
    coverImage: sampleImage(
      "cov-sports",
      "/images/gallery/cover-sports.svg",
      "SAMPLE cover for Sports Day",
      1600,
      1000,
    ),
    media: [
      sampleImage(
        "m-sports-1",
        "/images/gallery/media-03.svg",
        "SAMPLE media — Sports Day",
        1200,
        800,
      ),
      sampleImage(
        "m-sports-2",
        "/images/gallery/media-01.svg",
        "SAMPLE media — Sports Day",
        1200,
        900,
      ),
    ],
    sortOrder: 30,
    published: true,
    provenance: "sample",
  },
  {
    id: "album-cultural",
    slug: "cultural-program",
    title: "[SAMPLE] Cultural Program",
    description: "[SAMPLE] Example Cultural Program album.",
    year: 2024,
    event: "Cultural Program",
    coverImage: sampleImage(
      "cov-cultural",
      "/images/gallery/cover-cultural.svg",
      "SAMPLE cover for Cultural Program",
      1600,
      1000,
    ),
    media: [
      sampleImage(
        "m-cult-1",
        "/images/gallery/media-04.svg",
        "SAMPLE media — Cultural Program",
        1200,
        1200,
      ),
    ],
    sortOrder: 40,
    published: true,
    provenance: "sample",
  },
  {
    id: "album-memories",
    slug: "club-memories",
    title: "[SAMPLE] Club Memories",
    description:
      "[SAMPLE] Cross-year memories album demonstrating uncategorised club photographs.",
    coverImage: sampleImage(
      "cov-memories",
      "/images/gallery/cover-memories.svg",
      "SAMPLE cover for Club Memories",
      1600,
      1000,
    ),
    media: [
      sampleImage(
        "m-mem-1",
        "/images/gallery/media-01.svg",
        "SAMPLE media — Club Memories",
        1200,
        900,
        "[SAMPLE] Memory caption",
      ),
      sampleImage(
        "m-mem-2",
        "/images/gallery/media-02.svg",
        "SAMPLE media — Club Memories",
        1200,
        1200,
      ),
      sampleImage(
        "m-mem-3",
        "/images/gallery/media-03.svg",
        "SAMPLE media — Club Memories",
        1200,
        800,
      ),
    ],
    sortOrder: 50,
    published: true,
    provenance: "sample",
  },
];

export function getPublishedAlbums(): GalleryAlbum[] {
  return [...galleryAlbums]
    .filter((album) => album.published)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export function getAlbumBySlug(slug: string): GalleryAlbum | undefined {
  return getPublishedAlbums().find((album) => album.slug === slug);
}
