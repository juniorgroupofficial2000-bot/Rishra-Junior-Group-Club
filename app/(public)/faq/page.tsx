import { EditorialPageHero } from "@/components/public/editorial-page-hero";
import { SiteContainer } from "@/components/public/site-container";
import { publicPages } from "@/content/pages";
import { JsonLd } from "@/lib/json-ld";
import { metadataForPublicPage } from "@/lib/seo/metadata";
import { faqPageJsonLd, webPageJsonLd } from "@/lib/seo/structured-data";
import { loadPublishedFaqItems } from "@/server/content/public-loaders";

export const metadata = metadataForPublicPage("faq");

export default async function FaqPage() {
  const faqs = await loadPublishedFaqItems();
  const page = publicPages.faq;

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({
            path: page.path,
            name: `${page.title} · Rishra Junior Group Club`,
            description: page.description,
            breadcrumbs: [
              { name: "Home", path: "/" },
              { name: page.title, path: page.path },
            ],
          }),
          faqPageJsonLd(faqs),
        ]}
      />
      <EditorialPageHero
        layout="plain"
        crumbs={[
          { label: "Home", href: "/" },
          { label: page.title },
        ]}
        eyebrow={page.eyebrow}
        title={page.title}
        description={page.description}
      />
      <SiteContainer className="pb-20 sm:pb-28">
        {faqs.length === 0 ? (
          <p className="max-w-2xl text-base leading-relaxed text-ink-500">
            Frequently asked questions will appear here once published by the
            committee.
          </p>
        ) : (
          <ul className="mx-auto max-w-3xl divide-y divide-border-subtle border-y border-border-subtle">
            {faqs.map((faq) => (
              <li key={faq.id} className="py-8">
                <h2 className="font-display text-xl font-semibold tracking-tight text-ink-900 sm:text-2xl">
                  {faq.question}
                </h2>
                <p className="mt-3 whitespace-pre-wrap text-base leading-relaxed text-ink-600">
                  {faq.answer}
                </p>
              </li>
            ))}
          </ul>
        )}
      </SiteContainer>
    </>
  );
}
