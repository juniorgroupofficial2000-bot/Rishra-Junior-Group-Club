/**
 * Central media configuration for the public site.
 *
 * Replace `src` paths here (and files under /public/images/) when real
 * club photographs are ready. Components should import from this module
 * instead of hardcoding image URLs.
 *
 * English alt text only. Do not invent unverified scenes in alt copy.
 */

import { committeeMembers } from "@/content/committee";

export type SiteMediaSlot = {
  id: string;
  src: string;
  /** Optional mobile / narrow crop */
  srcMobile?: string;
  alt: string;
  width: number;
  height: number;
  /** CSS object-position for portraits / hero crops */
  objectPosition?: string;
  /** Editor note — how to replace this slot */
  note?: string;
};

/**
 * Named site-wide image slots.
 * Prefer these over scattering paths through components.
 */
export const siteMedia = {
  /**
   * Transparent brand mark for chrome (header/footer).
   * Source upload: `/images/home/logo.png`. Cleaned asset: `/brand/logo.png`.
   */
  logo: {
    id: "logo",
    src: "/brand/logo.png",
    alt: "Rishra Junior Group Club logo",
    width: 441,
    height: 467,
    objectPosition: "center",
    note: "Replace public/images/home/logo.png, then regenerate public/brand/logo.png and app favicons.",
  },
  hero: {
    id: "hero",
    src: "/images/home/hero.svg",
    srcMobile: "/images/home/hero.svg",
    alt: "Community atmosphere at Rishra Junior Group Club",
    width: 2400,
    height: 1600,
    objectPosition: "center",
    note: "Replace with a wide Saraswati Puja or community photograph.",
  },
  intro: {
    id: "intro",
    src: "/images/home/intro.svg",
    alt: "Club life in Rishra",
    width: 1600,
    height: 1200,
    objectPosition: "center",
    note: "Replace with a candid club gathering photograph.",
  },
  about: {
    id: "about",
    src: "/images/home/intro.svg",
    alt: "Rishra Junior Group Club community",
    width: 1600,
    height: 1200,
    objectPosition: "center",
    note: "Dedicated about-page photograph when available.",
  },
  puja: {
    id: "puja",
    src: "/images/home/puja.svg",
    alt: "Saraswati Puja at Rishra Junior Group Club",
    width: 1800,
    height: 1200,
    objectPosition: "center 40%",
    note: "Replace with a verified Saraswati Puja photograph.",
  },
  pujaHero: {
    id: "puja-hero",
    src: "/images/heritage/puja-hero.svg",
    alt: "Saraswati Puja hero photograph",
    width: 2400,
    height: 1600,
    objectPosition: "center",
    note: "Flagship heritage hero — prefer a verified archive image.",
  },
  location: {
    id: "location",
    src: "/images/home/location.svg",
    alt: "Morepukur, Natun Gram, Rishra neighbourhood",
    width: 1600,
    height: 1000,
    objectPosition: "center",
    note: "Replace with premises or locality photograph.",
  },
  membership: {
    id: "membership",
    src: "/images/home/intro.svg",
    alt: "Members of Rishra Junior Group Club",
    width: 1600,
    height: 1200,
    objectPosition: "center",
    note: "Membership page atmosphere image.",
  },
  contact: {
    id: "contact",
    src: "/images/home/location.svg",
    alt: "Club neighbourhood in Rishra",
    width: 1600,
    height: 1000,
    objectPosition: "center",
    note: "Contact page location image.",
  },
  galleryCoverFallback: {
    id: "gallery-cover-fallback",
    src: "/images/gallery/cover-01.svg",
    alt: "Gallery album cover placeholder",
    width: 1600,
    height: 1200,
    objectPosition: "center",
  },
  eventCoverFallback: {
    id: "event-cover-fallback",
    src: "/images/events/cover-01.svg",
    alt: "Event cover placeholder",
    width: 1600,
    height: 1000,
    objectPosition: "center",
  },
} as const satisfies Record<string, SiteMediaSlot>;

export type SiteMediaKey = keyof typeof siteMedia;

export function getSiteMedia(key: SiteMediaKey): SiteMediaSlot {
  return siteMedia[key];
}

/**
 * Committee portrait slots keyed by seed content ids from content/committee.ts.
 * Files live in /public/images/committee/.
 *
 * Public pages load members from Prisma (cuid ids). Always resolve portraits via
 * `resolveCommitteePortrait()` so role+name still maps to these files.
 */
export const committeePortraits: Record<
  string,
  Pick<SiteMediaSlot, "src" | "alt" | "objectPosition" | "note">
> = {
  "cm-president": {
    src: "/images/committee/monu.png",
    alt: "Portrait of Satrudhan Burman (Monu), President",
    objectPosition: "center 18%",
  },
  "cm-vp-1": {
    src: "/images/committee/suraj-kumar-burman.png",
    alt: "Portrait of Suraj Kumar Burman, Vice President",
    objectPosition: "center 18%",
  },
  "cm-secretary": {
    src: "/images/committee/Bishal.png",
    alt: "Portrait of Bishal Pandey, Secretary",
    objectPosition: "center 18%",
  },
  "cm-treasurer": {
    src: "/images/committee/Aalok.png",
    alt: "Portrait of Aalok Barma, Treasurer",
    objectPosition: "center 18%",
  },
  "cm-exec-1": {
    src: "/images/committee/sashikant.png",
    alt: "Portrait of Sashikant Tiwari, Executive Member",
    objectPosition: "center 18%",
  },
  "cm-exec-2": {
    src: "/images/committee/chandan.png",
    alt: "Portrait of Chandan Sharma, Executive Member",
    objectPosition: "center 18%",
  },
  "cm-exec-3": {
    src: "/images/committee/Gopal.png",
    alt: "Portrait of Gopal Burman, Committee Member",
    objectPosition: "center 18%",
  },
};

