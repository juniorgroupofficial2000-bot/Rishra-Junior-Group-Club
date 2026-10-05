import { siteConfig } from "../site";
import {
  includeSampleContent,
  isSampleProvenance,
} from "@/content/include-sample";
import type { HeritageMedia, PujaArchiveYear, PujaSectionBlock } from "./types";

const sampleCover = (
  id: string,
  src: string,
  alt: string,
): HeritageMedia => ({
  id,
  src,
  alt,
  width: 1200,
  height: 900,
  provenance: "sample",
});

/**
 * Saraswati Puja flagship page content.
 * SAMPLE years exist for local demos only (CONTENT_INCLUDE_SAMPLE=true).
 * Do not invent ceremonial details or archive years.
 */

export const saraswatiPujaContent = {
  hero: {
    eyebrow: "Flagship tradition",
    title: "Saraswati Puja",
    support:
      "Celebrated by Rishra Junior Group Club since 1 February 2000 — a gathering of learning, devotion, and neighbourhood togetherness.",
    image: {
      id: "puja-hero",
      src: "/images/heritage/puja-hero.jpg",
      alt: "Saraswati Puja at Rishra Junior Group Club",
      width: 2400,
      height: 1400,
      provenance: "placeholder" as const,
    },
    ctas: [
      { label: "Browse archive", href: "#annual-archive" },
      { label: "Upcoming celebration", href: "#upcoming" },
    ],
  },
  history: {
    id: "history",
    title: "History of the celebration",
    body: [
      "The club has organized Saraswati Puja since 1 February 2000.",
      "Further historical detail will be published when verified by the committee.",
    ],
    image: {
      id: "puja-history",
      src: "/images/heritage/puja-history.jpg",
      alt: "Saraswati Puja history",
      width: 1600,
      height: 1100,
      provenance: "placeholder" as const,
    },
    provenance: "verified" as const,
  } satisfies PujaSectionBlock & { provenance: "verified" },
  preparation: {
    id: "preparation",
    title: "Preparation",
    body: [
      "Ahead of the celebration, members prepare the pandal, decorations, and community arrangements.",
      "Detailed preparation notes will be published when confirmed by the committee.",
    ],
    image: {
      id: "puja-prep",
      src: "/images/heritage/puja-prep.jpg",
      alt: "Preparing for Saraswati Puja",
      width: 1400,
      height: 1000,
      provenance: "placeholder" as const,
    },
    provenance: "verified" as const,
  } satisfies PujaSectionBlock,
  pujaDay: {
    id: "puja",
    title: "Puja day",
    body: [
      "On the day of worship, the community gathers for rituals honouring Goddess Saraswati.",
      "Timing and programme details will be published when the committee confirms them.",
    ],
    image: {
      id: "puja-ritual",
      src: "/images/heritage/puja-ritual.jpg",
      alt: "Saraswati Puja day",
      width: 1400,
      height: 1000,
      provenance: "placeholder" as const,
    },
    provenance: "verified" as const,
  } satisfies PujaSectionBlock,
  cultural: {
    id: "cultural",
    title: "Cultural activities",
    body: [
      "Cultural programmes often accompany the celebration — music, recitation, and performances by children and neighbours.",
      "A confirmed programme list will appear here when published by the committee.",
    ],
    image: {
      id: "puja-culture",
      src: "/images/heritage/puja-culture.jpg",
      alt: "Cultural activities during Saraswati Puja",
      width: 1400,
      height: 1000,
      provenance: "placeholder" as const,
    },
    provenance: "verified" as const,
  } satisfies PujaSectionBlock,
  memories: {
    id: "memories",
    title: "Community memories",
    body: [
      "Saraswati Puja is where neighbours meet, children take part, and the club renews its shared identity each year.",
      "Member recollections will be published here only with permission and verification.",
    ],
    image: {
      id: "puja-memories",
      src: "/images/heritage/puja-memories.jpg",
      alt: "Community memories from Saraswati Puja",
      width: 1400,
      height: 1000,
      provenance: "placeholder" as const,
    },
    provenance: "verified" as const,
  } satisfies PujaSectionBlock,
  photoGalleries: {
    title: "Photo galleries",
    description:
      "Photographs from the puja archive appear here when published.",
    images: [
      {
        id: "pg1",
        src: "/images/heritage/gallery-h1.jpg",
        alt: "Saraswati Puja photograph 1",
        width: 1200,
        height: 1200,
        provenance: "sample" as const,
      },
      {
        id: "pg2",
        src: "/images/heritage/gallery-h2.jpg",
        alt: "Saraswati Puja photograph 2",
        width: 1200,
        height: 900,
        provenance: "sample" as const,
      },
      {
        id: "pg3",
        src: "/images/heritage/gallery-h3.jpg",
        alt: "Saraswati Puja photograph 3",
        width: 1200,
        height: 1400,
        provenance: "sample" as const,
      },
      {
        id: "pg4",
        src: "/images/heritage/gallery-h4.jpg",
        alt: "Saraswati Puja photograph 4",
        width: 1200,
        height: 1200,
        provenance: "sample" as const,
      },
    ] satisfies HeritageMedia[],
  },
  archive: {
    title: "Annual celebration archive",
    description:
      "Year-based records of Saraswati Puja. Additional years are added as the committee verifies them.",
    years: [
      {
        id: "archive-2000",
        year: 2000,
        title: "Saraswati Puja 2000",
        summary:
          "The club’s Saraswati Puja tradition begins on 1 February 2000. Further details for this year will be added from verified records.",
        coverImage: {
          id: "arch-2000",
          src: "/images/heritage/timeline-2000.jpg",
          alt: "Saraswati Puja 2000",
          width: 1600,
          height: 1000,
          provenance: "placeholder",
        },
        highlights: ["Organizing since 1 February 2000"],
        href: "/saraswati-puja/2000",
        published: true,
        provenance: "verified",
      },
      {
        id: "archive-sample-a",
        year: 2012,
        title: "[SAMPLE] Saraswati Puja 2012",
        summary:
          "[SAMPLE] Example archive card for a later year. Not a verified record — replace with real year data in the admin panel.",
        coverImage: sampleCover(
          "arch-sample-a",
          "/images/heritage/archive-sample-a.jpg",
          "SAMPLE archive cover 2012",
        ),
        highlights: ["[SAMPLE] Highlight one", "[SAMPLE] Highlight two"],
        published: true,
        provenance: "sample",
      },
      {
        id: "archive-sample-b",
        year: 2018,
        title: "[SAMPLE] Saraswati Puja 2018",
        summary:
          "[SAMPLE] Example archive card showing summary, cover image, and highlights layout.",
        coverImage: sampleCover(
          "arch-sample-b",
          "/images/heritage/archive-sample-b.jpg",
          "SAMPLE archive cover 2018",
        ),
        highlights: ["[SAMPLE] Community gathering"],
        published: true,
        provenance: "sample",
      },
      {
        id: "archive-sample-c",
        year: 2024,
        title: "[SAMPLE] Saraswati Puja 2024",
        summary:
          "[SAMPLE] Recent-year card pattern for the archive grid. Remove or replace when real data is available.",
        coverImage: sampleCover(
          "arch-sample-c",
          "/images/heritage/archive-sample-c.jpg",
          "SAMPLE archive cover 2024",
        ),
        published: true,
        provenance: "sample",
      },
    ] satisfies PujaArchiveYear[],
  },
  previousYears: {
    title: "Previous years",
    description: "A compact index of archived celebrations.",
  },
  upcoming: {
    title: "Upcoming celebration",
    body: [
      "Dates and programme notes for the next Saraswati Puja will be published here when the committee confirms them.",
    ],
    provenance: "verified" as const,
    cta: { label: "Contact the club", href: "/contact" },
    venueNote: `${siteConfig.address.line1}, ${siteConfig.address.line2}`,
  },
} as const;

export function getPublishedArchiveYears(): PujaArchiveYear[] {
  const allowSample = includeSampleContent();
  return [...saraswatiPujaContent.archive.years]
    .filter((year) => year.published)
    .filter((year) => allowSample || !isSampleProvenance(year.provenance))
    .sort((a, b) => b.year - a.year);
}

export function getPublishedPujaGalleryImages(): HeritageMedia[] {
  const allowSample = includeSampleContent();
  return saraswatiPujaContent.photoGalleries.images.filter(
    (image) => allowSample || !isSampleProvenance(image.provenance),
  );
}
