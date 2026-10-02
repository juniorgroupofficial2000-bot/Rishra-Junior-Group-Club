import { FadeIn, Stagger, StaggerItem } from "@/components/motion/fade-in";
import { SiteContainer } from "@/components/public/site-container";
import { homeContent } from "@/content/home";
import { HomeImage } from "./home-image";
import { HomeLink } from "./home-link";
import { HomeSectionHeading } from "./home-section-heading";

const content = homeContent.gallery;

export function HomeGallery() {
  return (
    <section
      aria-labelledby="home-gallery-heading"
      className="border-b border-border-subtle py-16 sm:py-24"
    >
      <SiteContainer>
        <FadeIn>
          <HomeSectionHeading
            eyebrow={content.eyebrow}
            title={content.title}
            description={content.description}
            titleId="home-gallery-heading"
            actions={<HomeLink {...content.cta} appearance="outline" />}
          />
        </FadeIn>
        <Stagger className="mt-10 grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3">
          {content.images.map((image, index) => (
            <StaggerItem
              key={image.src}
              className={
                index === 1 || index === 4 ? "md:row-span-2" : undefined
              }
            >
              <HomeImage
                image={image}
                className={
                  index === 1 || index === 4
                    ? "aspect-[3/4] h-full w-full sm:rounded-lg"
                    : "aspect-square w-full sm:rounded-lg"
                }
                imgClassName="transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-safe:hover:scale-[1.03]"
                sizes="(max-width: 768px) 50vw, 33vw"
              />
            </StaggerItem>
          ))}
        </Stagger>
      </SiteContainer>
    </section>
  );
}
