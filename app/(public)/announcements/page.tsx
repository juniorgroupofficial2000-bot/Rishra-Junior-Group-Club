import { PublicPageShell } from "@/components/public";
import { metadataForPage } from "@/lib/public-metadata";

export const metadata = metadataForPage("announcements");

export default function AnnouncementsPage() {
  return <PublicPageShell pageKey="announcements" />;
}
