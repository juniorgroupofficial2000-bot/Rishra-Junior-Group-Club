import { siteConfig, formatAddressLines } from "@/content/site";
import { absoluteUrl, getSiteUrl, seoDefaults } from "@/lib/seo/config";
import {
  breadcrumbJsonLd,
  organizationJsonLd,
} from "@/lib/seo/structured-data";

export function historyPageJsonLd() {
  const siteUrl = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@graph": [
      organizationJsonLd(),
      {
        "@type": "WebPage",
        "@id": `${siteUrl}/history#webpage`,
        url: absoluteUrl("/history"),
        name: `History · ${siteConfig.name}`,
        description:
          "Club history timeline for Rishra Junior Group Club, including Saraswati Puja since 1 February 2000.",
        inLanguage: seoDefaults.inLanguage,
        isPartOf: { "@id": `${siteUrl}/#website` },
        about: { "@id": `${siteUrl}/#organization` },
        breadcrumb: breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "History", path: "/history" },
        ]),
      },
    ],
  };
}

export function saraswatiPujaPageJsonLd() {
  const addressLines = formatAddressLines();
  const siteUrl = getSiteUrl();

  return {
    "@context": "https://schema.org",
    "@graph": [
      organizationJsonLd(),
      {
        "@type": "WebPage",
        "@id": `${siteUrl}/saraswati-puja#webpage`,
        url: absoluteUrl("/saraswati-puja"),
        name: `Saraswati Puja · ${siteConfig.name}`,
        description:
          "Saraswati Puja at Rishra Junior Group Club — celebrated since 1 February 2000.",
        inLanguage: seoDefaults.inLanguage,
        about: { "@id": `${siteUrl}/saraswati-puja#event` },
        breadcrumb: breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Saraswati Puja", path: "/saraswati-puja" },
        ]),
      },
      {
        // Recurring tradition — no invented upcoming date in structured data.
        "@type": "EventSeries",
        "@id": `${siteUrl}/saraswati-puja#event`,
        name: "Saraswati Puja",
        description:
          "Annual Saraswati Puja organized by Rishra Junior Group Club since 1 February 2000.",
        organizer: { "@id": `${siteUrl}/#organization` },
        location: {
          "@type": "Place",
          name: siteConfig.name,
          address: {
            "@type": "PostalAddress",
            streetAddress: siteConfig.address.line1,
            addressLocality: "Rishra",
            addressRegion: "West Bengal",
            postalCode: "712250",
            addressCountry: "IN",
          },
          description: addressLines.join(", "),
        },
      },
    ],
  };
}
