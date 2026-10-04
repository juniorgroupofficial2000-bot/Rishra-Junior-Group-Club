import { metadataForPublicPage } from "@/lib/seo/metadata";
import type { PublicPageKey } from "@/content/pages";
import type { Metadata } from "next";

/** @deprecated Prefer `metadataForPublicPage` from `@/lib/seo`. */
export function metadataForPage(key: PublicPageKey): Metadata {
  return metadataForPublicPage(key);
}
