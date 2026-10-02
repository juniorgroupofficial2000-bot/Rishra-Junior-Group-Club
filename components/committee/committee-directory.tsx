import { CommitteeCard } from "@/components/club/committee-card";
import { FadeIn, Stagger, StaggerItem } from "@/components/motion/fade-in";
import {
  committeePageCopy,
  getCommitteeGroups,
  type CommitteeMember,
} from "@/content/committee";

function memberLabel(member: CommitteeMember) {
  return `${member.role} — ${member.displayName}`;
}

export function CommitteeDirectory() {
  const groups = getCommitteeGroups();

  return (
    <div className="space-y-14">
      {groups.map((group) => (
        <section
          key={group.key}
          aria-labelledby={`committee-group-${group.key}`}
        >
          <FadeIn>
            <h2
              id={`committee-group-${group.key}`}
              className="font-display text-2xl font-semibold tracking-tight text-ink-900"
            >
              {group.title}
            </h2>
            {group.description ? (
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-500">
                {group.description}
              </p>
            ) : null}
          </FadeIn>
          <Stagger className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {group.members.map((member) => (
              <StaggerItem key={member.id}>
                <CommitteeCard
                  name={member.displayName}
                  role={member.role}
                  description={memberLabel(member)}
                />
              </StaggerItem>
            ))}
          </Stagger>
        </section>
      ))}

      <FadeIn>
        <aside className="rounded-xl border border-border-subtle bg-surface-muted px-5 py-4 text-sm leading-relaxed text-ink-600">
          <p className="font-medium text-ink-800">Privacy</p>
          <p className="mt-1">{committeePageCopy.privacyNote}</p>
        </aside>
      </FadeIn>
    </div>
  );
}
