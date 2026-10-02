import { siteConfig } from "@/content/site";
import { formatAddressLines } from "@/content/site";

function organizationNode() {
  return {
    "@type": "Organization",
    "@id": `${siteConfig.siteUrl}/#organization`,
    name: siteConfig.name,
    url: siteConfig.siteUrl,
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
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${siteConfig.siteUrl}${item.path}`,
    })),
  };
}

export function historyPageJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      organizationNode(),
      {
        "@type": "WebPage",
        "@id": `${siteConfig.siteUrl}/history#webpage`,
        url: `${siteConfig.siteUrl}/history`,
        name: `History · ${siteConfig.name}`,
        description:
          "Club history timeline for Rishra Junior Group Club, including Saraswati Puja since 1 February 2000.",
        isPartOf: { "@id": `${siteConfig.siteUrl}/#website` },
        about: { "@id": `${siteConfig.siteUrl}/#organization` },
        breadcrumb: { "@id": `${siteConfig.siteUrl}/history#breadcrumb` },
      },
      {
        "@id": `${siteConfig.siteUrl}/history#breadcrumb`,
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

  return {
    "@context": "https://schema.org",
    "@graph": [
      organizationNode(),
      {
        "@type": "WebPage",
        "@id": `${siteConfig.siteUrl}/saraswati-puja#webpage`,
        url: `${siteConfig.siteUrl}/saraswati-puja`,
        name: `Saraswati Puja · ${siteConfig.name}`,
        description:
          "Saraswati Puja at Rishra Junior Group Club — celebrated since 1 February 2000.",
        about: { "@id": `${siteConfig.siteUrl}/saraswati-puja#event` },
        breadcrumb: {
          "@id": `${siteConfig.siteUrl}/saraswati-puja#breadcrumb`,
        },
      },
      {
        "@id": `${siteConfig.siteUrl}/saraswati-puja#breadcrumb`,
        ...breadcrumbList([
          { name: "Home", path: "/" },
          { name: "Saraswati Puja", path: "/saraswati-puja" },
        ]),
      },
      {
        // Recurring tradition — no invented upcoming date in structured data.
        "@type": "EventSeries",
        "@id": `${siteConfig.siteUrl}/saraswati-puja#event`,
        name: "Saraswati Puja",
        description:
          "Annual Saraswati Puja organized by Rishra Junior Group Club since 1 February 2000.",
        organizer: { "@id": `${siteConfig.siteUrl}/#organization` },
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
