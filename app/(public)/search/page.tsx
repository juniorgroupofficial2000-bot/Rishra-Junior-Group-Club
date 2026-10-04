import { CatalogFilterBar } from "@/components/public/catalog-filter-bar";
import { EditorialPageHero } from "@/components/public/editorial-page-hero";
import { SiteContainer } from "@/components/public/site-container";
import { Badge } from "@/components/ui/badge";
import { metadataForPublicPage } from "@/lib/seo/metadata";
import { searchPublicContent } from "@/server/services/search-service";
import Link from "next/link";

export const metadata = metadataForPublicPage("search");

const TYPE_LABEL: Record<string, string> = {
  announcement: "Announcement",
  event: "Event",
  gallery: "Gallery",
  committee: "Committee",
  page: "Page",
};

export default async function PublicSearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const q = params.q?.trim() ?? "";
  const results = q.length >= 2 ? await searchPublicContent(q) : [];
  const pageTitle = "Search";

  return (
    <>
      <EditorialPageHero
        layout="plain"
        crumbs={[
          { label: "Home", href: "/" },
          { label: pageTitle },
        ]}
        eyebrow="Find"
        title={pageTitle}
        description="Search announcements, events, gallery albums, committee members, and key pages."
      />
      <SiteContainer className="space-y-8 pb-20 sm:pb-28">
        <CatalogFilterBar action="/search" query={q} />

        {q.length > 0 && q.length < 2 ? (
          <p className="text-sm text-ink-500">
            Enter at least two characters to search.
          </p>
        ) : null}

        {q.length >= 2 && results.length === 0 ? (
          <p className="border-y border-dashed border-border-strong py-10 text-sm text-ink-500">
            No results for “{q}”.
          </p>
        ) : null}

        {results.length > 0 ? (
          <ul className="divide-y divide-border-subtle border-y border-border-subtle">
            {results.map((item) => (
              <li key={`${item.type}-${item.id}`}>
                <Link
                  href={item.href}
                  className="flex flex-col gap-2 py-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:flex-row sm:items-start sm:justify-between sm:gap-8"
                >
                  <div className="min-w-0 space-y-1">
                    <Badge variant="outline">
                      {TYPE_LABEL[item.type] ?? item.type}
                    </Badge>
                    <h2 className="font-display text-xl font-semibold text-ink-900">
                      {item.title}
                    </h2>
                    <p className="text-sm text-ink-500">{item.summary}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
      </SiteContainer>
    </>
  );
}
