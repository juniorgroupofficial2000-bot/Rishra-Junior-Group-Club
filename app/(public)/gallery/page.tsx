import { PublicPageShell } from "@/components/public";
import { metadataForPage } from "@/lib/public-metadata";

export const metadata = metadataForPage("gallery");

export default function GalleryPage() {
  return <PublicPageShell pageKey="gallery" />;
}
