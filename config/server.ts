import "server-only";

import { resolveAppEnv, type AppEnv } from "@/config/app-env";
import { mergeProductionMarkers } from "@/config/isolation";
import { loadPublicEnv, type ResolvedPublicEnv } from "@/config/public";
import {
  coerceProcessEnv,
  serverEnvSchema,
  type ServerEnv,
} from "@/config/schemas";

export type ResolvedServerEnv = ServerEnv &
  ResolvedPublicEnv & {
    appEnv: AppEnv;
    logLevel: "debug" | "info" | "warn" | "error";
    repositoryDriver: "prisma" | "mock";
    paymentProvider: "mock" | "razorpay";
    paymentMode: "test" | "live";
    mediaStorageDriver: "local" | "s3";
    authUrl: string | undefined;
    productionResourceMarkers: string[];
  };

function defaultLogLevel(appEnv: AppEnv): "debug" | "info" | "warn" | "error" {
  if (appEnv === "local" || appEnv === "development") return "debug";
  if (appEnv === "staging") return "info";
  return "warn";
}

/**
 * Load and normalize server configuration (secrets included).
 * Call `assertEnvironmentConfig()` at boot for fail-closed checks.
 */
export function loadServerEnv(
  source: NodeJS.ProcessEnv = process.env,
): ResolvedServerEnv {
  const publicEnv = loadPublicEnv(source);
  const appEnv = resolveAppEnv(source);
  const parsed = serverEnvSchema.safeParse({
    ...coerceProcessEnv(source),
    APP_ENV: source.APP_ENV?.trim() || appEnv,
  });

  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");
    throw new Error(`Invalid server environment configuration: ${details}`);
  }

  const data = parsed.data;
  const hasDatabase = Boolean(data.DATABASE_URL);

  return {
    ...publicEnv,
    ...data,
    APP_ENV: appEnv,
    appEnv,
    logLevel: data.LOG_LEVEL ?? defaultLogLevel(appEnv),
    repositoryDriver:
      data.REPOSITORY_DRIVER ?? (hasDatabase ? "prisma" : "mock"),
    paymentProvider: data.PAYMENT_PROVIDER ?? "mock",
    paymentMode: data.PAYMENT_MODE ?? "test",
    mediaStorageDriver: data.MEDIA_STORAGE_DRIVER ?? "local",
    authUrl: data.AUTH_URL
      ? data.AUTH_URL.replace(/\/$/, "")
      : publicEnv.appUrl,
    productionResourceMarkers: mergeProductionMarkers(
      data.PRODUCTION_RESOURCE_MARKERS,
    ),
  };
}

let cachedServer: ResolvedServerEnv | null = null;

export function getServerEnv(): ResolvedServerEnv {
  if (!cachedServer) {
    cachedServer = loadServerEnv();
  }
  return cachedServer;
}

export function resetServerEnvCacheForTests(): void {
  cachedServer = null;
}
