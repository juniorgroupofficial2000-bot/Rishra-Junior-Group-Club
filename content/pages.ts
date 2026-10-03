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
  | "search"
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
      "Learn about Rishra Junior Group Club — community, tradition, and togetherness in Morepukur, Natun Gram since 2000.",
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
      "Upcoming and past events at Rishra Junior Group Club.",
    eyebrow: "Calendar",
  },
  gallery: {
    key: "gallery",
    path: "/gallery",
    title: "Gallery",
    description:
      "Photo and video albums from club celebrations and gatherings.",
    eyebrow: "Moments",
  },
  announcements: {
    key: "announcements",
    path: "/announcements",
    title: "Announcements",
    description:
      "Official club announcements with categories and pinned notices.",
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
    description:
      "Frequently asked questions about Rishra Junior Group Club, Saraswati Puja, membership, and contact.",
    eyebrow: "Help",
  },
  search: {
    key: "search",
    path: "/search",
    title: "Search",
    description:
      "Search announcements, events, gallery albums, committee members, and club pages.",
    eyebrow: "Find",
  },
  privacy: {
    key: "privacy",
    path: "/privacy",
    title: "Privacy Policy",
    description:
      "How Rishra Junior Group Club handles personal information on this website and member portal.",
    eyebrow: "Legal",
  },
  terms: {
    key: "terms",
    path: "/terms",
    title: "Terms of Use",
    description:
      "Terms of use for the Rishra Junior Group Club website and related digital services.",
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
