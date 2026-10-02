import { PublicPageShell } from "@/components/public";
import { metadataForPage } from "@/lib/public-metadata";

export const metadata = metadataForPage("events");

export default function EventsPage() {
  return <PublicPageShell pageKey="events" />;
}
