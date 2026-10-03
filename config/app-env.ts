/**
 * Application deployment environment (logical), distinct from NODE_ENV.
 * NODE_ENV is still "production" for staging builds; APP_ENV tells us which lane.
 */

export const APP_ENVS = [
  "local",
  "development",
  "staging",
  "production",
] as const;

export type AppEnv = (typeof APP_ENVS)[number];

export function isAppEnv(value: unknown): value is AppEnv {
  return typeof value === "string" && (APP_ENVS as readonly string[]).includes(value);
}

/**
 * Resolve APP_ENV from the process environment.
 * Defaults: production NODE_ENV → production; otherwise local.
 */
export function resolveAppEnv(
  source: NodeJS.ProcessEnv = process.env,
): AppEnv {
  const raw =
    source.APP_ENV?.trim().toLowerCase() ||
    source.NEXT_PUBLIC_APP_ENV?.trim().toLowerCase();

  if (isAppEnv(raw)) return raw;

  if (source.NODE_ENV === "production") return "production";
  return "local";
}

export function isDeployedAppEnv(env: AppEnv): boolean {
  return env === "development" || env === "staging" || env === "production";
}

export function isProductionAppEnv(env: AppEnv): boolean {
  return env === "production";
}

/** Environments that may use mock payments / demo seed with explicit flags. */
export function allowsDemoData(env: AppEnv): boolean {
  return env === "local" || env === "development";
}

/** Environments that must use HTTPS public URLs. */
export function requiresHttpsAppUrl(env: AppEnv): boolean {
  return env === "staging" || env === "production";
}

/** Subtle UI ribbon — never on production. */
export function showsEnvironmentIndicator(env: AppEnv): boolean {
  return env === "local" || env === "development" || env === "staging";
}

/** Developer utilities page/API — never on production. */
export function allowsDeveloperUtilities(env: AppEnv): boolean {
  return env === "local" || env === "development" || env === "staging";
}

/** Uppercase label for badges (LOCAL / DEVELOPMENT / STAGING). */
export function environmentBadgeLabel(env: AppEnv): string | null {
  if (!showsEnvironmentIndicator(env)) return null;
  return env.toUpperCase();
}
