/**
 * Indexability matrix for the public site and private portals.
 * Keep in sync with `app/robots.ts` and sitemap generation.
 */

export type IndexPolicy = "index" | "noindex";

export type SeoRouteRule = {
  pattern: string;
  policy: IndexPolicy;
  inSitemap: boolean;
  notes: string;
};

/** Declarative SEO route rules for audits and documentation. */
export const seoRouteRules: SeoRouteRule[] = [
  { pattern: "/", policy: "index", inSitemap: true, notes: "Home" },
  { pattern: "/about", policy: "index", inSitemap: true, notes: "About" },
  { pattern: "/history", policy: "index", inSitemap: true, notes: "History" },
  { pattern: "/committee", policy: "index", inSitemap: true, notes: "Committee" },
  {
    pattern: "/saraswati-puja",
    policy: "index",
    inSitemap: true,
    notes: "Flagship tradition",
  },
  {
    pattern: "/saraswati-puja/*",
    policy: "index",
    inSitemap: true,
    notes: "Published non-sample Puja archive years",
  },
  { pattern: "/events", policy: "index", inSitemap: true, notes: "Events list" },
  {
    pattern: "/events/*",
    policy: "index",
    inSitemap: true,
    notes: "Published non-sample events only in sitemap; sample pages noindex",
  },
  { pattern: "/gallery", policy: "index", inSitemap: true, notes: "Gallery list" },
  {
    pattern: "/gallery/*",
    policy: "index",
    inSitemap: true,
    notes: "Published non-sample albums; sample pages noindex",
  },
  {
    pattern: "/announcements",
    policy: "index",
    inSitemap: true,
    notes: "Announcements list",
  },
  {
    pattern: "/announcements/*",
    policy: "index",
    inSitemap: true,
    notes: "Published non-sample announcements; sample pages noindex",
  },
  { pattern: "/membership", policy: "index", inSitemap: true, notes: "Membership info" },
  { pattern: "/contact", policy: "index", inSitemap: true, notes: "Contact" },
  { pattern: "/faq", policy: "index", inSitemap: true, notes: "FAQ" },
  {
    pattern: "/search",
    policy: "index",
    inSitemap: false,
    notes: "Public search; query results are dynamic",
  },
  { pattern: "/privacy", policy: "index", inSitemap: true, notes: "Legal" },
  { pattern: "/terms", policy: "index", inSitemap: true, notes: "Legal" },
  {
    pattern: "/login",
    policy: "noindex",
    inSitemap: false,
    notes: "Auth",
  },
  {
    pattern: "/member/*",
    policy: "noindex",
    inSitemap: false,
    notes: "Private member portal",
  },
  {
    pattern: "/admin/*",
    policy: "noindex",
    inSitemap: false,
    notes: "Private admin portal",
  },
  {
    pattern: "/api/*",
    policy: "noindex",
    inSitemap: false,
    notes: "API / media delivery",
  },
  {
    pattern: "/design-system",
    policy: "noindex",
    inSitemap: false,
    notes: "Internal playground",
  },
];

export const robotsDisallowPaths = [
  "/admin/",
  "/member/",
  "/api/",
  "/login",
  "/design-system",
] as const;