const placeholderPortrait = {
  src: "/images/committee/portrait-placeholder.svg",
  alt: "Committee member portrait placeholder",
  objectPosition: "center 20%",
} as const;

/**
 * Static portraits for standing-committee (and other) people keyed by
 * normalized display/legal name. Used when no MediaAsset is linked yet.
 */
export const committeePortraitsByName: Record<
  string,
  Pick<SiteMediaSlot, "src" | "alt" | "objectPosition">
> = {
  "satrudhan burman": {
    src: "/images/committee/monu.png",
    alt: "Portrait of Satrudhan Burman (Monu), President",
    objectPosition: "center 18%",
  },
  "satrudhan burman (monu)": {
    src: "/images/committee/monu.png",
    alt: "Portrait of Satrudhan Burman (Monu), President",
    objectPosition: "center 18%",
  },
  "suraj kumar burman": {
    src: "/images/committee/suraj-kumar-burman.png",
    alt: "Portrait of Suraj Kumar Burman, Vice President",
    objectPosition: "center 18%",
  },
  "bishal pandey": {
    src: "/images/committee/Bishal.png",
    alt: "Portrait of Bishal Pandey, Secretary",
    objectPosition: "center 18%",
  },
  "aalok barma": {
    src: "/images/committee/Aalok.png",
    alt: "Portrait of Aalok Barma, Treasurer",
    objectPosition: "center 18%",
  },
  "sashikant tiwari": {
    src: "/images/committee/sashikant.png",
    alt: "Portrait of Sashikant Tiwari, Executive Member",
    objectPosition: "center 18%",
  },
  "chandan sharma": {
    src: "/images/committee/chandan.png",
    alt: "Portrait of Chandan Sharma, Executive Member",
    objectPosition: "center 18%",
  },
  "gopal burman": {
    src: "/images/committee/Gopal.png",
    alt: "Portrait of Gopal Burman, Committee Member",
    objectPosition: "center 18%",
  },
  "rohit barma": {
    src: "/images/committee/rohit-barma.png",
    alt: "Portrait of Rohit Barma",
    objectPosition: "center 18%",
  },
  "nayan halder": {
    src: "/images/committee/nayan-halder.png",
    alt: "Portrait of Nayan Halder",
    objectPosition: "center 18%",
  },
  "dipak burman": {
    src: "/images/committee/dipak-burman.png",
    alt: "Portrait of Dipak Burman",
    objectPosition: "center 18%",
  },
  "vikash dwivedi": {
    src: "/images/committee/vikash-dwivedi.png",
    alt: "Portrait of Vikash Dwivedi",
    objectPosition: "center 18%",
  },
  "bittu burman": {
    src: "/images/committee/bittu-burman.png",
    alt: "Portrait of Bittu Burman",
    objectPosition: "center 18%",
  },
  "raunak shaw": {
    src: "/images/committee/raunak-shaw.png",
    alt: "Portrait of Raunak Shaw",
    objectPosition: "center 18%",
  },
};

function normalizePersonName(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

/** @deprecated Prefer `resolveCommitteePortrait` — DB member ids are not seed ids. */
export function getCommitteePortrait(memberId: string) {
  return committeePortraits[memberId] ?? placeholderPortrait;
}

type CommitteePortraitMember = {
  id: string;
  roleKey?: string;
  name: string;
  displayName?: string;
  portraitSrc?: string;
  portraitAlt?: string;
};

/**
 * Resolve a committee portrait for runtime members (Prisma cuid or seed id).
 * 1) Linked media asset URL when present
 * 2) Seed content id match
 * 3) roleKey + name match against seed roster
 * 4) Normalized name match (executive + standing committees)
 */
export function resolveCommitteePortrait(member: CommitteePortraitMember) {
  if (member.portraitSrc) {
    return {
      src: member.portraitSrc,
      alt:
        member.portraitAlt ??
        `Portrait of ${member.displayName ?? member.name}`,
      objectPosition: "center 18%",
    };
  }

  const byId = committeePortraits[member.id];
  if (byId) return byId;

  // Prefer role + legal name; fall back to name alone when a role was corrected.
  const seed =
    committeeMembers.find(
      (row) =>
        Boolean(member.roleKey) &&
        row.roleKey === member.roleKey &&
        row.name === member.name,
    ) ?? committeeMembers.find((row) => row.name === member.name);
  if (seed) {
    const fromSeed = committeePortraits[seed.id];
    if (fromSeed) return fromSeed;
  }

  const byDisplayName = committeePortraitsByName[
    normalizePersonName(member.displayName ?? "")
  ];
  if (byDisplayName) return byDisplayName;

  const byName = committeePortraitsByName[normalizePersonName(member.name)];
  if (byName) return byName;

  return {
    ...placeholderPortrait,
    alt: `Portrait placeholder for ${member.displayName ?? member.name}`,
  };
}
