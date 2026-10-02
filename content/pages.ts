import { siteConfig } from "./site";

export type PublicPageKey =
  | "home"
  | "about"
  | "history"
  | "committee"
  | "saraswati-puja"
  | "events"
  | "gallery"
  | "announcements"
  | "membership"
  | "contact"
  | "faq"
  | "privacy"
  | "terms";

export type PublicPageDefinition = {
  key: PublicPageKey;
  path: string;
  title: string;
  description: string;
  eyebrow?: string;
  /** When false, page chrome omits breadcrumbs (home). */
  showBreadcrumbs?: boolean;
};

/** Site language: English only. */
export const publicPages: Record<PublicPageKey, PublicPageDefinition> = {
  home: {
    key: "home",
    path: "/",
    title: siteConfig.name,
    description:
      "Celebrating community, tradition and togetherness since 2000.",
    showBreadcrumbs: false,
  },
  about: {
    key: "about",
    path: "/about",
    title: "About",
    description:
      "[PLACEHOLDER: Short introduction to the club’s purpose and community role.]",
    eyebrow: "The club",
  },
  history: {
    key: "history",
    path: "/history",
    title: "History",
    description:
      "Club history timeline for Rishra Junior Group Club, including Saraswati Puja since 1 February 2000.",
    eyebrow: "Since 2000",
  },
  committee: {
    key: "committee",
    path: "/committee",
    title: "Committee",
    description:
      "Meet the committee of Rishra Junior Group Club. Public listings show names and roles only.",
    eyebrow: "Leadership",
  },
  "saraswati-puja": {
    key: "saraswati-puja",
    path: "/saraswati-puja",
    title: "Saraswati Puja",
    description:
      "Saraswati Puja at Rishra Junior Group Club — celebrated since 1 February 2000. Archive, preparation, and community memories.",
    eyebrow: "Tradition",
  },
  events: {
    key: "events",
    path: "/events",
    title: "Events",
    description:
      "Upcoming and past events at Rishra Junior Group Club. SAMPLE listings are labelled.",
    eyebrow: "Calendar",
  },
  gallery: {
    key: "gallery",
    path: "/gallery",
    title: "Gallery",
    description:
      "Photo and video albums from club celebrations and gatherings. SAMPLE albums are labelled.",
    eyebrow: "Moments",
  },
  announcements: {
    key: "announcements",
    path: "/announcements",
    title: "Announcements",
    description:
      "Official club announcements with categories and pinned notices. SAMPLE items are labelled.",
    eyebrow: "Updates",
  },
  membership: {
    key: "membership",
    path: "/membership",
    title: "Membership",
    description:
      "How to enquire about joining Rishra Junior Group Club, membership process, benefits, and the future member portal.",
    eyebrow: "Join",
  },
  contact: {
    key: "contact",
    path: "/contact",
    title: "Contact",
    description: "Reach Rishra Junior Group Club at the address below.",
    eyebrow: "Get in touch",
  },
  faq: {
    key: "faq",
    path: "/faq",
    title: "FAQ",
    description: "[PLACEHOLDER: Frequently asked questions — content pending.]",
    eyebrow: "Help",
  },
  privacy: {
    key: "privacy",
    path: "/privacy",
    title: "Privacy Policy",
    description: "[PLACEHOLDER: Privacy policy body.]",
    eyebrow: "Legal",
  },
  terms: {
    key: "terms",
    path: "/terms",
    title: "Terms of Use",
    description: "[PLACEHOLDER: Terms of use body.]",
    eyebrow: "Legal",
  },
};

export function getPageByPath(pathname: string): PublicPageDefinition | undefined {
  const normalized =
    pathname.length > 1 && pathname.endsWith("/")
      ? pathname.slice(0, -1)
      : pathname;
  return Object.values(publicPages).find((page) => page.path === normalized);
}

export type BreadcrumbCrumb = {
  label: string;
  href?: string;
};

export function breadcrumbsForPage(key: PublicPageKey): BreadcrumbCrumb[] {
  const page = publicPages[key];
  if (key === "home") {
    return [{ label: "Home" }];
  }
  return [{ label: "Home", href: "/" }, { label: page.title }];
}
