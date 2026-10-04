/**
 * Seed fixtures for standing (sub-)committees.
 *
 * Runtime pages MUST load from `Committee` / `CommitteeMembership` via
 * public loaders — never import these arrays as a fallback.
 */

export type StandingCommitteeSeedMember = {
  firstName: string;
  lastName: string;
  designation: string;
  displayOrder: number;
};

export type StandingCommitteeSeed = {
  slug: string;
  name: string;
  summary: string;
  description: string;
  responsibilities: string;
  iconKey: string;
  displayOrder: number;
  members: StandingCommitteeSeedMember[];
};

export const standingCommitteePageCopy = {
  eyebrow: "Organization",
  title: "Leadership & Committees",
  description:
    "Rishra Junior Group Club is driven by members working together across leadership and standing committees — each focused on a different part of club life.",
  subCommitteesTitle: "Committees That Keep the Club Moving",
  subCommitteesDescription:
    "Standing committees carry programmes, welfare, youth, and outreach. Explore who leads each area.",
  emptyCommittees:
    "Active committees will appear here once the club publishes them.",
  emptyMembers: "Committee members will be announced soon.",
  privacyNote:
    "Individual phone numbers, emails, and other personal details are not published. For club matters, use the Contact page.",
  searchPlaceholder: "Search committee members…",
} as const;

export const standingCommitteeSeeds: StandingCommitteeSeed[] = [
  {
    slug: "animal-welfare",
    name: "Animal & Welfare Committee",
    summary: "Caring beyond the club",
    description:
      "Coordinates animal care and community welfare initiatives supported by the club.",
    responsibilities:
      "Plan and support animal-welfare and community-care activities; coordinate with volunteers; report progress to the Executive Committee.",
    iconKey: "paw-print",
    displayOrder: 20,
    members: [
      {
        firstName: "Rohit",
        lastName: "Barma",
        designation: "member",
        displayOrder: 10,
      },
      {
        firstName: "Nayan",
        lastName: "Halder",
        designation: "member",
        displayOrder: 20,
      },
      {
        firstName: "Dipak",
        lastName: "Burman",
        designation: "member",
        displayOrder: 30,
      },
    ],
  },
  {
    slug: "marketing-sponsorship",
    name: "Marketing & Sponsorship Committee",
    summary: "Partners and outreach",
    description:
      "Builds sponsorship relationships and communicates club programmes to the wider community.",
    responsibilities:
      "Develop sponsorship proposals; maintain partner relationships; support programme visibility with the Executive Committee.",
    iconKey: "megaphone",
    displayOrder: 30,
    members: [
      {
        firstName: "Vikash",
        lastName: "Dwivedi",
        designation: "member",
        displayOrder: 10,
      },
      {
        firstName: "Suraj",
        lastName: "Prasad",
        designation: "member",
        displayOrder: 20,
      },
      {
        firstName: "Bharat",
        lastName: "Barma",
        designation: "member",
        displayOrder: 30,
      },
    ],
  },
  {
    slug: "sports-youth",
    name: "Sports & Youth Committee",
    summary: "Energy on the ground",
    description:
      "Organizes sports and youth engagement activities that keep the club active year-round.",
    responsibilities:
      "Schedule sports and youth programmes; coordinate volunteers and venues; keep the Executive Committee informed of outcomes.",
    iconKey: "trophy",
    displayOrder: 40,
    members: [
      {
        firstName: "Bittu",
        lastName: "Burman",
        designation: "member",
        displayOrder: 10,
      },
      {
        firstName: "Arun",
        lastName: "Burman",
        designation: "member",
        displayOrder: 20,
      },
      {
        firstName: "Raunak",
        lastName: "Shaw",
        designation: "member",
        displayOrder: 30,
      },
      {
        firstName: "Shubham",
        lastName: "Sharma",
        designation: "member",
        displayOrder: 40,
      },
    ],
  },
];
