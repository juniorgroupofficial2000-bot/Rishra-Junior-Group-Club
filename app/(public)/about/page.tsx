import { Reveal } from "@/components/motion";
import { EditorialPageHero } from "@/components/public/editorial-page-hero";
import { SiteContainer } from "@/components/public/site-container";
import { aboutStory } from "@/content/about-story";
import { publicPages } from "@/content/pages";
import { siteMedia } from "@/content/site-media";
import { JsonLd } from "@/lib/json-ld";
import { metadataForPublicPage } from "@/lib/seo/metadata";
import { webPageJsonLd } from "@/lib/seo/structured-data";
import Link from "next/link";

export const metadata = metadataForPublicPage("about");

export default function AboutPage() {
  const page = publicPages.about;

  return (
    <>
      <JsonLd
        data={webPageJsonLd({
          path: page.path,
          name: `${page.title} · Rishra Junior Group Club`,
          description: page.description,
          breadcrumbs: [
            { name: "Home", path: "/" },
            { name: page.title, path: page.path },
          ],
        })}
      />
      <EditorialPageHero
        layout="split"
        crumbs={[
          { label: "Home", href: "/" },
          { label: page.title },
        ]}
        eyebrow={page.eyebrow ?? "The club"}
        title={page.title}
        description={page.description}
        media={siteMedia.about}
        actions={
          <>
            <Link
              href="/committee"
              className="inline-flex min-h-11 items-center rounded-md bg-alta-500 px-4 text-sm font-semibold text-white hover:bg-alta-600"
            >
              Meet the committee
            </Link>
            <Link
              href="/history"
              className="inline-flex min-h-11 items-center rounded-md border border-border-default px-4 text-sm font-medium text-ink-800 hover:bg-ink-50"
            >
              Club history
            </Link>
          </>
        }
      />

      <SiteContainer className="pb-20 pt-12 sm:pb-28 sm:pt-16">
        <div className="grid gap-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] lg:gap-20">
          <Reveal>
            <article className="space-y-6 text-base leading-relaxed text-ink-700 sm:text-lg">
              <p>{aboutStory.lead}</p>
              {aboutStory.paragraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 24)}>{paragraph}</p>
              ))}
            </article>
          </Reveal>

          <Reveal delay={0.08}>
            <aside className="border-l border-alta-400 pl-6 sm:pl-8">
              <p className="type-caption text-ink-400">Since</p>
              <p className="mt-2 font-display text-6xl font-semibold tracking-tight text-ink-900">
                2000
              </p>
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-500">
                Continuous Saraswati Puja and neighbourhood programmes from
                Morepukur, Natun Gram.
              </p>
              <Link
                href="/contact"
                className="mt-8 inline-flex min-h-11 items-center text-sm font-semibold text-alta-600 underline-offset-4 hover:underline"
              >
                Visit or write to us →
              </Link>
            </aside>
          </Reveal>
        </div>
      </SiteContainer>
    </>
  );
}
