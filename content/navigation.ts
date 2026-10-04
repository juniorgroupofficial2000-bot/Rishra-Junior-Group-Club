export type NavItem = {
  href: string;
  label: string;
  /** Show in primary header nav */
  primary?: boolean;
  /** Show in footer link columns */
  footerGroup?: "explore" | "participate" | "legal";
};

/**
 * Single source of truth for public routes + nav labels.
 * Keep in sync with `content/pages.ts` slugs.
 * Site language: English only.
 */
export const publicNav: readonly NavItem[] = [
  { href: "/", label: "Home", primary: false, footerGroup: "explore" },
  { href: "/about", label: "About", primary: true, footerGroup: "explore" },
  { href: "/history", label: "History", primary: true, footerGroup: "explore" },
  {
    href: "/saraswati-puja",
    label: "Saraswati Puja",
    primary: true,
    footerGroup: "explore",
  },
  {
    href: "/committee",
    label: "Committees",
    primary: true,
    footerGroup: "explore",
  },
  { href: "/events", label: "Events", primary: true, footerGroup: "explore" },
  { href: "/gallery", label: "Gallery", primary: true, footerGroup: "explore" },
  {
    href: "/announcements",
    label: "Announcements",
    primary: false,
    footerGroup: "participate",
  },
  {
    href: "/membership",
    label: "Membership",
    primary: false,
    footerGroup: "participate",
  },
  {
    href: "/contact",
    label: "Contact",
    primary: true,
    footerGroup: "participate",
  },
  { href: "/faq", label: "FAQ", primary: false, footerGroup: "participate" },
  {
    href: "/privacy",
    label: "Privacy",
    primary: false,
    footerGroup: "legal",
  },
  {
    href: "/terms",
    label: "Terms",
    primary: false,
    footerGroup: "legal",
  },
] as const;

export const primaryNav = publicNav.filter((item) => item.primary);

export const footerGroups = {
  explore: {
    title: "Explore",
    items: publicNav.filter((item) => item.footerGroup === "explore"),
  },
  participate: {
    title: "Participate",
    items: publicNav.filter((item) => item.footerGroup === "participate"),
  },
  legal: {
    title: "Legal",
    items: publicNav.filter((item) => item.footerGroup === "legal"),
  },
} as const;

export function getNavItemByHref(href: string): NavItem | undefined {
  return publicNav.find((item) => item.href === href);
}
