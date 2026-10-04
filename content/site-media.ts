/**
 * Central media configuration for the public site.
 *
 * Replace `src` paths here (and files under /public/images/) when real
 * club photographs are ready. Components should import from this module
 * instead of hardcoding image URLs.
 *
 * English alt text only. Do not invent unverified scenes in alt copy.
 */

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
 * Committee portrait slots keyed by committee member id from content/committee.ts.
 * Files live in /public/images/committee/.
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
    src: "/images/committee/portrait-placeholder.svg",
    alt: "Portrait placeholder for Suraj Kumar Burman, Vice President",
    objectPosition: "center 20%",
    note: "Add a portrait for Suraj Kumar Burman when available.",
  },
  "cm-vp-2": {
    src: "/images/committee/Gopal.png",
    alt: "Portrait of Gopal Burman, Vice President",
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
};

export function getCommitteePortrait(memberId: string) {
  return (
    committeePortraits[memberId] ?? {
      src: "/images/committee/portrait-placeholder.svg",
      alt: "Committee member portrait placeholder",
      objectPosition: "center 20%",
    }
  );
}
