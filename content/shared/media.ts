/**
 * Shared media + provenance types for CMS-ready public content.
 */

export type ContentProvenance = "verified" | "sample" | "placeholder";

export type MediaKind = "image" | "video";

export type MediaItem = {
  id: string;
  kind: MediaKind;
  src: string;
  alt: string;
  width: number;
  height: number;
  caption?: string;
  /** Poster frame for video items */
  poster?: string;
  provenance: ContentProvenance;
};

export function isSampleProvenance(provenance: ContentProvenance): boolean {
  return provenance === "sample";
}
