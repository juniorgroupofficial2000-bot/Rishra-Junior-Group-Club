import { getPublicEnv } from "@/config/public";

export type FeatureFlag =
  | "memberPortal"
  | "payments"
  | "events"
  | "pujaArchive"
  | "gallery"
  | "announcements"
  | "membershipApplication";

/**
 * Feature flags are configuration, not scattered business forks.
 * Prefer gating routes/UI with these helpers.
 */
export function isFeatureEnabled(flag: FeatureFlag): boolean {
  return getPublicEnv().features[flag];
}
