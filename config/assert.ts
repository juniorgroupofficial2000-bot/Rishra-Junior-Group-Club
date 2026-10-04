import "server-only";

import {
  allowsDemoData,
  isProductionAppEnv,
  requiresHttpsAppUrl,
  type AppEnv,
} from "@/config/app-env";
import {
  expectedMediaBucket,
  looksLikeLocalDatabaseUrl,
} from "@/config/isolation";
import {
  getServerEnv,
  loadServerEnv,
  type ResolvedServerEnv,
} from "@/config/server";

let asserted = false;

function isTestOrBuildRuntime(source: NodeJS.ProcessEnv): boolean {
  return (
    source.VITEST === "true" ||
    source.NODE_ENV === "test" ||
    source.NEXT_PHASE === "phase-production-build" ||
    source.npm_lifecycle_event === "build"
  );
}

function looksLikeLocalhostUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return (
      parsed.hostname === "localhost" ||
      parsed.hostname === "127.0.0.1" ||
      parsed.hostname === "::1" ||
      parsed.hostname.endsWith(".local")
    );
  } catch {
    return /localhost|127\.0\.0\.1/i.test(url);
  }
}

function containsMarker(value: string | undefined, markers: string[]): boolean {
  if (!value || markers.length === 0) return false;
  const hay = value.toLowerCase();
  return markers.some((marker) => hay.includes(marker));
}

