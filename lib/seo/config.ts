/**
 * Central SEO / site URL configuration.
 * Do not invent a production domain — set SITE_URL in the environment.
 */

export type SeoDefaults = {
  siteName: string;
  shortName: string;
  locale: string;
  defaultTitle: string;
  defaultDescription: string;
  twitterCard: "summary_large_image" | "summary";
};

export const seoDefaults: SeoDefaults = {
  siteName: "Rishra Junior Group Club",
  shortName: "RJGC",
  locale: "en_IN",
  defaultTitle: "Rishra Junior Group Club",
  defaultDescription:
    "Celebrating community, tradition and togetherness since 2000. Official digital platform for Rishra Junior Group Club.",
  twitterCard: "summary_large_image",
};

/**
 * Absolute site origin for canonical URLs, Open Graph, sitemap, and JSON-LD.
 * Prefers SITE_URL; falls back to NEXT_PUBLIC_SITE_URL; then local development.
 */
export function getSiteUrl(): string {
  const raw =
    process.env.SITE_URL?.trim() ||
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    "http://localhost:3000";
  return raw.replace(/\/$/, "");
}

export function absoluteUrl(path = "/"): string {
  const base = getSiteUrl();
  if (!path || path === "/") return `${base}/`;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}
