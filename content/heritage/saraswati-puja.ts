import { siteConfig } from "../site";
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
 * Saraswati Puja flagship page content — CMS-ready collections.
 * SAMPLE years/blocks are labelled and must not be treated as real archive records.
 */

export const saraswatiPujaContent = {
  hero: {
    eyebrow: "Flagship tradition",
    title: "Saraswati Puja",
    support:
      "Celebrated by Rishra Junior Group Club since 1 February 2000 — a gathering of learning, devotion, and neighbourhood togetherness.",
    image: {
      id: "puja-hero",
      src: "/images/heritage/puja-hero.svg",
      alt: "Placeholder hero photograph for Saraswati Puja",
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
      "[PLACEHOLDER: Verified narrative on how the celebration began and how it has been sustained in Morepukur, Natun Gram.]",
    ],
    image: {
      id: "puja-history",
      src: "/images/heritage/puja-history.svg",
      alt: "Placeholder image for Saraswati Puja history",
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
      "[SAMPLE] In the days before the puja, members prepare the pandal, decorations, and community arrangements. This SAMPLE copy shows how the section will read once verified details are provided.",
      "[PLACEHOLDER: Confirmed preparation traditions, responsibilities, and volunteer roles.]",
    ],
    image: {
      id: "puja-prep",
      src: "/images/heritage/puja-prep.svg",
      alt: "SAMPLE placeholder for puja preparation",
      width: 1400,
      height: 1000,
      provenance: "sample" as const,
    },
    provenance: "sample" as const,
  } satisfies PujaSectionBlock,
  pujaDay: {
    id: "puja",
    title: "Puja",
    body: [
      "[SAMPLE] On the day of worship, the community gathers for rituals honouring Goddess Saraswati. Replace this SAMPLE description with verified ceremonial details from the club.",
      "[PLACEHOLDER: Timing, ritual sequence, and hospitality notes when confirmed.]",
    ],
    image: {
      id: "puja-ritual",
      src: "/images/heritage/puja-ritual.svg",
      alt: "SAMPLE placeholder for puja day",
      width: 1400,
      height: 1000,
      provenance: "sample" as const,
    },
    provenance: "sample" as const,
  } satisfies PujaSectionBlock,
  cultural: {
    id: "cultural",
    title: "Cultural activities",
    body: [
      "[SAMPLE] Cultural programmes — music, recitation, and children’s performances — often accompany the celebration. This is SAMPLE framing only.",
      "[PLACEHOLDER: List verified cultural programmes once documented.]",
    ],
    image: {
      id: "puja-culture",
      src: "/images/heritage/puja-culture.svg",
      alt: "SAMPLE placeholder for cultural activities",
      width: 1400,
      height: 1000,
      provenance: "sample" as const,
    },
    provenance: "sample" as const,
  } satisfies PujaSectionBlock,
  memories: {
    id: "memories",
    title: "Community memories",
    body: [
      "Saraswati Puja is where neighbours meet, children take part, and the club renews its shared identity each year.",
      "[PLACEHOLDER: Short member recollections — only with permission and verification.]",
    ],
    image: {
      id: "puja-memories",
      src: "/images/heritage/puja-memories.svg",
      alt: "Placeholder image for community memories",
      width: 1400,
      height: 1000,
      provenance: "placeholder" as const,
    },
    provenance: "placeholder" as const,
  } satisfies PujaSectionBlock,
  photoGalleries: {
    title: "Photo galleries",
    description:
      "Curated frames from the puja archive. SAMPLE images are labelled and should be replaced with verified photographs.",
    images: [
      {
        id: "pg1",
        src: "/images/heritage/gallery-h1.svg",
        alt: "SAMPLE puja gallery image 1",
        width: 1200,
        height: 1200,
        provenance: "sample" as const,
      },
      {
        id: "pg2",
        src: "/images/heritage/gallery-h2.svg",
        alt: "SAMPLE puja gallery image 2",
        width: 1200,
        height: 900,
        provenance: "sample" as const,
      },
      {
        id: "pg3",
        src: "/images/heritage/gallery-h3.svg",
        alt: "SAMPLE puja gallery image 3",
        width: 1200,
        height: 1400,
        provenance: "sample" as const,
      },
      {
        id: "pg4",
        src: "/images/heritage/gallery-h4.svg",
        alt: "SAMPLE puja gallery image 4",
        width: 1200,
        height: 1200,
        provenance: "sample" as const,
      },
    ] satisfies HeritageMedia[],
  },
  archive: {
    title: "Annual celebration archive",
    description:
      "Year-based records of Saraswati Puja. SAMPLE years demonstrate archive cards for the future CMS — they are not verified celebration years beyond the known start in 2000.",
    years: [
      {
        id: "archive-2000",
        year: 2000,
        title: "Saraswati Puja 2000",
        summary:
          "The club’s Saraswati Puja tradition begins on 1 February 2000. Further details for this year will be added from verified records.",
        coverImage: {
          id: "arch-2000",
          src: "/images/heritage/timeline-2000.svg",
          alt: "Placeholder cover for Saraswati Puja 2000",
          width: 1600,
          height: 1000,
          provenance: "placeholder",
        },
        highlights: [
          "Organizing since 1 February 2000",
          "[PLACEHOLDER: Verified highlight for 2000]",
        ],
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
          "/images/heritage/archive-sample-a.svg",
          "SAMPLE archive cover 2012",
        ),
        highlights: [
          "[SAMPLE] Highlight one",
          "[SAMPLE] Highlight two",
        ],
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
          "/images/heritage/archive-sample-b.svg",
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
          "/images/heritage/archive-sample-c.svg",
          "SAMPLE archive cover 2024",
        ),
        published: true,
        provenance: "sample",
      },
    ] satisfies PujaArchiveYear[],
  },
  previousYears: {
    title: "Previous years",
    description:
      "A compact index of archived celebrations. SAMPLE years are labelled.",
  },
  upcoming: {
    title: "Upcoming celebration",
    body: [
      "[SAMPLE] Next Saraswati Puja details will appear here once the committee publishes dates and programme notes.",
      "[PLACEHOLDER: Confirmed date, venue notes, and participation information.]",
    ],
    provenance: "sample" as const,
    cta: { label: "Contact the club", href: "/contact" },
    venueNote: `${siteConfig.address.line1}, ${siteConfig.address.line2}`,
  },
} as const;

export function getPublishedArchiveYears(): PujaArchiveYear[] {
  return [...saraswatiPujaContent.archive.years]
    .filter((year) => year.published)
    .sort((a, b) => b.year - a.year);
}
