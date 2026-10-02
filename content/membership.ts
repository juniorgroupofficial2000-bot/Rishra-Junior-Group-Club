/**
 * Public membership information — CMS-ready.
 * Do not invent dues amounts or pricing.
 *
 * Future online applications should use `MembershipApplicationDraft` types
 * and server-only APIs — never expose applicant PII on public pages.
 */

export type MembershipSection = {
  id: string;
  title: string;
  body: string[];
  items?: string[];
};

/**
 * Shape reserved for a future authenticated / server-side application workflow.
 * Not rendered publicly with personal data.
 */
export type MembershipApplicationDraft = {
  /** Opaque client draft id before submission */
  draftId?: string;
  status: "not_started" | "draft" | "submitted" | "under_review" | "accepted" | "declined";
  /** Fields collected later — never logged to public content stores */
  fields?: {
    fullName?: string;
    email?: string;
    phone?: string;
    address?: string;
    notes?: string;
  };
};

export type MembershipApplicationConfig = {
  /** Feature flag for when online applications go live */
  onlineApplicationsEnabled: boolean;
  enquiryHref: string;
  portalHref: string;
  privacyHref: string;
};

export const membershipApplicationConfig: MembershipApplicationConfig = {
  onlineApplicationsEnabled: false,
  enquiryHref: "/contact",
  portalHref: "/membership#member-portal",
  privacyHref: "/privacy",
};

export const membershipPageCopy = {
  eyebrow: "Belong",
  title: "Membership",
  description:
    "Learn how to enquire about joining Rishra Junior Group Club, what membership involves, and how the future member portal will work.",
  cta: {
    title: "Ready to enquire?",
    body: "Reach out through the club’s official contact channels. Online applications will open here when the membership workflow is enabled.",
    primaryLabel: "Contact the club",
    primaryHref: "/contact",
    secondaryLabel: "Meet the committee",
    secondaryHref: "/committee",
  },
} as const;

export const membershipSections: MembershipSection[] = [
  {
    id: "who-can-enquire",
    title: "Who can enquire",
    body: [
      "People with a connection to the club’s community in Rishra — neighbours, families, and supporters interested in participating in club activities — may enquire about membership.",
      "[PLACEHOLDER: Any formal eligibility criteria confirmed by the committee.]",
    ],
  },
  {
    id: "process",
    title: "Membership process",
    body: [
      "Membership begins with an enquiry. The committee reviews interest and shares next steps.",
    ],
    items: [
      "Send an enquiry via the Contact page (or in person when meeting club representatives).",
      "Provide the basic information listed below so the committee can respond.",
      "Await guidance on verification, introduction to the club, and any formal steps.",
      "[PLACEHOLDER: Committee-approved steps after enquiry — interview, proposer, documents, etc.]",
    ],
  },
  {
    id: "benefits",
    title: "Membership benefits",
    body: [
      "Members help sustain the club’s traditions and community work, including Saraswati Puja and other gatherings.",
    ],
    items: [
      "Participation in club activities and celebrations",
      "Voice in community initiatives as defined by club rules",
      "Access to member updates and announcements (when the member portal launches)",
      "[PLACEHOLDER: Additional benefits confirmed by the committee — without inventing dues or perks]",
    ],
  },
  {
    id: "required-information",
    title: "Required information",
    body: [
      "When you enquire, be prepared to share only what the club needs to respond. Do not send identity documents or sensitive data through unofficial channels.",
    ],
    items: [
      "Full name",
      "Preferred contact method (phone or email — shared privately with the club, not published)",
      "Locality / connection to Rishra Junior Group Club",
      "Brief note on why you wish to join",
      "[PLACEHOLDER: Any additional fields the committee will require for formal applications]",
    ],
  },
  {
    id: "enquiry",
    title: "Contact / enquiry process",
    body: [
      "Use the official Contact page for membership enquiries. The club address is listed there for reference.",
      "Personal details you share in an enquiry are treated as private club correspondence — they are not displayed on this website.",
      "A future online application form will submit securely to the club’s systems; until then, contact remains the supported path.",
    ],
  },
  {
    id: "member-portal",
    title: "Member portal introduction",
    body: [
      "A member portal is planned as part of this platform. Signed-in members will eventually manage profile details, view dues history, register for events, and receive announcements.",
      "The portal is not open yet. Public visitors can still learn about membership here and enquire via Contact.",
      "[PLACEHOLDER: Launch timing and first portal features when the committee confirms them.]",
    ],
  },
];

/** Factory for future workflow UI — keeps application state out of public content. */
export function createEmptyMembershipApplication(): MembershipApplicationDraft {
  return { status: "not_started" };
}
