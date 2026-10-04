/**
 * Public DTO types for organizational committees.
 * Runtime data always comes from the database loaders.
 */

export type PublicCommitteeSeat = {
  id: string;
  memberId: string;
  designation: string;
  role: string;
  displayName: string;
  name: string;
  shortBio?: string;
  displayOrder: number;
  portraitSrc?: string;
  portraitAlt?: string;
  termYear?: number;
};

export type PublicCommitteeCard = {
  id: string;
  slug: string;
  name: string;
  summary?: string;
  description?: string;
  iconKey?: string;
  kind: "EXECUTIVE" | "SUB";
  termYear?: number;
  memberCount: number;
  displayOrder: number;
  coverSrc?: string;
  coverAlt?: string;
  imageSrc?: string;
  imageAlt?: string;
};

export type PublicCommitteeDetail = PublicCommitteeCard & {
  responsibilities?: string;
  seats: PublicCommitteeSeat[];
  chairperson?: PublicCommitteeSeat;
  convenor?: PublicCommitteeSeat;
  events: Array<{
    id: string;
    slug: string;
    title: string;
    startsAt: string;
  }>;
  announcements: Array<{
    id: string;
    slug: string;
    title: string;
    publishedAt?: string;
  }>;
};

export type MemberCommitteeInvolvement = {
  committeeId: string;
  committeeSlug: string;
  committeeName: string;
  designation: string;
  role: string;
  termLabel?: string;
};

export type CommitteeSearchHit = {
  id: string;
  displayName: string;
  role: string;
  committeeName: string;
  committeeSlug: string;
};
