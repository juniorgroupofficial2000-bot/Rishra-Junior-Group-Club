import { EventCard } from "@/components/club/event-card";
import { FadeIn, Stagger, StaggerItem } from "@/components/motion/fade-in";
import { SiteContainer } from "@/components/public/site-container";
import { homeContent } from "@/content/home";
import { HomeLink } from "./home-link";
import { HomeSectionHeading } from "./home-section-heading";

const content = homeContent.events;

export function HomeEvents() {
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
        <Stagger className="mt-10 grid gap-4 md:grid-cols-2">
          {content.items.map((event) => (
            <StaggerItem key={event.id}>
              <EventCard
                title={event.title}
                dateLabel={event.dateLabel}
                locationLabel={event.locationLabel}
                status={event.status}
                href={event.href}
              />
            </StaggerItem>
          ))}
        </Stagger>
      </SiteContainer>
    </section>
  );
}
