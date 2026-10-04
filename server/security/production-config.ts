import "server-only";

/**
 * Back-compat surface for production/environment boot checks.
 * Implementation lives in `@/config/assert`.
 */
export {
  assertEnvironmentConfig,
  assertProductionConfig,
  resetEnvironmentAssertForTests,
  resetProductionConfigAssertForTests,
} from "@/config/assert";
