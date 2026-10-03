"use client";

import { CommitteeMemberCard } from "@/components/committee/committee-member-card";
import { Reveal } from "@/components/motion";
import { EmptyState } from "@/components/public/empty-state";
import {
  committeePageCopy,
  type CommitteeMember,
} from "@/content/committee";

function byRole(members: CommitteeMember[], roleKey: CommitteeMember["roleKey"]) {
  return members.filter((member) => member.roleKey === roleKey);
}

function termLabel(member: CommitteeMember) {
  return member.termYear ? `Term ${member.termYear}` : undefined;
}

/**
 * Public committee directory — members must come from the database loader.
 * Never fall back to hardcoded file arrays.
 */
export function CommitteeDirectory({
  members,
}: {
  members: CommitteeMember[];
}) {
  if (members.length === 0) {
    return (
      <EmptyState
        title="Committee information will appear here"
        description="Published committee roles are managed in the admin portal. Names appear on this page once the club publishes them."
        action={{ label: "Contact the club", href: "/contact" }}
      />
    );
  }

  const president = byRole(members, "president")[0];
  const secretary = byRole(members, "secretary")[0];
  const treasurer = byRole(members, "treasurer")[0];
  const vicePresidents = byRole(members, "vice_president");
  const executives = byRole(members, "executive_member");
  const officers = [secretary, treasurer, ...vicePresidents].filter(
    Boolean,
  ) as CommitteeMember[];

  let index = 0;

  return (
    <div className="space-y-24 sm:space-y-28">
      {president ? (
        <section aria-labelledby="committee-president">
          <Reveal>
            <p className="type-caption text-alta-600">Leadership</p>
            <h2 id="committee-president" className="sr-only">
              President
            </h2>
          </Reveal>
          <div className="mt-8">
            <CommitteeMemberCard
              member={president}
              variant="featured"
              index={index++}
              description={
                president.biography ??
                `${president.role} of Rishra Junior Group Club.`
              }
              tenureLabel={termLabel(president)}
            />
          </div>
        </section>
      ) : null}

      {officers.length > 0 ? (
        <section aria-labelledby="committee-officers">
          <Reveal>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="type-caption text-ink-400">Officers</p>
                <h2
                  id="committee-officers"
                  className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl"
                >
                  Secretary, Treasurer &amp; Vice Presidents
                </h2>
              </div>
              <p className="max-w-sm text-sm leading-relaxed text-ink-500">
                Day-to-day stewardship of club programmes, membership, and
                accounts.
              </p>
            </div>
          </Reveal>
          <div className="mt-10 grid gap-10 sm:grid-cols-2 xl:grid-cols-4">
            {officers.map((member) => (
              <CommitteeMemberCard
                key={member.id}
                member={member}
                variant="secondary"
                index={index++}
                description={member.biography}
                tenureLabel={termLabel(member)}
              />
            ))}
          </div>
        </section>
      ) : null}

      {executives.length > 0 ? (
        <section aria-labelledby="committee-exec">
          <Reveal>
            <p className="type-caption text-ink-400">Executive body</p>
            <h2
              id="committee-exec"
              className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl"
            >
              Executive members
            </h2>
          </Reveal>
          <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
            {executives.map((member) => (
              <CommitteeMemberCard
                key={member.id}
                member={member}
                variant="grid"
                index={index++}
                tenureLabel={termLabel(member)}
              />
            ))}
          </div>
        </section>
      ) : null}

      <Reveal>
        <aside className="border-y border-border-subtle py-8 text-sm leading-relaxed text-ink-600">
          <p className="font-semibold text-ink-800">Privacy</p>
          <p className="mt-2 max-w-2xl">{committeePageCopy.privacyNote}</p>
        </aside>
      </Reveal>
    </div>
  );
}