function collectErrors(env: ResolvedServerEnv): string[] {
  const errors: string[] = [];
  const appEnv = env.appEnv;
  const appUrl = env.appUrl ?? "";
  const markers = env.productionResourceMarkers;

  if (env.NEXT_PUBLIC_APP_ENV && env.NEXT_PUBLIC_APP_ENV !== appEnv) {
    errors.push(
      `NEXT_PUBLIC_APP_ENV (${env.NEXT_PUBLIC_APP_ENV}) must match APP_ENV (${appEnv}).`,
    );
  }

  // ----- Payment isolation (all lanes) -----
  if (!isProductionAppEnv(appEnv)) {
    if (
      env.paymentMode === "live" ||
      env.RAZORPAY_KEY_ID?.startsWith("rzp_live_")
    ) {
      errors.push(
        `FAIL FAST: Live payment credentials are forbidden when APP_ENV=${appEnv}. Use PAYMENT_MODE=test and rzp_test_* keys (or mock).`,
      );
    }
  }

  if (isProductionAppEnv(appEnv)) {
    if (env.paymentProvider === "mock") {
      const mockAllowed =
        env.ALLOW_MOCK_PAYMENTS &&
        env.MOCK_PAYMENTS_CONFIRM === "I_UNDERSTAND_NO_REAL_MONEY";
      if (!mockAllowed) {
        errors.push(
          "FAIL FAST: PAYMENT_PROVIDER=mock is forbidden when APP_ENV=production (set ALLOW_MOCK_PAYMENTS=true and MOCK_PAYMENTS_CONFIRM=I_UNDERSTAND_NO_REAL_MONEY only for emergency bootstrap, or use APP_ENV=development on Preview).",
        );
      }
    }
    if (env.paymentProvider === "razorpay" && env.paymentMode !== "live") {
      errors.push(
        "FAIL FAST: PAYMENT_MODE=test is forbidden when APP_ENV=production. Use staging for sandbox payments.",
      );
    }
    if (
      env.paymentProvider === "razorpay" &&
      env.RAZORPAY_KEY_ID?.startsWith("rzp_test_")
    ) {
      errors.push(
        "FAIL FAST: rzp_test_* Razorpay keys are forbidden when APP_ENV=production.",
      );
    }
  }

  // ----- Database / URL production-marker isolation -----
  if (!isProductionAppEnv(appEnv)) {
    if (
      containsMarker(env.DATABASE_URL, markers) ||
      containsMarker(appUrl, markers) ||
      containsMarker(env.MEDIA_S3_BUCKET, markers) ||
      containsMarker(env.MEDIA_PUBLIC_BASE_URL, markers) ||
      containsMarker(env.EMAIL_FROM, markers) ||
      containsMarker(env.authUrl, markers)
    ) {
      errors.push(
        `APP_ENV=${appEnv} refuses DATABASE_URL/APP_URL/AUTH_URL/MEDIA_*/EMAIL_FROM matching production resource markers (${markers.slice(0, 4).join(", ")}…).`,
      );
    }
  }

  // ----- Storage bucket naming -----
  if (env.mediaStorageDriver === "s3" && env.MEDIA_S3_BUCKET) {
    const expected = expectedMediaBucket(appEnv);
    if (
      expected &&
      env.MEDIA_S3_BUCKET !== expected &&
      !env.ALLOW_NONSTANDARD_MEDIA_BUCKET
    ) {
      errors.push(
        `MEDIA_S3_BUCKET must be "${expected}" when APP_ENV=${appEnv} (got "${env.MEDIA_S3_BUCKET}"). Set ALLOW_NONSTANDARD_MEDIA_BUCKET=true only as an explicit escape hatch.`,
      );
    }
    if (appEnv === "local" && env.MEDIA_S3_BUCKET === "club-production") {
      errors.push(
        "MEDIA_S3_BUCKET=club-production is forbidden when APP_ENV=local.",
      );
    }
  }

  // ----- Email isolation -----
  if (appEnv === "local") {
    if (env.EMAIL_PROVIDER === "resend" && !env.EMAIL_REDIRECT_TO) {
      errors.push(
        "APP_ENV=local with EMAIL_PROVIDER=resend requires EMAIL_REDIRECT_TO (or use EMAIL_PROVIDER=console).",
      );
    }
  }

  if (appEnv === "development" || appEnv === "staging") {
    if (env.EMAIL_PROVIDER === "resend" || env.RESEND_API_KEY) {
      if (!env.EMAIL_REDIRECT_TO && !env.EMAIL_RECIPIENT_ALLOWLIST) {
        errors.push(
          `APP_ENV=${appEnv} outbound email requires EMAIL_REDIRECT_TO and/or EMAIL_RECIPIENT_ALLOWLIST so real members are not emailed.`,
        );
      }
    }
  }

  if (isProductionAppEnv(appEnv)) {
    if (env.EMAIL_REDIRECT_TO) {
      errors.push(
        "EMAIL_REDIRECT_TO must not be set in production (would suppress real delivery).",
      );
    }
    if (env.EMAIL_PROVIDER === "console") {
      errors.push(
        "EMAIL_PROVIDER=console is forbidden in production.",
      );
    }
  }

  // ----- LOCAL -----
  if (appEnv === "local") {
    if (
      env.DATABASE_URL &&
      !looksLikeLocalDatabaseUrl(env.DATABASE_URL) &&
      !env.ALLOW_REMOTE_LOCAL_DATABASE
    ) {
      errors.push(
        "APP_ENV=local requires a local DATABASE_URL (localhost / rjgc_local). Set ALLOW_REMOTE_LOCAL_DATABASE=true only deliberately.",
      );
    }
  }

  // ----- DEVELOPMENT -----
  if (appEnv === "development") {
    if (!env.DATABASE_URL) {
      errors.push("DATABASE_URL must be set in development.");
    }
    if (!env.AUTH_SECRET || env.AUTH_SECRET.length < 32) {
      errors.push(
        "AUTH_SECRET must be set (≥32 characters) in development — never reuse the production secret.",
      );
    }
    if (!env.CRON_SECRET || env.CRON_SECRET.length < 32) {
      errors.push("CRON_SECRET must be set (≥32 characters) in development.");
    }
    if (env.paymentProvider === "razorpay") {
      if (env.paymentMode !== "test") {
        errors.push("DEVELOPMENT requires PAYMENT_MODE=test.");
      }
      if (
        env.RAZORPAY_KEY_ID &&
        !env.RAZORPAY_KEY_ID.startsWith("rzp_test_")
      ) {
        errors.push("DEVELOPMENT Razorpay keys must start with rzp_test_.");
      }
    }
  }

  // ----- STAGING -----
  if (appEnv === "staging") {
    if (!env.DATABASE_URL) {
      errors.push("DATABASE_URL must be set in staging.");
    }
    if (env.repositoryDriver !== "prisma") {
      errors.push("REPOSITORY_DRIVER must be prisma in staging.");
    }
    if (!env.AUTH_SECRET || env.AUTH_SECRET.length < 32) {
      errors.push("AUTH_SECRET must be set (≥32 characters) in staging.");
    }
    if (!appUrl) {
      errors.push("APP_URL must be set in staging.");
    } else if (
      requiresHttpsAppUrl(appEnv) &&
      appUrl.startsWith("http://") &&
      !env.ALLOW_INSECURE_HTTP_SITE_URL
    ) {
      errors.push("APP_URL must use https:// in staging.");
    }
    if (env.paymentMode === "live" || env.RAZORPAY_KEY_ID?.startsWith("rzp_live_")) {
      errors.push(
        "Staging must not use live Razorpay credentials (PAYMENT_MODE=live / rzp_live_*).",
      );
    }
    if (env.paymentProvider === "razorpay" && env.paymentMode !== "test") {
      errors.push("STAGING requires PAYMENT_MODE=test.");
    }
    if (env.E2E_TEST) {
      errors.push("E2E_TEST must not be enabled in staging.");
    }
  }

  // ----- PRODUCTION -----
  if (isProductionAppEnv(appEnv)) {
    if (!env.DATABASE_URL) {
      errors.push("DATABASE_URL must be set in production.");
    } else if (looksLikeLocalhostUrl(env.DATABASE_URL)) {
      errors.push(
        "DATABASE_URL must not point at localhost in production.",
      );
    }

    if (env.repositoryDriver !== "prisma") {
      errors.push("REPOSITORY_DRIVER must be prisma in production.");
    }

    if (!env.AUTH_SECRET || env.AUTH_SECRET.length < 32) {
      errors.push("AUTH_SECRET must be set (≥32 characters) in production.");
    }

    if (!env.CRON_SECRET || env.CRON_SECRET.length < 32) {
      errors.push("CRON_SECRET must be set (≥32 characters) in production.");
    }

    if (!appUrl) {
      errors.push("APP_URL (or SITE_URL) must be set in production.");
    } else {
      if (looksLikeLocalhostUrl(appUrl)) {
        errors.push("APP_URL must not be localhost in production.");
      }
      if (
        appUrl.startsWith("http://") &&
        !env.ALLOW_INSECURE_HTTP_SITE_URL
      ) {
        errors.push("APP_URL must use https:// in production.");
      }
    }

    if (env.E2E_TEST) {
      errors.push("E2E_TEST must not be enabled in production.");
    }
    if (env.ALLOW_DEMO_SEED) {
      errors.push("ALLOW_DEMO_SEED must not be enabled in production.");
    }
    if (env.CONTENT_INCLUDE_SAMPLE) {
      errors.push("CONTENT_INCLUDE_SAMPLE must not be enabled in production.");
    }
    if (env.DEBUG) {
      errors.push("DEBUG must not be enabled in production.");
    }
    if (env.logLevel === "debug") {
      errors.push("LOG_LEVEL=debug is not allowed in production.");
    }
    if (env.ALLOW_DESTRUCTIVE_OPS) {
      errors.push("ALLOW_DESTRUCTIVE_OPS must not be enabled in production.");
    }

    if (env.paymentProvider === "razorpay") {
      if (!env.RAZORPAY_KEY_ID?.startsWith("rzp_live_")) {
        errors.push(
          "Production Razorpay requires RAZORPAY_KEY_ID starting with rzp_live_.",
        );
      }
      if (!env.RAZORPAY_KEY_SECRET) {
        errors.push("RAZORPAY_KEY_SECRET is required in production.");
      }
      if (!env.RAZORPAY_WEBHOOK_SECRET) {
        errors.push("RAZORPAY_WEBHOOK_SECRET is required in production.");
      }
      if (!env.REQUIRE_STAFF_MFA) {
        errors.push("REQUIRE_STAFF_MFA=true is required in production.");
      }
      const emailOk =
        env.EMAIL_PROVIDER === "resend" ||
        (Boolean(env.RESEND_API_KEY) && Boolean(env.EMAIL_FROM));
      if (!emailOk) {
        errors.push(
          "Production payments require email delivery (EMAIL_PROVIDER=resend with RESEND_API_KEY and EMAIL_FROM).",
        );
      }
    }

    if (env.mediaStorageDriver === "s3") {
      if (!env.MEDIA_S3_BUCKET) {
        errors.push("MEDIA_S3_BUCKET is required when MEDIA_STORAGE_DRIVER=s3.");
      }
      if (!env.MEDIA_S3_ACCESS_KEY_ID) {
        errors.push(
          "MEDIA_S3_ACCESS_KEY_ID is required when MEDIA_STORAGE_DRIVER=s3.",
        );
      }
      if (!env.MEDIA_S3_SECRET_ACCESS_KEY) {
        errors.push(
          "MEDIA_S3_SECRET_ACCESS_KEY is required when MEDIA_STORAGE_DRIVER=s3.",
        );
      }
    }
  }

  if (!allowsDemoData(appEnv) && env.CONTENT_INCLUDE_SAMPLE) {
    errors.push(
      "CONTENT_INCLUDE_SAMPLE is only allowed for local/development.",
    );
  }

  return errors;
}

