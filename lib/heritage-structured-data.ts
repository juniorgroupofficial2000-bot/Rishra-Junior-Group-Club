import { siteConfig } from "@/content/site";
import { formatAddressLines } from "@/content/site";
import { getSiteUrl } from "@/lib/seo/config";

function organizationNode() {
  const siteUrl = getSiteUrl();
  return {
    "@type": "Organization",
    "@id": `${siteUrl}/#organization`,
    name: siteConfig.name,
    url: siteUrl,
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

function breadcrumbList(items: Array<{ name: string; path: string }>) {
  const siteUrl = getSiteUrl();
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${siteUrl}${item.path}`,
    })),
  };
}

export function historyPageJsonLd() {
  const siteUrl = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@graph": [
      organizationNode(),
      {
        "@type": "WebPage",
        "@id": `${siteUrl}/history#webpage`,
        url: `${siteUrl}/history`,
        name: `History · ${siteConfig.name}`,
        description:
          "Club history timeline for Rishra Junior Group Club, including Saraswati Puja since 1 February 2000.",
        isPartOf: { "@id": `${siteUrl}/#website` },
        about: { "@id": `${siteUrl}/#organization` },
        breadcrumb: { "@id": `${siteUrl}/history#breadcrumb` },
      },
      {
        "@id": `${siteUrl}/history#breadcrumb`,
        ...breadcrumbList([
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
      organizationNode(),
      {
        "@type": "WebPage",
        "@id": `${siteUrl}/saraswati-puja#webpage`,
        url: `${siteUrl}/saraswati-puja`,
        name: `Saraswati Puja · ${siteConfig.name}`,
        description:
          "Saraswati Puja at Rishra Junior Group Club — celebrated since 1 February 2000.",
        about: { "@id": `${siteUrl}/saraswati-puja#event` },
        breadcrumb: {
          "@id": `${siteUrl}/saraswati-puja#breadcrumb`,
        },
      },
      {
        "@id": `${siteUrl}/saraswati-puja#breadcrumb`,
        ...breadcrumbList([
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
