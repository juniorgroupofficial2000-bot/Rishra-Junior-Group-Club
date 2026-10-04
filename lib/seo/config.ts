/**
 * Central SEO / site URL configuration.
 * Do not invent a production domain — set APP_URL / SITE_URL in the environment.
 *
 * Language strategy (English-only product rule):
 * - Public UI, metadata, Open Graph, and structured data are English (`en-IN`).
 * - Do not emit Bengali metadata, `hreflang="bn"`, or bilingual title fields.
 * - Cultural terms (e.g. Saraswati Puja, Rishra) appear in English wording.
 */

import { resolveAppEnv } from "@/config/app-env";
import { getPublicEnv } from "@/config/public";

export type SeoDefaults = {
  siteName: string;
  shortName: string;
  /** BCP 47 language tag for HTML `lang`. */
  htmlLang: string;
  /** Open Graph locale. */
  locale: string;
  /** Schema.org inLanguage. */
  inLanguage: string;
  defaultTitle: string;
  defaultDescription: string;
  twitterCard: "summary_large_image" | "summary";
  defaultOgImagePath: string;
};

export const seoDefaults: SeoDefaults = {
  siteName: "Rishra Junior Group Club",
  shortName: "RJGC",
  htmlLang: "en-IN",
  locale: "en_IN",
  inLanguage: "en-IN",
  defaultTitle: "Rishra Junior Group Club",
  defaultDescription:
    "Celebrating community, tradition and togetherness since 2000. Official digital platform for Rishra Junior Group Club in Rishra, West Bengal.",
  twitterCard: "summary_large_image",
  defaultOgImagePath: "/brand/og-default.svg",
};

function isProductionBuildPhase(): boolean {
  return (
    process.env.NEXT_PHASE === "phase-production-build" ||
    process.env.npm_lifecycle_event === "build"
  );
}

/**
 * Absolute site origin for canonical URLs, Open Graph, sitemap, and JSON-LD.
 * Prefers APP_URL / SITE_URL from the centralized public config.
 */
export function getSiteUrl(): string {
  const publicEnv = getPublicEnv();
  if (publicEnv.appUrl) {
    return publicEnv.appUrl;
  }

  // Last-resort Vercel host (also wired in loadPublicEnv; kept here for safety).
  const vercelUrl = process.env.VERCEL_URL?.trim();
  if (vercelUrl) {
    return vercelUrl.startsWith("http://") || vercelUrl.startsWith("https://")
      ? vercelUrl.replace(/\/$/, "")
      : `https://${vercelUrl.replace(/\/$/, "")}`;
  }

  const appEnv = resolveAppEnv();
  if (
    (appEnv === "production" || process.env.NODE_ENV === "production") &&
    !isProductionBuildPhase() &&
    process.env.ALLOW_INSECURE_SITE_URL_FALLBACK !== "true"
  ) {
    throw new Error(
      "APP_URL (or SITE_URL) must be set to the public HTTPS origin in production (e.g. https://rishrajuniorgroupclub.in).",
    );
  }

  return "http://localhost:3000";
}

export function absoluteUrl(path = "/"): string {
  const base = getSiteUrl();
  if (!path || path === "/") return `${base}/`;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized}`;
}

/** True when the resolved origin looks like a local/dev host (not for production indexing). */
export function isLocalSiteUrl(url = getSiteUrl()): boolean {
  try {
    const host = new URL(url).hostname;
    return (
      host === "localhost" ||
      host === "127.0.0.1" ||
      host === "0.0.0.0" ||
      host.endsWith(".local")
    );
  } catch {
    return true;
  }
}
