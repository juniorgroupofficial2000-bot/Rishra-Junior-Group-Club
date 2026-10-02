import { formatAddressLines, siteConfig } from "./site";

/**
 * Homepage content and media slots.
 * Replace `src` values under /public/images/home when real photographs are ready.
 * English only. Do not invent unsupported club claims.
 */

export type HomeImage = {
  /** Path under /public — swap file in place or update this path */
  src: string;
  alt: string;
  width: number;
  height: number;
  /** Optional credit / replacement note for editors */
  note?: string;
};

export type HomeCta = {
  label: string;
  href: string;
  variant?: "primary" | "secondary" | "ghost";
};

export const homeImages = {
  hero: {
    src: "/images/home/hero.svg",
    alt: "Placeholder photograph for the Rishra Junior Group Club community",
    width: 2400,
    height: 1600,
    note: "Replace with a wide community or puja photograph.",
  },
  intro: {
    src: "/images/home/intro.svg",
    alt: "Placeholder photograph introducing club life",
    width: 1600,
    height: 1200,
    note: "Replace with a candid club gathering photograph.",
  },
  puja: {
    src: "/images/home/puja.svg",
    alt: "Placeholder photograph for Saraswati Puja",
    width: 1800,
    height: 1200,
    note: "Replace with a Saraswati Puja photograph from the archive.",
  },
  location: {
    src: "/images/home/location.svg",
    alt: "Placeholder image for the club neighbourhood in Rishra",
    width: 1600,
    height: 1000,
    note: "Replace with a photograph of the club premises or locality.",
  },
} as const satisfies Record<string, HomeImage | readonly HomeImage[]>;

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
      "[PLACEHOLDER: One or two sentences on the club’s day-to-day role in the community.]",
    ],
    image: homeImages.intro,
    cta: { label: "Read about us", href: "/about" } satisfies HomeCta,
  },
  heritage: {
    eyebrow: "Heritage",
    title: "A story still being written",
    description:
      "From the first Saraswati Puja in 2000 to formal registration, the club’s public record will grow as verified milestones are added.",
    items: [
      {
        id: "2000",
        year: "2000",
        title: "Saraswati Puja begins",
        description:
          "Organizing Saraswati Puja since 1 February 2000.",
      },
      {
        id: "registration",
        year: "—",
        title: "Formal club registration",
        description:
          "[PLACEHOLDER: Registration date, authority, and number when verified.]",
      },
      {
        id: "next",
        year: "Today",
        title: "Building a digital home",
        description:
          "This platform will help members stay informed, participate, and preserve club memory.",
      },
    ],
    cta: { label: "View full history", href: "/history" } satisfies HomeCta,
  },
  puja: {
    eyebrow: "Tradition",
    title: "Saraswati Puja",
    description:
      "Our annual Saraswati Puja is the heart of the club calendar — a gathering of learning, devotion, and neighbourhood togetherness, celebrated since 2000.",
    body: "[PLACEHOLDER: Short note on how the puja is observed each year.]",
    image: homeImages.puja,
    cta: { label: "Open the puja archive", href: "/saraswati-puja" } satisfies HomeCta,
  },
  committee: {
    eyebrow: "Leadership",
    title: "Committee",
    description:
      "Club affairs are guided by the committee. Names and roles only — personal contact details are not published.",
    /** Preview sourced at render time from `content/committee.ts`. */
    previewLimit: 3,
    cta: { label: "Meet the committee", href: "/committee" } satisfies HomeCta,
  },
  events: {
    eyebrow: "Calendar",
    title: "Upcoming events",
    description:
      "Public events from the club calendar. SAMPLE listings are labelled on the Events page.",
    previewLimit: 2,
    cta: { label: "All events", href: "/events" } satisfies HomeCta,
  },
  gallery: {
    eyebrow: "Memories",
    title: "Gallery",
    description:
      "Album preview from the gallery. SAMPLE albums are labelled.",
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
    body: "[PLACEHOLDER: Brief note on who can join and how applications are reviewed.]",
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
