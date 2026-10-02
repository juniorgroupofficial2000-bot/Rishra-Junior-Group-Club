import { siteConfig, formatAddressLines } from "@/content/site";
import type { ClubEvent } from "@/content/events";
import { absoluteUrl, getSiteUrl, seoDefaults } from "@/lib/seo/config";

export function organizationJsonLd() {
  const url = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${url}/#organization`,
    name: seoDefaults.siteName,
    alternateName: seoDefaults.shortName,
    url,
    foundingDate: "2000-02-01",
    address: {
      "@type": "PostalAddress",
      streetAddress: siteConfig.address.line1,
      addressLocality: "Rishra",
      addressRegion: "West Bengal",
      postalCode: "712250",
      addressCountry: "IN",
    },
  };
}

/** LocalBusiness node — only when we have a real address (we do). */
export function localBusinessJsonLd() {
  const url = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${url}/#localbusiness`,
    name: seoDefaults.siteName,
    url,
    image: absoluteUrl("/brand/og-default.svg"),
    address: {
      "@type": "PostalAddress",
      streetAddress: siteConfig.address.line1,
      addressLocality: "Rishra",
      addressRegion: "West Bengal",
      postalCode: "712250",
      addressCountry: "IN",
    },
    description: seoDefaults.defaultDescription,
    parentOrganization: { "@id": `${url}/#organization` },
  };
}

export function websiteJsonLd() {
  const url = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${url}/#website`,
    url,
    name: seoDefaults.siteName,
    description: seoDefaults.defaultDescription,
    inLanguage: "en-IN",
    publisher: { "@id": `${url}/#organization` },
  };
}

export function breadcrumbJsonLd(
  items: Array<{ name: string; path: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

/**
 * Event structured data — only for verified (non-sample) published events.
 * Never emit schema.org Event for SAMPLE demo content.
 */
export function eventJsonLd(event: ClubEvent) {
  if (event.provenance === "sample") {
    return null;
  }

  const url = absoluteUrl(`/events/${event.slug}`);
  const name = event.title.trim();

  return {
    "@context": "https://schema.org",
    "@type": "Event",
    "@id": `${url}#event`,
    name,
    description: event.summary.trim(),
    startDate: event.startsAt,
    endDate: event.endsAt,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    url,
    image: event.coverImage
      ? [absoluteUrl(event.coverImage.src)]
      : undefined,
    location: {
      "@type": "Place",
      name: event.venue.name,
      address: {
        "@type": "PostalAddress",
        streetAddress: event.venue.addressLines[0] ?? siteConfig.address.line1,
        addressLocality: "Rishra",
        addressRegion: "West Bengal",
        postalCode: "712250",
        addressCountry: "IN",
      },
    },
    organizer: {
      "@type": "Organization",
      name: seoDefaults.siteName,
      url: getSiteUrl(),
    },
  };
}

export function homePageJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      organizationJsonLd(),
      localBusinessJsonLd(),
      websiteJsonLd(),
      {
        "@type": "WebPage",
        "@id": `${getSiteUrl()}/#webpage`,
        url: absoluteUrl("/"),
        name: seoDefaults.siteName,
        description: seoDefaults.defaultDescription,
        isPartOf: { "@id": `${getSiteUrl()}/#website` },
        about: { "@id": `${getSiteUrl()}/#organization` },
        primaryImageOfPage: absoluteUrl("/brand/og-default.svg"),
      },
    ],
  };
}

export function contactPageJsonLd() {
  const lines = formatAddressLines();
  return {
    "@context": "https://schema.org",
    "@graph": [
      organizationJsonLd(),
      localBusinessJsonLd(),
      breadcrumbJsonLd([
        { name: "Home", path: "/" },
        { name: "Contact", path: "/contact" },
      ]),
      {
        "@type": "ContactPage",
        name: `Contact · ${seoDefaults.siteName}`,
        url: absoluteUrl("/contact"),
        description: `Reach ${seoDefaults.siteName} at ${lines.join(", ")}.`,
      },
    ],
  };
}