/**
 * Fail-closed environment guard. Safe to call multiple times.
 * Skipped during `next build` and Vitest unless forced.
 */
export function assertEnvironmentConfig(options?: {
  force?: boolean;
  env?: ResolvedServerEnv;
  source?: NodeJS.ProcessEnv;
}): void {
  const source = options?.source ?? process.env;
  if (!options?.force && (asserted || isTestOrBuildRuntime(source))) {
    return;
  }

  const env = options?.env ?? loadServerEnv(source);
  const errors = collectErrors(env);
  asserted = true;

  if (errors.length > 0) {
    throw new Error(
      `Environment configuration invalid (APP_ENV=${env.appEnv}):\n- ${errors.join("\n- ")}`,
    );
  }
}

/**
 * Boot-time assert used by instrumentation / Prisma.
 * Runs for every APP_ENV (rules differ by environment).
 */
export function assertProductionConfig(): void {
  assertEnvironmentConfig();
}

export function resetEnvironmentAssertForTests(): void {
  asserted = false;
}

/** @deprecated Alias for tests. */
export function resetProductionConfigAssertForTests(): void {
  resetEnvironmentAssertForTests();
}

export function describeAppEnv(env: AppEnv = getServerEnv().appEnv): string {
  switch (env) {
    case "local":
      return "LOCAL — developer machine";
    case "development":
      return "DEVELOPMENT — shared feature environment";
    case "staging":
      return "STAGING — production-like pre-release";
    case "production":
      return "PRODUCTION — real members and live systems";
  }
}
