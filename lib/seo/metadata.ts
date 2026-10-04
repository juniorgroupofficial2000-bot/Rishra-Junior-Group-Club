import { publicPages, type PublicPageKey } from "@/content/pages";
import {
  absoluteUrl,
  getSiteUrl,
  seoDefaults,
} from "@/lib/seo/config";
import type { Metadata } from "next";

export type BuildMetadataInput = {
  title?: string;
  description: string;
  path: string;
  /** Use absolute title (no site template suffix). */
  absoluteTitle?: boolean;
  noIndex?: boolean;
  ogType?: "website" | "article";
  /** ISO 8601 for article Open Graph. */
  publishedTime?: string;
  modifiedTime?: string;
  image?: {
    url: string;
    width?: number;
    height?: number;
    alt?: string;
  };
};

function resolveImage(input?: BuildMetadataInput["image"]) {
  const fallback = {
    url: absoluteUrl(seoDefaults.defaultOgImagePath),
    width: 1200,
    height: 630,
    alt: seoDefaults.siteName,
  };
  if (!input) return fallback;
  return {
    url: input.url.startsWith("http") ? input.url : absoluteUrl(input.url),
    width: input.width ?? 1200,
    height: input.height ?? 630,
    alt: input.alt ?? seoDefaults.siteName,
  };
}

function displayTitle(input: BuildMetadataInput): string {
  if (input.absoluteTitle) {
    return input.title ?? seoDefaults.defaultTitle;
  }
  if (input.title) {
    return `${input.title} · ${seoDefaults.siteName}`;
  }
  return seoDefaults.defaultTitle;
}

/** Shared Metadata API builder — canonical, Open Graph, Twitter. */
export function buildMetadata(input: BuildMetadataInput): Metadata {
  const canonicalPath = input.path.startsWith("/") ? input.path : `/${input.path}`;
  const url = absoluteUrl(canonicalPath === "/" ? "/" : canonicalPath);
  const title = input.absoluteTitle
    ? { absolute: input.title ?? seoDefaults.defaultTitle }
    : input.title;
  const ogTitle = displayTitle(input);
  const image = resolveImage(input.image);

  return {
    metadataBase: new URL(getSiteUrl()),
    title,
    description: input.description,
    alternates: input.noIndex
      ? undefined
      : {
          canonical: canonicalPath,
          // English-only site: no Bengali hreflang alternates.
          languages: {
            "en-IN": canonicalPath,
            en: canonicalPath,
          },
        },
    robots: input.noIndex
      ? {
          index: false,
          follow: false,
          nocache: true,
          googleBot: { index: false, follow: false, noimageindex: true },
        }
      : { index: true, follow: true },
    openGraph: {
      title: ogTitle,
      description: input.description,
      url: input.noIndex ? undefined : url,
      siteName: seoDefaults.siteName,
      locale: seoDefaults.locale,
      type: input.ogType ?? "website",
      ...(input.publishedTime
        ? { publishedTime: input.publishedTime }
        : {}),
      ...(input.modifiedTime ? { modifiedTime: input.modifiedTime } : {}),
      images: [
        {
          url: image.url,
          width: image.width,
          height: image.height,
          alt: image.alt,
        },
      ],
    },
    twitter: {
      card: seoDefaults.twitterCard,
      title: ogTitle,
      description: input.description,
      images: [image.url],
    },
  };
}

export function metadataForPublicPage(key: PublicPageKey): Metadata {
  const page = publicPages[key];
  return buildMetadata({
    title: key === "home" ? seoDefaults.defaultTitle : page.title,
    absoluteTitle: key === "home",
    description: page.description,
    path: page.path,
    ogType: "website",
  });
}

/** 404 / missing entity metadata — never indexed. */
export function notFoundMetadata(title = "Not found"): Metadata {
  return buildMetadata({
    title,
    description: `${title} — ${seoDefaults.siteName}.`,
    path: "/",
    noIndex: true,
  });
}

/**
 * Portal / admin / auth pages — never indexed.
 * Does not emit a public canonical URL.
 */
export function privatePageMetadata(
  title: string,
  description?: string,
): Metadata {
  return {
    title,
    description:
      description ??
      `${title} for ${seoDefaults.siteName}. Sign-in required.`,
    robots: {
      index: false,
      follow: false,
      nocache: true,
      googleBot: { index: false, follow: false, noimageindex: true },
    },
  };
}
