import { publicPages, type PublicPageKey } from "@/content/pages";
import { absoluteUrl, getSiteUrl, seoDefaults } from "@/lib/seo/config";
import type { Metadata } from "next";

export type BuildMetadataInput = {
  title?: string;
  description: string;
  path: string;
  /** Use absolute title (no site template suffix). */
  absoluteTitle?: boolean;
  noIndex?: boolean;
  ogType?: "website" | "article";
  image?: {
    url: string;
    width?: number;
    height?: number;
    alt?: string;
  };
};

/** Shared Metadata API builder — canonical, Open Graph, Twitter. */
export function buildMetadata(input: BuildMetadataInput): Metadata {
  const canonicalPath = input.path.startsWith("/") ? input.path : `/${input.path}`;
  const url = absoluteUrl(canonicalPath === "/" ? "/" : canonicalPath);
  const title = input.absoluteTitle
    ? { absolute: input.title ?? seoDefaults.defaultTitle }
    : input.title;

  const imageUrl = input.image
    ? input.image.url.startsWith("http")
      ? input.image.url
      : absoluteUrl(input.image.url)
    : undefined;

  return {
    metadataBase: new URL(getSiteUrl()),
    title,
    description: input.description,
    alternates: {
      canonical: canonicalPath,
    },
    robots: input.noIndex
      ? { index: false, follow: false, googleBot: { index: false, follow: false } }
      : { index: true, follow: true },
    openGraph: {
      title:
        typeof title === "object" && title && "absolute" in title
          ? title.absolute
          : `${input.title ?? seoDefaults.defaultTitle} · ${seoDefaults.siteName}`,
      description: input.description,
      url,
      siteName: seoDefaults.siteName,
      locale: seoDefaults.locale,
      type: input.ogType ?? "website",
      images: imageUrl
        ? [
            {
              url: imageUrl,
              width: input.image?.width,
              height: input.image?.height,
              alt: input.image?.alt ?? seoDefaults.siteName,
            },
          ]
        : undefined,
    },
    twitter: {
      card: seoDefaults.twitterCard,
      title:
        typeof title === "object" && title && "absolute" in title
          ? title.absolute
          : (input.title ?? seoDefaults.defaultTitle),
      description: input.description,
      images: imageUrl ? [imageUrl] : undefined,
    },
  };
}

export function metadataForPublicPage(key: PublicPageKey): Metadata {
  const page = publicPages[key];
  return buildMetadata({
    title: key === "home" ? undefined : page.title,
    absoluteTitle: key === "home",
    description: page.description,
    path: page.path,
    ogType: "website",
  });
}

/** Portal / admin pages — never indexed. */
export function privatePageMetadata(title: string, description?: string): Metadata {
  return buildMetadata({
    title,
    description:
      description ??
      `${title} for ${seoDefaults.siteName}. Sign-in required.`,
    path: "/",
    noIndex: true,
  });
}
