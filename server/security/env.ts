/**
 * Runtime env helpers shared by Edge proxy and Node Auth.js handlers.
 * Keep this module free of Node-only / server-only imports and Zod.
 */

/** True when NODE_ENV is production (includes staging builds). */
export function isProductionRuntime(): boolean {
  return process.env.NODE_ENV === "production";
}

/**
 * Auth.js signing secret.
 *
 * Never throw here — `proxy.ts` / edge auth config import this at module load.
 * A throw during Edge init becomes an opaque 500 for every route on Vercel,
 * including the public homepage. Missing/weak secrets are enforced by
 * `assertEnvironmentConfig()` and surfaced via the env setup panel instead.
 */
export function getAuthSecret(): string {
  const secret = process.env.AUTH_SECRET?.trim();
  if (secret && secret.length >= 32) {
    return secret;
  }

  if (secret && secret.length > 0) {
    return secret;
  }

  // Deterministic bootstrap placeholder so Edge auth can load. Not safe for
  // real sessions — set AUTH_SECRET (≥32 chars) before enabling login.
  return "rjgc-dev-only-auth-secret-replace-before-production";
}
