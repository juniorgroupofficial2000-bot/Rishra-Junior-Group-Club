/**
 * CMS-ready heritage content shapes.
 * Entries with `provenance: "sample"` are illustrative only — not verified history.
 * Entries with `provenance: "verified"` use confirmed club facts only.
 */

import type { ContentProvenance } from "../shared/media";
import type { PujaLiveStatus } from "@/lib/puja/status";

export type { ContentProvenance };

export type HeritageMedia = {
  id: string;
  src: string;
  alt: string;
  width: number;
  height: number;
  caption?: string;
  category?: string;
  provenance: ContentProvenance;
};

/** Vertical timeline entry — maps cleanly to a future admin/CMS collection. */
export type TimelineEntry = {
  id: string;
  /** Display year label (e.g. "2000", "2024", or "—" when unknown). */
  year: string;
  /** Optional ISO date for sorting/filtering when known (YYYY-MM-DD). */
  date?: string;
  title: string;
  description: string;
  image?: HeritageMedia;
  gallery?: HeritageMedia[];
  milestone: boolean;
  /** Ascending order for CMS reordering. */
  sortOrder: number;
  published: boolean;
  provenance: ContentProvenance;
};

export type PujaScheduleItem = {
  id: string;
  stage: string;
  stageLabel: string;
  title: string;
  description?: string;
  startsAt?: string;
  endsAt?: string;
  sortOrder: number;
  liveStatus: PujaLiveStatus | null;
};

export type PujaDocumentLink = {
  title: string;
  url: string;
};

export type PujaVideoLink = {
  title: string;
  url: string;
  poster?: string;
};

export type PujaArchiveYear = {
  id: string;
  year: number;
  title: string;
  summary: string;
  theme?: string;
  startsOn?: string;
  endsOn?: string;
  locationLabel?: string;
  locationDetail?: string;
  committeeNote?: string;
  coverImage?: HeritageMedia;
  highlights?: string[];
  gallery?: HeritageMedia[];
  videos?: PujaVideoLink[];
  documents?: PujaDocumentLink[];
  schedule?: PujaScheduleItem[];
  liveStatus?: PujaLiveStatus | null;
  href?: string;
  published: boolean;
  provenance: ContentProvenance;
};

export type PujaSectionBlock = {
  id: string;
  title: string;
  body: string[];
  image?: HeritageMedia;
  provenance: ContentProvenance;
};
