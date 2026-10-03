export {
  absoluteUrl,
  getSiteUrl,
  isLocalSiteUrl,
  seoDefaults,
  type SeoDefaults,
} from "@/lib/seo/config";
export {
  buildMetadata,
  metadataForPublicPage,
  notFoundMetadata,
  privatePageMetadata,
  type BuildMetadataInput,
} from "@/lib/seo/metadata";
export {
  robotsDisallowPaths,
  seoRouteRules,
  type IndexPolicy,
  type SeoRouteRule,
} from "@/lib/seo/routes";
export {
  announcementJsonLd,
  breadcrumbJsonLd,
  contactPageJsonLd,
  eventJsonLd,
  faqPageJsonLd,
  homePageJsonLd,
  localBusinessJsonLd,
  organizationJsonLd,
  webPageJsonLd,
  websiteJsonLd,
} from "@/lib/seo/structured-data";
