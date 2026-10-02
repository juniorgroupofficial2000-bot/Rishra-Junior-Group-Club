/**
 * CMS-ready heritage content shapes.
 * Entries with `provenance: "sample"` are illustrative only — not verified history.
 * Entries with `provenance: "verified"` use confirmed club facts only.
 */

export type ContentProvenance = "verified" | "sample" | "placeholder";

export type HeritageMedia = {
  id: string;
  src: string;
  alt: string;
  width: number;
  height: number;
  caption?: string;
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

export type PujaArchiveYear = {
  id: string;
  year: number;
  title: string;
  summary: string;
  coverImage?: HeritageMedia;
  highlights?: string[];
  gallery?: HeritageMedia[];
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
