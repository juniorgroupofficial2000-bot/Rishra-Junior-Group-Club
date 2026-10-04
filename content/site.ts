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
    "Formal registration details will be published when verified by the committee.",
  address: {
    line1: "786, Morepukur, Natun Gram",
    line2: "Rishra, Hooghly",
    line3: "West Bengal 712250, India",
  },
  contact: {
    /** Empty until CONTACT_PUBLIC_EMAIL is set — never invent an address. */
    get email() {
      return process.env.CONTACT_PUBLIC_EMAIL?.trim() || "";
    },
    /** Empty until CONTACT_PUBLIC_PHONE is set — never invent a number. */
    get phone() {
      return process.env.CONTACT_PUBLIC_PHONE?.trim() || "";
    },
    get hours() {
      return (
        process.env.CONTACT_PUBLIC_HOURS?.trim() ||
        "Contact hours will be published by the committee."
      );
    },
  },
  social: [] as ReadonlyArray<{
    label: string;
    href: string;
  }>,
  legal: {
    privacyUpdated: "3 October 2026",
    termsUpdated: "3 October 2026",
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
