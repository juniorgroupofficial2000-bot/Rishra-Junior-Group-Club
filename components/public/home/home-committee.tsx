import { CommitteeMemberCard } from "@/components/committee/committee-member-card";
import { Reveal, StaggerChildren, StaggerItem } from "@/components/motion";
import { SiteContainer } from "@/components/public/site-container";
import {
  getPublishedCommitteeMembers,
  type CommitteeMember,
} from "@/content/committee";
import { homeContent } from "@/content/home";
import { HomeLink } from "./home-link";
import { HomeSectionHeading } from "./home-section-heading";

const content = homeContent.committee;

function pickPreview(members: CommitteeMember[]) {
  const president = members.find((m) => m.roleKey === "president");
  const secretary = members.find((m) => m.roleKey === "secretary");
  const treasurer = members.find((m) => m.roleKey === "treasurer");
  const vps = members.filter((m) => m.roleKey === "vice_president").slice(0, 2);
  return { president, secretary, treasurer, vps };
}

export function HomeCommittee() {
  const members = getPublishedCommitteeMembers();
  const { president, secretary, treasurer, vps } = pickPreview(members);

  return (
    <section
      aria-labelledby="home-committee-heading"
      className="border-b border-border-subtle bg-festival-wash py-20 sm:py-28"
    >
      <SiteContainer>
        <Reveal>
          <HomeSectionHeading
            eyebrow={content.eyebrow}
            title={content.title}
            description={content.description}
            titleId="home-committee-heading"
            actions={<HomeLink {...content.cta} appearance="outline" />}
          />
        </Reveal>

        {president ? (
          <div className="mx-auto mt-12 max-w-md lg:max-w-lg">
            <Reveal delay={0.05}>
              <CommitteeMemberCard member={president} featured />
            </Reveal>
          </div>
        ) : null}

        <StaggerChildren className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {secretary ? (
            <StaggerItem>
              <CommitteeMemberCard member={secretary} />
            </StaggerItem>
          ) : null}
          {treasurer ? (
            <StaggerItem>
              <CommitteeMemberCard member={treasurer} />
            </StaggerItem>
          ) : null}
          {vps.map((member) => (
            <StaggerItem key={member.id}>
              <CommitteeMemberCard member={member} />
            </StaggerItem>
          ))}
        </StaggerChildren>
      </SiteContainer>
    </section>
  );
}
