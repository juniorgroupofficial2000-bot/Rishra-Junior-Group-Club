/**
 * Committee types + seed fixture for local CMS bootstrap.
 *
 * Runtime public pages MUST load from `PublicCommitteeMember` via
 * `loadPublishedCommitteeMembers()` — never import the array below as a
 * fallback. Privacy: only role + display name are public.
 */

export type CommitteeRoleKey =
  | "president"
  | "vice_president"
  | "secretary"
  | "treasurer"
  | "executive_member";

export type CommitteeMember = {
  id: string;
  roleKey: CommitteeRoleKey;
  /** Official role label shown publicly */
  role: string;
  /** Legal / formal name */
  name: string;
  /** Optional familiar name shown in parentheses */
  familiarName?: string;
  /** Precomputed public label, e.g. "Satrudhan Burman (Monu)" */
  displayName: string;
  biography?: string;
  termYear?: number;
  sortOrder: number;
  published: boolean;
  /** Managed media delivery URL when a portrait asset is linked. */
  portraitSrc?: string;
  portraitAlt?: string;
};

export const committeePageCopy = {
  eyebrow: "Leadership",
  title: "Committee",
  description:
    "The committee that guides Rishra Junior Group Club. Public listings show names and roles only.",
  privacyNote:
    "Individual phone numbers, emails, and other personal details are not published. For club matters, use the Contact page.",
} as const;

export const committeeMembers: CommitteeMember[] = [
  {
    id: "cm-president",
    roleKey: "president",
    role: "President",
    name: "Satrudhan Burman",
    familiarName: "Monu",
    displayName: "Satrudhan Burman (Monu)",
    sortOrder: 10,
    published: true,
  },
  {
    id: "cm-vp-1",
    roleKey: "vice_president",
    role: "Vice President",
    name: "Suraj Kumar Burman",
    displayName: "Suraj Kumar Burman",
    sortOrder: 20,
    published: true,
  },
  {
    id: "cm-secretary",
    roleKey: "secretary",
    role: "Secretary",
    name: "Bishal Pandey",
    displayName: "Bishal Pandey",
    sortOrder: 40,
    published: true,
  },
  {
    id: "cm-treasurer",
    roleKey: "treasurer",
    role: "Treasurer",
    name: "Aalok Barma",
    displayName: "Aalok Barma",
    sortOrder: 50,
    published: true,
  },
  {
    id: "cm-exec-1",
    roleKey: "executive_member",
    role: "Executive Member",
    name: "Sashikant Tiwari",
    displayName: "Sashikant Tiwari",
    sortOrder: 60,
    published: true,
  },
  {
    id: "cm-exec-2",
    roleKey: "executive_member",
    role: "Executive Member",
    name: "Chandan Sharma",
    displayName: "Chandan Sharma",
    sortOrder: 70,
    published: true,
  },
  {
    id: "cm-exec-3",
    roleKey: "executive_member",
    role: "Committee Member",
    name: "Gopal Burman",
    displayName: "Gopal Burman",
    sortOrder: 80,
    published: true,
  },
];

export type CommitteeGroup = {
  key: string;
  title: string;
  description?: string;
  members: CommitteeMember[];
};

const groupOrder: Array<{
  key: string;
  title: string;
  description?: string;
  roleKeys: CommitteeRoleKey[];
}> = [
  {
    key: "officers",
    title: "Office bearers",
    description: "President, Vice President, Secretary, and Treasurer.",
    roleKeys: ["president", "vice_president", "secretary", "treasurer"],
  },
  {
    key: "executive",
    title: "Committee members",
    description: "General and executive members of the committee.",
    roleKeys: ["executive_member"],
  },
];

export function getPublishedCommitteeMembers(): CommitteeMember[] {
  return [...committeeMembers]
    .filter((member) => member.published)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export function getCommitteeGroups(): CommitteeGroup[] {
  const members = getPublishedCommitteeMembers();
  return groupOrder
    .map((group) => ({
      key: group.key,
      title: group.title,
      description: group.description,
      members: members.filter((member) =>
        group.roleKeys.includes(member.roleKey),
      ),
    }))
    .filter((group) => group.members.length > 0);
}

/** Compact preview for homepage / other surfaces (no PII beyond display name). */
export function getCommitteePreview(limit = 3): CommitteeMember[] {
  return getPublishedCommitteeMembers().slice(0, limit);
}
