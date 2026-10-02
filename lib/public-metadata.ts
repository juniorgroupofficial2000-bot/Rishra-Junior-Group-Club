import { publicPages, type PublicPageKey } from "@/content/pages";
import type { Metadata } from "next";

export function metadataForPage(key: PublicPageKey): Metadata {
  const page = publicPages[key];
  return {
    title: key === "home" ? undefined : page.title,
    description: page.description,
  };
}
