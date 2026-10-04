import { siteMedia } from "./site-media";
import { formatAddressLines, siteConfig } from "./site";

/**
 * Homepage content.
 * Image paths live in `content/site-media.ts` — do not hardcode URLs here.
 * English only. Do not invent unsupported club claims.
 */

export type HomeImage = {
  src: string;
  alt: string;
  width: number;
  height: number;
  note?: string;
};

export type HomeCta = {
  label: string;
  href: string;
  variant?: "primary" | "secondary" | "ghost";
};

/** @deprecated Prefer `siteMedia` from `@/content/site-media`. */
export const homeImages = {
  hero: siteMedia.hero,
  intro: siteMedia.intro,
  puja: siteMedia.puja,
  location: siteMedia.location,
} as const;

export const homeContent = {
  hero: {
    brand: siteConfig.name,
    established: "Established in 2000",
    headline: siteConfig.name,
    support:
      "Celebrating community, tradition and togetherness since 2000.",
    image: homeImages.hero,
    ctas: [
      { label: "Explore Saraswati Puja", href: "/saraswati-puja", variant: "primary" },
      { label: "Membership", href: "/membership", variant: "secondary" },
      { label: "About the club", href: "/about", variant: "ghost" },
    ] satisfies HomeCta[],
  },
  intro: {
    eyebrow: "The club",
    title: "A community rooted in Rishra",
    body: [
      "Rishra Junior Group Club brings neighbours together through shared tradition, service, and celebration.",
      "The club has organized Saraswati Puja since 1 February 2000 and has recently become formally registered as a club.",
    ],
    image: homeImages.intro,
    cta: { label: "Read about us", href: "/about" } satisfies HomeCta,
  },
  heritage: {
    eyebrow: "Heritage",
    title: "A story still being written",
    description:
      "Verified milestones appear here as the committee confirms them. Saraswati Puja has been organized since 2000.",
    items: [
      {
        id: "2000",
        year: "2000",
        title: "Saraswati Puja begins",
        description: "Organizing Saraswati Puja since 1 February 2000.",
      },
      {
        id: "today",
        year: "Today",
        title: "Member portal and public archive",
        description:
          "Members can sign in for membership and payment records. Public pages share committee-approved information.",
      },
    ],
    cta: { label: "View full history", href: "/history" } satisfies HomeCta,
  },
  puja: {
    eyebrow: "Tradition",
    title: "Saraswati Puja",
    description:
      "Our annual Saraswati Puja is the heart of the club calendar — a gathering of learning, devotion, and neighbourhood togetherness, celebrated since 2000.",
    body: "Details for each year’s celebration are published in the archive as photographs and notes become available.",
    image: homeImages.puja,
    cta: { label: "Open the puja archive", href: "/saraswati-puja" } satisfies HomeCta,
  },
  committee: {
    eyebrow: "Leadership",
    title: "Committee",
    description:
      "Club affairs are guided by the committee. Names and roles only — personal contact details are not published.",
    /** Preview sourced at render time from the published committee DB rows. */
    previewLimit: 3,
    cta: { label: "Meet the committee", href: "/committee" } satisfies HomeCta,
  },
  events: {
    eyebrow: "Calendar",
    title: "Upcoming events",
    description: "Public events from the club calendar.",
    previewLimit: 2,
    cta: { label: "All events", href: "/events" } satisfies HomeCta,
  },
  gallery: {
    eyebrow: "Memories",
    title: "Gallery",
    description: "Albums from club celebrations and gatherings.",
    previewLimit: 6,
    cta: { label: "Browse the gallery", href: "/gallery" } satisfies HomeCta,
  },
  announcements: {
    eyebrow: "Updates",
    title: "Announcements",
    description: "Official notices for members and the wider community.",
    previewLimit: 2,
    cta: { label: "All announcements", href: "/announcements" } satisfies HomeCta,
  },
  membership: {
    eyebrow: "Belong",
    title: "Membership",
    description:
      "Membership keeps the club active — supporting celebrations, community work, and the years ahead.",
    body: "Enquire through the Contact page. The committee will share next steps. Online applications will open here when that workflow is enabled.",
    ctas: [
      { label: "Learn about membership", href: "/membership", variant: "primary" },
      { label: "Contact the club", href: "/contact", variant: "secondary" },
    ] satisfies HomeCta[],
  },
  location: {
    eyebrow: "Visit",
    title: "Find us in Rishra",
    description: "We welcome neighbours and visitors at our address in Morepukur, Natun Gram.",
    addressLines: formatAddressLines(),
    email: siteConfig.contact.email,
    phone: siteConfig.contact.phone,
    hours: siteConfig.contact.hours,
    image: homeImages.location,
    cta: { label: "Contact details", href: "/contact" } satisfies HomeCta,
  },
} as const;

export type HomeContent = typeof homeContent;
