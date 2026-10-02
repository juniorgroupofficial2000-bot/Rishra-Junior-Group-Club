import { CommitteeMemberCard } from "@/components/committee/committee-member-card";
import { Reveal, StaggerChildren, StaggerItem } from "@/components/motion";
import {
  committeePageCopy,
  getPublishedCommitteeMembers,
  type CommitteeMember,
} from "@/content/committee";

function byRole(members: CommitteeMember[], roleKey: CommitteeMember["roleKey"]) {
  return members.filter((member) => member.roleKey === roleKey);
}

export function CommitteeDirectory() {
  const members = getPublishedCommitteeMembers();
  const president = byRole(members, "president")[0];
  const secretary = byRole(members, "secretary")[0];
  const treasurer = byRole(members, "treasurer")[0];
  const vicePresidents = byRole(members, "vice_president");
  const executives = byRole(members, "executive_member");

  return (
    <div className="space-y-16">
      {president ? (
        <section aria-labelledby="committee-president">
          <Reveal>
            <p className="type-caption text-alta-600">Leadership</p>
            <h2 id="committee-president" className="type-h2 mt-2 text-ink-900">
              President
            </h2>
          </Reveal>
          <div className="mx-auto mt-8 max-w-md">
            <Reveal delay={0.05}>
              <CommitteeMemberCard
                member={president}
                featured
                description={`${president.role} of Rishra Junior Group Club.`}
              />
            </Reveal>
          </div>
        </section>
      ) : null}

      {(secretary || treasurer) && (
        <section aria-labelledby="committee-officers">
          <Reveal>
            <h2 id="committee-officers" className="type-h2 text-ink-900">
              Officers
            </h2>
          </Reveal>
          <StaggerChildren className="mt-8 grid gap-5 sm:grid-cols-2">
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
          </StaggerChildren>
        </section>
      )}

      {vicePresidents.length > 0 ? (
        <section aria-labelledby="committee-vp">
          <Reveal>
            <h2 id="committee-vp" className="type-h2 text-ink-900">
              Vice Presidents
            </h2>
          </Reveal>
          <StaggerChildren className="mt-8 grid gap-5 sm:grid-cols-2">
            {vicePresidents.map((member) => (
              <StaggerItem key={member.id}>
                <CommitteeMemberCard member={member} />
              </StaggerItem>
            ))}
          </StaggerChildren>
        </section>
      ) : null}

      {executives.length > 0 ? (
        <section aria-labelledby="committee-exec">
          <Reveal>
            <h2 id="committee-exec" className="type-h2 text-ink-900">
              Executive members
            </h2>
          </Reveal>
          <StaggerChildren className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {executives.map((member) => (
              <StaggerItem key={member.id}>
                <CommitteeMemberCard member={member} />
              </StaggerItem>
            ))}
          </StaggerChildren>
        </section>
      ) : null}

      <Reveal>
        <aside className="rounded-2xl border border-border-subtle bg-festival-wash px-5 py-5 text-sm leading-relaxed text-ink-600 sm:px-6">
          <p className="font-semibold text-ink-800">Privacy</p>
          <p className="mt-1">{committeePageCopy.privacyNote}</p>
        </aside>
      </Reveal>
    </div>
  );
}
