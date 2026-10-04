import { afterEach, describe, expect, it, vi } from "vitest";

/**
 * Legacy suite name — production boot checks now live in `@/config/assert`.
 */
describe("assertProductionConfig", () => {
  afterEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  async function load() {
    const mod = await import("@/config");
    mod.resetEnvironmentAssertForTests();
    mod.resetPublicEnvCacheForTests();
    mod.resetServerEnvCacheForTests();
    return mod;
  }

  it("rejects E2E_TEST, ALLOW_DEMO_SEED, and CONTENT_INCLUDE_SAMPLE in production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("VITEST", "false");
    vi.stubEnv("NEXT_PHASE", "");
    vi.stubEnv("APP_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_APP_ENV", "production");
    vi.stubEnv("DATABASE_URL", "postgresql://example");
    vi.stubEnv("REPOSITORY_DRIVER", "prisma");
    vi.stubEnv("APP_URL", "https://example.org");
    vi.stubEnv("AUTH_SECRET", "x".repeat(32));
    vi.stubEnv("CRON_SECRET", "c".repeat(32));
    vi.stubEnv("PAYMENT_PROVIDER", "razorpay");
    vi.stubEnv("PAYMENT_MODE", "live");
    vi.stubEnv("RAZORPAY_KEY_ID", "rzp_live_example");
    vi.stubEnv("RAZORPAY_KEY_SECRET", "secret");
    vi.stubEnv("RAZORPAY_WEBHOOK_SECRET", "whsec");
    vi.stubEnv("REQUIRE_STAFF_MFA", "true");
    vi.stubEnv("EMAIL_PROVIDER", "resend");
    vi.stubEnv("RESEND_API_KEY", "re_x");
    vi.stubEnv("EMAIL_FROM", "a@example.org");
    vi.stubEnv("E2E_TEST", "1");
    vi.stubEnv("ALLOW_DEMO_SEED", "true");
    vi.stubEnv("CONTENT_INCLUDE_SAMPLE", "true");

    const mod = await load();
    expect(() => mod.assertEnvironmentConfig({ force: true })).toThrow(
      /E2E_TEST|ALLOW_DEMO_SEED|CONTENT_INCLUDE_SAMPLE/,
    );
  });

  it("requires MFA and email for PAYMENT_MODE=live in production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("VITEST", "false");
    vi.stubEnv("NEXT_PHASE", "");
    vi.stubEnv("APP_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_APP_ENV", "production");
    vi.stubEnv("DATABASE_URL", "postgresql://example");
    vi.stubEnv("REPOSITORY_DRIVER", "prisma");
    vi.stubEnv("APP_URL", "https://example.org");
    vi.stubEnv("AUTH_SECRET", "x".repeat(32));
    vi.stubEnv("CRON_SECRET", "c".repeat(32));
    vi.stubEnv("PAYMENT_PROVIDER", "razorpay");
    vi.stubEnv("PAYMENT_MODE", "live");
    vi.stubEnv("RAZORPAY_KEY_ID", "rzp_live_example");
    vi.stubEnv("RAZORPAY_KEY_SECRET", "secret");
    vi.stubEnv("RAZORPAY_WEBHOOK_SECRET", "whsec");

    const mod = await load();
    expect(() => mod.assertEnvironmentConfig({ force: true })).toThrow(
      /REQUIRE_STAFF_MFA|email/i,
    );
  });
});
