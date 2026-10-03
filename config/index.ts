/**
 * Centralized environment configuration.
 *
 * Prefer:
 *   import { env, getServerEnv, getPublicEnv } from "@/config";
 *
 * Avoid reading `process.env.X` in application code.
 */

export {
  APP_ENVS,
  allowsDemoData,
  allowsDeveloperUtilities,
  environmentBadgeLabel,
  isAppEnv,
  isDeployedAppEnv,
  isProductionAppEnv,
  requiresHttpsAppUrl,
  resolveAppEnv,
  showsEnvironmentIndicator,
  type AppEnv,
} from "@/config/app-env";
export {
  getRuntimeBuildInfo,
  type RuntimeBuildInfo,
} from "@/config/build-info";
export {
  assertDestructiveOpAllowed,
  type DestructiveOp,
} from "@/config/destructive-ops";
export {
  DEFAULT_PRODUCTION_RESOURCE_MARKERS,
  MEDIA_BUCKET_BY_APP_ENV,
  expectedMediaBucket,
  isRecipientAllowed,
  looksLikeLocalDatabaseUrl,
  mergeProductionMarkers,
  parseRecipientAllowlist,
  resolveOutboundEmailAddress,
} from "@/config/isolation";
export {
  assertEnvironmentConfig,
  assertProductionConfig,
  describeAppEnv,
  resetEnvironmentAssertForTests,
  resetProductionConfigAssertForTests,
} from "@/config/assert";
export { isFeatureEnabled, type FeatureFlag } from "@/config/features";
export {
  getPublicEnv,
  loadPublicEnv,
  resetPublicEnvCacheForTests,
  type ResolvedPublicEnv,
} from "@/config/public";
export {
  getServerEnv,
  loadServerEnv,
  resetServerEnvCacheForTests,
  type ResolvedServerEnv,
} from "@/config/server";

import { getPublicEnv } from "@/config/public";
import { getServerEnv } from "@/config/server";

/**
 * Convenience accessor. Use `env.public` in Edge/client-safe paths and
 * `env.server` only in Node server code (`server-only` module).
 */
export const env = {
  get public() {
    return getPublicEnv();
  },
  get server() {
    return getServerEnv();
  },
};
