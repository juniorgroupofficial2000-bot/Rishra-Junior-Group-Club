import { CommitteeCard } from "@/components/club/committee-card";
import { FadeIn, Stagger, StaggerItem } from "@/components/motion/fade-in";
import { SiteContainer } from "@/components/public/site-container";
import { homeContent } from "@/content/home";
import { HomeLink } from "./home-link";
import { HomeSectionHeading } from "./home-section-heading";

const content = homeContent.committee;

export function HomeCommittee() {
  return (
    <section
      aria-labelledby="home-committee-heading"
      className="border-b border-border-subtle py-16 sm:py-24"
    >
      <SiteContainer>
        <FadeIn>
          <HomeSectionHeading
            eyebrow={content.eyebrow}
            title={content.title}
            description={content.description}
            titleId="home-committee-heading"
            actions={<HomeLink {...content.cta} appearance="outline" />}
          />
        </FadeIn>
        <Stagger className="mt-10 grid gap-4 md:grid-cols-3">
          {content.members.map((member) => (
            <StaggerItem key={member.id}>
              <CommitteeCard name={member.name} role={member.role} />
            </StaggerItem>
          ))}
        </Stagger>
      </SiteContainer>
    </section>
  );
}
