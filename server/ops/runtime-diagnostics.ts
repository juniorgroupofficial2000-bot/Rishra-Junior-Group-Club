import "server-only";

import {
  environmentBadgeLabel,
  isProductionAppEnv,
} from "@/config/app-env";
import { getRuntimeBuildInfo } from "@/config/build-info";
import { getServerEnv } from "@/config/server";

export type AdminRuntimeDiagnostics = {
  environment: string;
  environmentLabel: string | null;
  version: string;
  commit: string | null;
  buildTimestamp: string | null;
  apiVersion: string;
  databaseEnvironment: string;
  paymentMode: string;
  paymentProvider: string;
  mediaStorageDriver: string;
  isProduction: boolean;
};

/** Safe DB label — database name only, never credentials. */
function safeDatabaseEnvironmentLabel(
  appEnv: string,
  databaseUrl: string | undefined,
): string {
  if (!databaseUrl) return `${appEnv} (no DATABASE_URL)`;
  try {
    const parsed = new URL(databaseUrl);
    const name = parsed.pathname.replace(/^\//, "").split("?")[0];
    return name ? `${appEnv} · ${name}` : appEnv;
  } catch {
    return appEnv;
  }
}

/**
 * Admin-facing diagnostics. Never includes secrets, keys, or tokens.
 */
export function getAdminRuntimeDiagnostics(): AdminRuntimeDiagnostics {
  const env = getServerEnv();
  const build = getRuntimeBuildInfo();
  const badge = environmentBadgeLabel(env.appEnv);

  return {
    environment: env.appEnv.toUpperCase(),
    environmentLabel: badge,
    version: build.version,
    commit: build.commitShort,
    buildTimestamp: build.buildTimestamp,
    apiVersion: build.apiVersion,
    databaseEnvironment: safeDatabaseEnvironmentLabel(
      env.appEnv,
      env.DATABASE_URL,
    ),
    paymentMode: env.paymentMode.toUpperCase(),
    paymentProvider: env.paymentProvider,
    mediaStorageDriver: env.mediaStorageDriver,
    isProduction: isProductionAppEnv(env.appEnv),
  };
}
