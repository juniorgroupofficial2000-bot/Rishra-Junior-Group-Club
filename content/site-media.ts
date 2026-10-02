/**
 * Central media slots for the public site.
 * Replace `src` paths with real photographs when available.
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
  note?: string;
};

export const siteMedia = {
  hero: {
    id: "hero",
    src: "/images/home/hero.svg",
    srcMobile: "/images/home/hero.svg",
    alt: "Placeholder community photograph for Rishra Junior Group Club",
    width: 2400,
    height: 1600,
    objectPosition: "center",
    note: "Replace with a wide Saraswati Puja or community photograph.",
  },
  intro: {
    id: "intro",
    src: "/images/home/intro.svg",
    alt: "Placeholder photograph introducing club life",
    width: 1600,
    height: 1200,
    objectPosition: "center",
  },
  puja: {
    id: "puja",
    src: "/images/home/puja.svg",
    alt: "Placeholder photograph for Saraswati Puja",
    width: 1800,
    height: 1200,
    objectPosition: "center 40%",
  },
  pujaHero: {
    id: "puja-hero",
    src: "/images/heritage/puja-hero.svg",
    alt: "Placeholder Saraswati Puja hero photograph",
    width: 2400,
    height: 1600,
    objectPosition: "center",
  },
  location: {
    id: "location",
    src: "/images/home/location.svg",
    alt: "Placeholder image for the club neighbourhood in Rishra",
    width: 1600,
    height: 1000,
    objectPosition: "center",
  },
} as const satisfies Record<string, SiteMediaSlot>;

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
    // Portrait file not provided yet.
    src: "/images/committee/portrait-placeholder.svg",
    alt: "Portrait placeholder for Suraj Kumar Burman, Vice President",
    objectPosition: "center 20%",
    note: "Add a portrait named to match Suraj Kumar Burman when available.",
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
