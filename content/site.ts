/**
 * Canonical public-site facts. Do not invent history, counts, or testimonials.
 * Unknown copy uses explicit placeholders.
 * Site language: English only.
 */

export const siteConfig = {
  name: "Rishra Junior Group Club",
  shortName: "RJGC",
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
} as const;

export type SiteConfig = typeof siteConfig;

export function formatAddressLines(): string[] {
  return [
    siteConfig.address.line1,
    siteConfig.address.line2,
    siteConfig.address.line3,
  ];
}
