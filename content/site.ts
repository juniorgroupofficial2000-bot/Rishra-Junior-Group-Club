/**
 * Canonical public-site facts. Do not invent history, counts, or testimonials.
 * Unknown copy uses explicit placeholders.
 * Site language: English only.
 */

import { getSiteUrl, seoDefaults } from "@/lib/seo/config";

export const siteConfig = {
  name: seoDefaults.siteName,
  shortName: seoDefaults.shortName,
  /**
   * Absolute origin for metadata, sitemap, and JSON-LD.
   * Set via SITE_URL (preferred) or NEXT_PUBLIC_SITE_URL — never invent a domain.
   */
  get siteUrl() {
    return getSiteUrl();
  },
  establishedLabel: "Since 1 February 2000",
  establishedYear: 2000,
  registrationNote:
    "[PLACEHOLDER: Formal registration details — date, authority, registration number.]",
  address: {
    line1: "786, Morepukur, Natun Gram",
    line2: "Rishra, Hooghly",
    line3: "West Bengal 712250, India",
  },
  contact: {
    email: "[PLACEHOLDER: public email]",
    phone: "[PLACEHOLDER: public phone]",
    hours: "[PLACEHOLDER: visiting / contact hours]",
  },
  social: [] as ReadonlyArray<{
    label: string;
    href: string;
  }>,
  legal: {
    privacyUpdated: "[PLACEHOLDER: last updated date]",
    termsUpdated: "[PLACEHOLDER: last updated date]",
  },
};

export type SiteConfig = typeof siteConfig;

export function formatAddressLines(): string[] {
  return [
    siteConfig.address.line1,
    siteConfig.address.line2,
    siteConfig.address.line3,
  ];
}
