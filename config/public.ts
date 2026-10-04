import { resolveAppEnv, type AppEnv } from "@/config/app-env";
import {
  coerceProcessEnv,
  publicEnvSchema,
  type PublicEnv,
} from "@/config/schemas";

export type ResolvedPublicEnv = PublicEnv & {
  appEnv: AppEnv;
  appName: string;
  /** Canonical origin without trailing slash; may be undefined during build. */
  appUrl: string | undefined;
  features: {
    memberPortal: boolean;
    payments: boolean;
    events: boolean;
    pujaArchive: boolean;
    gallery: boolean;
    announcements: boolean;
    membershipApplication: boolean;
  };
};

function stripTrailingSlash(url: string): string {
  return url.replace(/\/$/, "");
}

/**
 * Edge-safe public configuration. Never includes secrets.
 */
export function loadPublicEnv(
  source: NodeJS.ProcessEnv = process.env,
): ResolvedPublicEnv {
  const appEnv = resolveAppEnv(source);
  const parsed = publicEnvSchema.safeParse({
    ...coerceProcessEnv(source),
    APP_ENV: source.APP_ENV?.trim() || appEnv,
  });

  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");
    throw new Error(`Invalid public environment configuration: ${details}`);
  }

  const data = parsed.data;
  const rawUrl =
    data.APP_URL ||
    data.NEXT_PUBLIC_APP_URL ||
    data.SITE_URL ||
    data.NEXT_PUBLIC_SITE_URL;

  return {
    ...data,
    APP_ENV: appEnv,
    appEnv,
    appName: data.NEXT_PUBLIC_APP_NAME || data.APP_NAME,
    appUrl: rawUrl ? stripTrailingSlash(rawUrl) : undefined,
    features: {
      memberPortal: data.FEATURE_MEMBER_PORTAL,
      payments: data.FEATURE_PAYMENTS,
      events: data.FEATURE_EVENTS,
      pujaArchive: data.FEATURE_PUJA_ARCHIVE,
      gallery: data.FEATURE_GALLERY,
      announcements: data.FEATURE_ANNOUNCEMENTS,
      membershipApplication: data.FEATURE_MEMBERSHIP_APPLICATION,
    },
  };
}

let cachedPublic: ResolvedPublicEnv | null = null;

/** Cached public env for the current process. */
export function getPublicEnv(): ResolvedPublicEnv {
  if (!cachedPublic) {
    cachedPublic = loadPublicEnv();
  }
  return cachedPublic;
}

/** Test helper. */
export function resetPublicEnvCacheForTests(): void {
  cachedPublic = null;
}
