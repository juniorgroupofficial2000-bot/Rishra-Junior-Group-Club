import { z } from "zod";
import { APP_ENVS } from "@/config/app-env";

const emptyToUndefined = (value: unknown) => {
  if (value == null) return undefined;
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
};

const optionalString = z.preprocess(emptyToUndefined, z.string().optional());

const boolFromEnv = (defaultValue = false) =>
  z.preprocess((value) => {
    if (value == null || value === "") return defaultValue;
    if (typeof value === "boolean") return value;
    const normalized = String(value).trim().toLowerCase();
    if (["1", "true", "yes", "on"].includes(normalized)) return true;
    if (["0", "false", "no", "off"].includes(normalized)) return false;
    return defaultValue;
  }, z.boolean());

/**
 * Public / edge-safe configuration.
 * Only values that may ship to the browser belong here (NEXT_PUBLIC_* or mirrors).
 */
export const publicEnvSchema = z.object({
  APP_ENV: z.enum(APP_ENVS).default("local"),
  APP_NAME: z.string().default("Rishra Junior Group Club"),
  /** Canonical public origin (no trailing slash). */
  APP_URL: z.string().url().optional(),
  /** Legacy alias — prefer APP_URL. */
  SITE_URL: z.string().url().optional(),
  NEXT_PUBLIC_APP_ENV: z.enum(APP_ENVS).optional(),
  NEXT_PUBLIC_APP_NAME: z.string().optional(),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),

  FEATURE_MEMBER_PORTAL: boolFromEnv(true),
  FEATURE_PAYMENTS: boolFromEnv(true),
  FEATURE_EVENTS: boolFromEnv(true),
  FEATURE_PUJA_ARCHIVE: boolFromEnv(true),
  FEATURE_GALLERY: boolFromEnv(true),
  FEATURE_ANNOUNCEMENTS: boolFromEnv(true),
  FEATURE_MEMBERSHIP_APPLICATION: boolFromEnv(true),

  /** May expose SAMPLE CMS rows on public pages — never in production. */
  CONTENT_INCLUDE_SAMPLE: boolFromEnv(false),

  CONTACT_PUBLIC_EMAIL: optionalString,
  CONTACT_PUBLIC_PHONE: optionalString,
  CONTACT_PUBLIC_HOURS: optionalString,
});

export type PublicEnv = z.infer<typeof publicEnvSchema>;

/**
 * Server-only configuration. Secrets must never be prefixed with NEXT_PUBLIC_.
 * Parsing is lenient for missing optional groups; `assertEnvironmentConfig`
 * enforces per-APP_ENV requirements.
 */
export const serverEnvSchema = publicEnvSchema.extend({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  LOG_LEVEL: z
    .enum(["debug", "info", "warn", "error"])
    .optional(),
  DEBUG: boolFromEnv(false),

  DATABASE_URL: optionalString,
  REPOSITORY_DRIVER: z
    .preprocess(
      emptyToUndefined,
      z.enum(["prisma", "mock"]).optional(),
    )
    .optional(),

  AUTH_SECRET: optionalString,
  AUTH_URL: z.preprocess(emptyToUndefined, z.string().url().optional()),
  REQUIRE_STAFF_MFA: boolFromEnv(false),

  MEDIA_STORAGE_DRIVER: z
    .preprocess(emptyToUndefined, z.enum(["local", "s3"]).optional())
    .optional(),
  MEDIA_LOCAL_ROOT: optionalString,
  MEDIA_S3_BUCKET: optionalString,
  MEDIA_S3_REGION: optionalString,
  MEDIA_S3_ENDPOINT: optionalString,
  MEDIA_S3_ACCESS_KEY_ID: optionalString,
  MEDIA_S3_SECRET_ACCESS_KEY: optionalString,
  MEDIA_S3_FORCE_PATH_STYLE: boolFromEnv(true),
  MEDIA_PUBLIC_BASE_URL: z.preprocess(
    emptyToUndefined,
    z.string().url().optional(),
  ),

  EMAIL_PROVIDER: z
    .preprocess(emptyToUndefined, z.enum(["resend", "console"]).optional())
    .optional(),
  RESEND_API_KEY: optionalString,
  EMAIL_FROM: optionalString,
  /**
   * Non-production outbound email control.
   * Comma-separated exact emails and/or @domains (e.g. qa@club.test,@rjgc.test).
   */
  EMAIL_RECIPIENT_ALLOWLIST: optionalString,
  /** When set in non-production, non-allowlisted recipients are redirected here. */
  EMAIL_REDIRECT_TO: optionalString,

  PAYMENT_PROVIDER: z
    .preprocess(emptyToUndefined, z.enum(["mock", "razorpay"]).optional())
    .optional(),
  PAYMENT_MODE: z
    .preprocess(emptyToUndefined, z.enum(["test", "live"]).optional())
    .optional(),
  PAYMENT_WEBHOOK_SECRET: optionalString,
  RAZORPAY_KEY_ID: optionalString,
  RAZORPAY_KEY_SECRET: optionalString,
  RAZORPAY_WEBHOOK_SECRET: optionalString,
  ALLOW_MOCK_PAYMENTS: boolFromEnv(false),
  MOCK_PAYMENTS_CONFIRM: optionalString,

  CRON_SECRET: optionalString,

  SENTRY_DSN: optionalString,
  NEXT_PUBLIC_SENTRY_DSN: optionalString,
  ANALYTICS_ENABLED: boolFromEnv(false),

  ALLOW_DEMO_SEED: boolFromEnv(false),
  ALLOW_DESIGN_SYSTEM: boolFromEnv(false),
  ALLOW_INSECURE_HTTP_SITE_URL: boolFromEnv(false),
  ALLOW_INSECURE_SITE_URL_FALLBACK: boolFromEnv(false),
  /** Allow APP_ENV=local to use a remote (non-localhost) DATABASE_URL deliberately. */
  ALLOW_REMOTE_LOCAL_DATABASE: boolFromEnv(false),
  /** Allow non-canonical MEDIA_S3_BUCKET names (escape hatch; prefer club-* names). */
  ALLOW_NONSTANDARD_MEDIA_BUCKET: boolFromEnv(false),
  /**
   * Dual-confirm for destructive ops (seed wipe, migrate reset, financial hard-delete)
   * outside local/test. Staging always requires this.
   */
  ALLOW_DESTRUCTIVE_OPS: boolFromEnv(false),
  DESTRUCTIVE_OPS_CONFIRM: optionalString,
  E2E_TEST: boolFromEnv(false),

  /**
   * Comma-separated substrings that identify production resources.
   * Merged with built-in defaults (club-production, rjgc_production, …).
   * Non-production APP_ENV values refuse DATABASE_URL / APP_URL / media / email
   * values containing these markers.
   */
  PRODUCTION_RESOURCE_MARKERS: optionalString,
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

export function coerceProcessEnv(
  source: NodeJS.ProcessEnv = process.env,
): Record<string, string | undefined> {
  const out: Record<string, string | undefined> = {};
  for (const [key, value] of Object.entries(source)) {
    if (typeof value === "string") out[key] = value;
  }
  return out;
}
