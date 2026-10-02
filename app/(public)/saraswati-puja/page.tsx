import {
  PujaArchive,
  PujaGalleries,
  PujaHero,
  PujaPreviousYears,
  PujaSection,
  PujaUpcoming,
} from "@/components/heritage";
import { SiteContainer } from "@/components/public";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { saraswatiPujaContent } from "@/content/heritage";
import { breadcrumbsForPage } from "@/content/pages";
import { saraswatiPujaPageJsonLd } from "@/lib/heritage-structured-data";
import { JsonLd } from "@/lib/json-ld";
import { buildMetadata } from "@/lib/seo/metadata";

const description =
  "Saraswati Puja at Rishra Junior Group Club — celebrated since 1 February 2000. Explore the archive, preparation, cultural activities, and community memories.";

export const metadata = buildMetadata({
  title: "Saraswati Puja",
  description,
  path: "/saraswati-puja",
  image: {
    url: saraswatiPujaContent.hero.image.src,
    width: saraswatiPujaContent.hero.image.width,
    height: saraswatiPujaContent.hero.image.height,
    alt: saraswatiPujaContent.hero.image.alt,
  },
});

export default function SaraswatiPujaPage() {
  const crumbs = breadcrumbsForPage("saraswati-puja");

  return (
    <>
      <JsonLd data={saraswatiPujaPageJsonLd()} />
      <div className="border-b border-border-subtle bg-surface-raised/80">
        <SiteContainer className="py-4">
          <Breadcrumbs items={crumbs} />
        </SiteContainer>
      </div>
      <PujaHero />
      <PujaSection section={saraswatiPujaContent.history} />
      <PujaArchive />
      <PujaSection
        section={saraswatiPujaContent.preparation}
        tone="raised"
      />
      <PujaSection section={saraswatiPujaContent.pujaDay} reverse />
      <PujaSection
        section={saraswatiPujaContent.cultural}
        tone="raised"
      />
      <PujaSection section={saraswatiPujaContent.memories} reverse />
      <PujaGalleries />
      <PujaPreviousYears />
      <PujaUpcoming />
    </>
  );
}
