import { EventList } from "@/components/events";
import { FadeIn } from "@/components/motion/fade-in";
import { SiteContainer } from "@/components/public/site-container";
import type { ClubEvent } from "@/content/events";
import { homeContent, type HomeContent } from "@/content/home";
import { HomeLink } from "./home-link";
import { HomeSectionHeading } from "./home-section-heading";

export function HomeEvents({
  events = [],
  content = homeContent.events,
}: {
  events?: ClubEvent[];
  content?: HomeContent["events"];
} = {}) {
  if (events.length === 0) return null;

  return (
    <section
      aria-labelledby="home-events-heading"
      className="border-b border-border-subtle bg-surface-raised py-16 sm:py-24"
    >
      <SiteContainer>
        <FadeIn>
          <HomeSectionHeading
            eyebrow={content.eyebrow}
            title={content.title}
            description={content.description}
            titleId="home-events-heading"
            actions={<HomeLink {...content.cta} appearance="outline" />}
          />
        </FadeIn>
        <div className="mt-10">
          <EventList
            events={events}
            emptyLabel="No upcoming events published yet."
          />
        </div>
      </SiteContainer>
    </section>
  );
}
