import type { TimelineEntry } from "./types";

/**
 * Club history timeline — data-driven for future CMS/admin management.
 *
 * Rules:
 * - `provenance: "verified"` = confirmed facts only
 * - `provenance: "sample"` = SAMPLE layout/demo content (not real history)
 * - `provenance: "placeholder"` = slot awaiting verified copy
 */

export const timelineEntries: TimelineEntry[] = [
  {
    id: "tl-2000-saraswati-puja",
    year: "2000",
    date: "2000-02-01",
    title: "Saraswati Puja begins",
    description:
      "Rishra Junior Group Club has been organizing Saraswati Puja since 1 February 2000.",
    image: {
      id: "img-tl-2000",
      src: "/images/heritage/timeline-2000.svg",
      alt: "Placeholder image for the first Saraswati Puja era",
      width: 1600,
      height: 1000,
      caption: "Replace with a verified archive photograph from 2000.",
      provenance: "placeholder",
    },
    gallery: [
      {
        id: "img-tl-2000-g1",
        src: "/images/heritage/gallery-h1.svg",
        alt: "Placeholder gallery frame for early celebrations",
        width: 1200,
        height: 1200,
        provenance: "placeholder",
      },
      {
        id: "img-tl-2000-g2",
        src: "/images/heritage/gallery-h2.svg",
        alt: "Placeholder gallery frame for early celebrations",
        width: 1200,
        height: 900,
        provenance: "placeholder",
      },
    ],
    milestone: true,
    sortOrder: 10,
    published: true,
    provenance: "verified",
  },
  {
    id: "tl-sample-community-growth",
    year: "SAMPLE",
    title: "[SAMPLE] Community gatherings grow",
    description:
      "[SAMPLE] Illustrative timeline entry showing how a mid-era milestone would appear. Not a verified historical event — replace or remove from the admin CMS.",
    image: {
      id: "img-tl-sample",
      src: "/images/heritage/timeline-sample.svg",
      alt: "SAMPLE placeholder photograph for a mid-era milestone",
      width: 1600,
      height: 1000,
      caption: "SAMPLE media — not a real club photograph.",
      provenance: "sample",
    },
    gallery: [
      {
        id: "img-tl-sample-g1",
        src: "/images/heritage/gallery-h3.svg",
        alt: "SAMPLE gallery image",
        width: 1200,
        height: 1400,
        provenance: "sample",
      },
    ],
    milestone: false,
    sortOrder: 20,
    published: true,
    provenance: "sample",
  },
  {
    id: "tl-formal-registration",
    year: "—",
    title: "Formal club registration",
    description:
      "[PLACEHOLDER: Registration date, registering authority, and registration number — to be added when verified. The club has recently become formally registered.]",
    image: {
      id: "img-tl-reg",
      src: "/images/heritage/timeline-reg.svg",
      alt: "Placeholder image for formal club registration",
      width: 1600,
      height: 1000,
      provenance: "placeholder",
    },
    milestone: true,
    sortOrder: 30,
    published: true,
    provenance: "placeholder",
  },
];

export function getPublishedTimelineEntries(): TimelineEntry[] {
  return [...timelineEntries]
    .filter((entry) => entry.published)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export const historyPageCopy = {
  eyebrow: "Since 2000",
  title: "Club history",
  description:
    "A living timeline of Rishra Junior Group Club. Verified milestones appear first; SAMPLE entries demonstrate the future CMS layout and are clearly labelled.",
  emptyNote:
    "Additional timeline entries will be published from verified club records only.",
} as const;
