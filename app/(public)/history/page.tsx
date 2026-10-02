import { HistoryTimelineLazy } from "@/components/heritage/history-timeline-lazy";
import { SiteContainer } from "@/components/public";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { SectionHeader } from "@/components/ui/section-header";
import {
  getPublishedTimelineEntries,
  historyPageCopy,
} from "@/content/heritage";
import { breadcrumbsForPage } from "@/content/pages";
import { historyPageJsonLd } from "@/lib/heritage-structured-data";
import { JsonLd } from "@/lib/json-ld";
import { metadataForPublicPage } from "@/lib/seo/metadata";

export const metadata = metadataForPublicPage("history");

export default function HistoryPage() {
  const entries = getPublishedTimelineEntries();
  const crumbs = breadcrumbsForPage("history");

  return (
    <>
      <JsonLd data={historyPageJsonLd()} />
      <SiteContainer as="header" className="pb-6 pt-8 sm:pb-8 sm:pt-10">
        <Breadcrumbs items={crumbs} className="mb-5" />
        <SectionHeader
          eyebrow={historyPageCopy.eyebrow}
          title={historyPageCopy.title}
          description={historyPageCopy.description}
          titleAs="h1"
        />
      </SiteContainer>
      <SiteContainer className="min-w-0 pb-16 sm:pb-24">
        <HistoryTimelineLazy entries={entries} />
        <p className="mt-12 max-w-2xl text-sm text-ink-500">
          {historyPageCopy.emptyNote} SAMPLE entries are labelled and exist only
          to demonstrate the CMS-ready timeline layout.
        </p>
      </SiteContainer>
    </>
  );
}
