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
  gallery: [
    {
      src: "/images/home/gallery-01.svg",
      alt: "Placeholder gallery image 1",
      width: 1200,
      height: 1200,
    },
    {
      src: "/images/home/gallery-02.svg",
      alt: "Placeholder gallery image 2",
      width: 1200,
      height: 1500,
    },
    {
      src: "/images/home/gallery-03.svg",
      alt: "Placeholder gallery image 3",
      width: 1200,
      height: 1200,
    },
    {
      src: "/images/home/gallery-04.svg",
      alt: "Placeholder gallery image 4",
      width: 1200,
      height: 900,
    },
    {
      src: "/images/home/gallery-05.svg",
      alt: "Placeholder gallery image 5",
      width: 1200,
      height: 1200,
    },
    {
      src: "/images/home/gallery-06.svg",
      alt: "Placeholder gallery image 6",
      width: 1200,
      height: 1400,
    },
  ],
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
      "Public events will be listed here as dates are confirmed. No upcoming schedule has been published yet.",
    items: [
      {
        id: "e1",
        title: "[PLACEHOLDER: Event title]",
        dateLabel: "[PLACEHOLDER: Date]",
        locationLabel: siteConfig.address.line1,
        status: "upcoming" as const,
        href: "/events",
      },
      {
        id: "e2",
        title: "[PLACEHOLDER: Event title]",
        dateLabel: "[PLACEHOLDER: Date]",
        locationLabel: "Rishra",
        status: "upcoming" as const,
        href: "/events",
      },
    ],
    cta: { label: "All events", href: "/events" } satisfies HomeCta,
  },
  gallery: {
    eyebrow: "Memories",
    title: "Gallery",
    description:
      "A preview of club photographs. Replace the placeholder frames with curated archive images.",
    images: homeImages.gallery,
    cta: { label: "Browse the gallery", href: "/gallery" } satisfies HomeCta,
  },
  announcements: {
    eyebrow: "Updates",
    title: "Announcements",
    description: "Official notices for members and the wider community.",
    items: [
      {
        id: "a1",
        title: "[PLACEHOLDER: Announcement title]",
        dateLabel: "[PLACEHOLDER: Date]",
        summary: "[PLACEHOLDER: One-sentence summary.]",
        href: "/announcements",
      },
      {
        id: "a2",
        title: "[PLACEHOLDER: Announcement title]",
        dateLabel: "[PLACEHOLDER: Date]",
        summary: "[PLACEHOLDER: One-sentence summary.]",
        href: "/announcements",
      },
    ],
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
