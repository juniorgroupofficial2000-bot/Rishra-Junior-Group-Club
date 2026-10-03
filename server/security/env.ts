/**
 * Runtime env helpers shared by Edge proxy and Node Auth.js handlers.
 * Keep this module free of Node-only / server-only imports and Zod.
 */

import { resolveAppEnv } from "@/config/app-env";

/** True when NODE_ENV is production (includes staging builds). */
export function isProductionRuntime(): boolean {
  return process.env.NODE_ENV === "production";
}

/** True when the logical APP_ENV lane is production. */
export function isProductionAppRuntime(): boolean {
  return resolveAppEnv() === "production";
}

function isNextBuildPhase(): boolean {
  return (
    process.env.NEXT_PHASE === "phase-production-build" ||
    process.env.npm_lifecycle_event === "build"
  );
}

/**
 * Auth.js signing secret. Fails closed in production APP_ENV when unset/weak.
 * A hardcoded fallback is allowed only for local bootstrapping.
 */
export function getAuthSecret(): string {
  const secret = process.env.AUTH_SECRET?.trim();
  if (secret && secret.length >= 32) {
    return secret;
  }

  if (
    (isProductionAppRuntime() || isProductionRuntime()) &&
    !isNextBuildPhase()
  ) {
    throw new Error(
      "AUTH_SECRET must be set to a strong value (min 32 characters) in production.",
    );
  }

  if (secret && secret.length > 0) {
    return secret;
  }

  return "rjgc-dev-only-auth-secret-replace-before-production";
}
