"use client";

import { CommitteeMemberCard } from "@/components/committee/committee-member-card";
import { Reveal } from "@/components/motion";
import { SiteContainer } from "@/components/public/site-container";
import type { CommitteeMember } from "@/content/committee";
import { homeContent, type HomeContent } from "@/content/home";
import { HomeLink } from "./home-link";
import { HomeSectionHeading } from "./home-section-heading";

function pickPreview(members: CommitteeMember[]) {
  const president = members.find((m) => m.roleKey === "president");
  const secretary = members.find((m) => m.roleKey === "secretary");
  const treasurer = members.find((m) => m.roleKey === "treasurer");
  const vps = members.filter((m) => m.roleKey === "vice_president").slice(0, 2);
  return { president, secretary, treasurer, vps };
}

export function HomeCommittee({
  members = [],
  content = homeContent.committee,
}: {
  members?: CommitteeMember[];
  content?: HomeContent["committee"];
} = {}) {
  const { president, secretary, treasurer, vps } = pickPreview(members);
  const officers = [secretary, treasurer, ...vps].filter(
    Boolean,
  ) as CommitteeMember[];

  if (!president && officers.length === 0) return null;

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
          <div className="mt-12">
            <CommitteeMemberCard
              member={president}
              variant="featured"
              description={
                president.biography ??
                `${president.role} of Rishra Junior Group Club.`
              }
              index={0}
            />
          </div>
        ) : null}

        {officers.length > 0 ? (
          <div className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {officers.map((member, index) => (
              <CommitteeMemberCard
                key={member.id}
                member={member}
                variant="secondary"
                index={index + 1}
              />
            ))}
          </div>
        ) : null}
      </SiteContainer>
    </section>
  );
}
