import { Timeline } from "@/components/club";
import { ContentPlaceholder, PublicPageShell } from "@/components/public";
import { metadataForPage } from "@/lib/public-metadata";

export const metadata = metadataForPage("history");

export default function HistoryPage() {
  return (
    <PublicPageShell pageKey="history">
      <Timeline
        items={[
          {
            id: "2000-puja",
            year: "2000",
            title: "Saraswati Puja begins",
            description:
              "The club has been organizing Saraswati Puja since 1 February 2000.",
          },
          {
            id: "registration",
            year: "—",
            title: "Formal club registration",
            description:
              "[PLACEHOLDER: Registration date, authority, and number when verified.]",
          },
        ]}
      />
      <div className="mt-10">
        <ContentPlaceholder
          title="Additional history"
          body="Further timeline entries will be added from verified club records only."
        />
      </div>
    </PublicPageShell>
  );
}
