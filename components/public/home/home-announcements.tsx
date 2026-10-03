import { AnnouncementList } from "@/components/announcements";
import { FadeIn } from "@/components/motion/fade-in";
import { SiteContainer } from "@/components/public/site-container";
import type { Announcement } from "@/content/announcements";
import { homeContent, type HomeContent } from "@/content/home";
import { HomeLink } from "./home-link";
import { HomeSectionHeading } from "./home-section-heading";

export function HomeAnnouncements({
  items = [],
  content = homeContent.announcements,
}: {
  items?: Announcement[];
  content?: HomeContent["announcements"];
} = {}) {
  if (items.length === 0) return null;

  return (
    <section
      aria-labelledby="home-announcements-heading"
      className="border-b border-border-subtle bg-surface-raised py-16 sm:py-24"
    >
      <SiteContainer>
        <FadeIn>
          <HomeSectionHeading
            eyebrow={content.eyebrow}
            title={content.title}
            description={content.description}
            titleId="home-announcements-heading"
            actions={<HomeLink {...content.cta} appearance="outline" />}
          />
        </FadeIn>
        <div className="mt-10">
          <AnnouncementList items={items} />
        </div>
      </SiteContainer>
    </section>
  );
}
