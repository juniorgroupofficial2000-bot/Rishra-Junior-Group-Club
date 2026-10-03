export const MEDIA_PURPOSES = [
  "COMMITTEE_PORTRAIT",
  "MEMBER_PORTRAIT",
  "GALLERY",
  "EVENT",
  "PUJA",
  "HERO",
  "GENERAL",
] as const;

export type MediaPurposeValue = (typeof MEDIA_PURPOSES)[number];
