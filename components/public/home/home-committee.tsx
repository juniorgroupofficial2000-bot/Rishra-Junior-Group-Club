"use client";

import { CommitteeMemberCard } from "@/components/committee/committee-member-card";
import { Reveal } from "@/components/motion";
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

  const sequence: CommitteeMember[] = [
    ...(president ? [president] : []),
    ...(secretary ? [secretary] : []),
    ...(treasurer ? [treasurer] : []),
    ...vps,
  ];

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

        <div className="mx-auto mt-10 grid max-w-4xl grid-cols-2 gap-4 lg:grid-cols-4">
          {sequence.map((member, index) => (
            <CommitteeMemberCard
              key={member.id}
              member={member}
              featured={member.roleKey === "president"}
              index={index}
            />
          ))}
        </div>
      </SiteContainer>
    </section>
  );
}
