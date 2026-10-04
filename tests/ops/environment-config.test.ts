import { afterEach, describe, expect, it, vi } from "vitest";

describe("assertEnvironmentConfig", () => {
  afterEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  async function loadAssert() {
    const mod = await import("@/config");
    mod.resetEnvironmentAssertForTests();
    mod.resetPublicEnvCacheForTests();
    mod.resetServerEnvCacheForTests();
    return mod;
  }

  it("rejects demo flags and test payments in APP_ENV=production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("VITEST", "false");
    vi.stubEnv("NEXT_PHASE", "");
    vi.stubEnv("APP_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_APP_ENV", "production");
    vi.stubEnv("APP_URL", "https://rishrajuniorgroupclub.in");
    vi.stubEnv("DATABASE_URL", "postgresql://u:p@prod-db:5432/rjgc");
    vi.stubEnv("REPOSITORY_DRIVER", "prisma");
    vi.stubEnv("AUTH_SECRET", "x".repeat(32));
    vi.stubEnv("CRON_SECRET", "c".repeat(32));
    vi.stubEnv("PAYMENT_PROVIDER", "razorpay");
    vi.stubEnv("PAYMENT_MODE", "test");
    vi.stubEnv("RAZORPAY_KEY_ID", "rzp_test_example");
    vi.stubEnv("RAZORPAY_KEY_SECRET", "secret");
    vi.stubEnv("RAZORPAY_WEBHOOK_SECRET", "whsec");
    vi.stubEnv("CONTENT_INCLUDE_SAMPLE", "true");

    const mod = await loadAssert();
    expect(() =>
      mod.assertEnvironmentConfig({ force: true }),
    ).toThrow(/PAYMENT_MODE|CONTENT_INCLUDE_SAMPLE|live|FAIL FAST/i);
  });

  it("rejects live Razorpay keys when APP_ENV=development", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("VITEST", "false");
    vi.stubEnv("NEXT_PHASE", "");
    vi.stubEnv("APP_ENV", "development");
    vi.stubEnv("NEXT_PUBLIC_APP_ENV", "development");
    vi.stubEnv("APP_URL", "https://dev.example.test");
    vi.stubEnv("DATABASE_URL", "postgresql://u:p@dev-db:5432/rjgc_development");
    vi.stubEnv("REPOSITORY_DRIVER", "prisma");
    vi.stubEnv("AUTH_SECRET", "x".repeat(32));
    vi.stubEnv("CRON_SECRET", "c".repeat(32));
    vi.stubEnv("PAYMENT_PROVIDER", "razorpay");
    vi.stubEnv("PAYMENT_MODE", "live");
    vi.stubEnv("RAZORPAY_KEY_ID", "rzp_live_example");
    vi.stubEnv("RAZORPAY_KEY_SECRET", "secret");
    vi.stubEnv("EMAIL_PROVIDER", "console");

    const mod = await loadAssert();
    expect(() =>
      mod.assertEnvironmentConfig({ force: true }),
    ).toThrow(/FAIL FAST|Live payment|forbidden/i);
  });

  it("rejects live Razorpay keys when APP_ENV=staging", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("VITEST", "false");
    vi.stubEnv("NEXT_PHASE", "");
    vi.stubEnv("APP_ENV", "staging");
    vi.stubEnv("NEXT_PUBLIC_APP_ENV", "staging");
    vi.stubEnv("APP_URL", "https://staging.rishrajuniorgroupclub.in");
    vi.stubEnv("DATABASE_URL", "postgresql://u:p@staging-db:5432/rjgc");
    vi.stubEnv("REPOSITORY_DRIVER", "prisma");
    vi.stubEnv("AUTH_SECRET", "x".repeat(32));
    vi.stubEnv("CRON_SECRET", "c".repeat(32));
    vi.stubEnv("PAYMENT_PROVIDER", "razorpay");
    vi.stubEnv("PAYMENT_MODE", "live");
    vi.stubEnv("RAZORPAY_KEY_ID", "rzp_live_example");
    vi.stubEnv("RAZORPAY_KEY_SECRET", "secret");
    vi.stubEnv("RAZORPAY_WEBHOOK_SECRET", "whsec");
    vi.stubEnv("EMAIL_REDIRECT_TO", "qa@rjgc.test");

    const mod = await loadAssert();
    expect(() =>
      mod.assertEnvironmentConfig({ force: true }),
    ).toThrow(/live Razorpay|PAYMENT_MODE=live|FAIL FAST/i);
  });

  it("rejects wrong S3 bucket name for development", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("VITEST", "false");
    vi.stubEnv("NEXT_PHASE", "");
    vi.stubEnv("APP_ENV", "development");
    vi.stubEnv("NEXT_PUBLIC_APP_ENV", "development");
    vi.stubEnv("APP_URL", "https://dev.example.test");
    vi.stubEnv("DATABASE_URL", "postgresql://u:p@dev-db:5432/rjgc_development");
    vi.stubEnv("AUTH_SECRET", "x".repeat(32));
    vi.stubEnv("CRON_SECRET", "c".repeat(32));
    vi.stubEnv("PAYMENT_PROVIDER", "mock");
    vi.stubEnv("PAYMENT_MODE", "test");
    vi.stubEnv("MEDIA_STORAGE_DRIVER", "s3");
    vi.stubEnv("MEDIA_S3_BUCKET", "club-production");
    vi.stubEnv("MEDIA_S3_ACCESS_KEY_ID", "x");
    vi.stubEnv("MEDIA_S3_SECRET_ACCESS_KEY", "y");
    vi.stubEnv("EMAIL_PROVIDER", "console");

    const mod = await loadAssert();
    expect(() =>
      mod.assertEnvironmentConfig({ force: true }),
    ).toThrow(/MEDIA_S3_BUCKET|club-dev|production resource markers/i);
  });

  it("rejects development Resend without redirect/allowlist", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("VITEST", "false");
    vi.stubEnv("NEXT_PHASE", "");
    vi.stubEnv("APP_ENV", "development");
    vi.stubEnv("NEXT_PUBLIC_APP_ENV", "development");
    vi.stubEnv("APP_URL", "https://dev.example.test");
    vi.stubEnv("DATABASE_URL", "postgresql://u:p@dev-db:5432/rjgc_development");
    vi.stubEnv("AUTH_SECRET", "x".repeat(32));
    vi.stubEnv("CRON_SECRET", "c".repeat(32));
    vi.stubEnv("PAYMENT_PROVIDER", "mock");
    vi.stubEnv("EMAIL_PROVIDER", "resend");
    vi.stubEnv("RESEND_API_KEY", "re_test");
    vi.stubEnv("EMAIL_FROM", "dev@example.test");
    vi.stubEnv("MEDIA_STORAGE_DRIVER", "local");

    const mod = await loadAssert();
    expect(() =>
      mod.assertEnvironmentConfig({ force: true }),
    ).toThrow(/EMAIL_REDIRECT_TO|EMAIL_RECIPIENT_ALLOWLIST/);
  });

  it("rejects non-production DATABASE_URL matching PRODUCTION_RESOURCE_MARKERS", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("VITEST", "false");
    vi.stubEnv("NEXT_PHASE", "");
    vi.stubEnv("APP_ENV", "local");
    vi.stubEnv("APP_URL", "http://localhost:3000");
    vi.stubEnv("DATABASE_URL", "postgresql://u:p@rjgc-prod-db:5432/rjgc");
    vi.stubEnv("PRODUCTION_RESOURCE_MARKERS", "rjgc-prod");
    vi.stubEnv("AUTH_SECRET", "x".repeat(32));
    vi.stubEnv("PAYMENT_PROVIDER", "mock");

    const mod = await loadAssert();
    expect(() =>
      mod.assertEnvironmentConfig({ force: true }),
    ).toThrow(/PRODUCTION_RESOURCE_MARKERS|production resource markers|local DATABASE_URL/i);
  });

  it("accepts a minimal local configuration", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("VITEST", "false");
    vi.stubEnv("NEXT_PHASE", "");
    vi.stubEnv("APP_ENV", "local");
    vi.stubEnv("APP_URL", "http://localhost:3000");
    vi.stubEnv("DATABASE_URL", "postgresql://u:p@localhost:5432/rjgc_local");
    vi.stubEnv("PRODUCTION_RESOURCE_MARKERS", "rjgc-prod");
    vi.stubEnv("AUTH_SECRET", "x".repeat(32));
    vi.stubEnv("PAYMENT_PROVIDER", "mock");
    vi.stubEnv("PAYMENT_MODE", "test");
    vi.stubEnv("EMAIL_PROVIDER", "console");
    vi.stubEnv("MEDIA_STORAGE_DRIVER", "local");

    const mod = await loadAssert();
    expect(() => mod.assertEnvironmentConfig({ force: true })).not.toThrow();
  });

  it("accepts development with club-dev bucket and email redirect", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("VITEST", "false");
    vi.stubEnv("NEXT_PHASE", "");
    vi.stubEnv("APP_ENV", "development");
    vi.stubEnv("NEXT_PUBLIC_APP_ENV", "development");
    vi.stubEnv("APP_URL", "https://dev.example.test");
    vi.stubEnv("DATABASE_URL", "postgresql://u:p@dev-db:5432/rjgc_development");
    vi.stubEnv("AUTH_SECRET", "x".repeat(32));
    vi.stubEnv("CRON_SECRET", "c".repeat(32));
    vi.stubEnv("PAYMENT_PROVIDER", "razorpay");
    vi.stubEnv("PAYMENT_MODE", "test");
    vi.stubEnv("RAZORPAY_KEY_ID", "rzp_test_ok");
    vi.stubEnv("RAZORPAY_KEY_SECRET", "secret");
    vi.stubEnv("MEDIA_STORAGE_DRIVER", "s3");
    vi.stubEnv("MEDIA_S3_BUCKET", "club-dev");
    vi.stubEnv("MEDIA_S3_ACCESS_KEY_ID", "x");
    vi.stubEnv("MEDIA_S3_SECRET_ACCESS_KEY", "y");
    vi.stubEnv("EMAIL_PROVIDER", "resend");
    vi.stubEnv("RESEND_API_KEY", "re_test");
    vi.stubEnv("EMAIL_FROM", "dev@example.test");
    vi.stubEnv("EMAIL_REDIRECT_TO", "inbox@example.test");

    const mod = await loadAssert();
    expect(() => mod.assertEnvironmentConfig({ force: true })).not.toThrow();
  });
});

describe("assertDestructiveOpAllowed", () => {
  afterEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  it("refuses production", async () => {
    vi.stubEnv("APP_ENV", "production");
    vi.stubEnv("DATABASE_URL", "postgresql://u:p@prod:5432/rjgc");
    const { assertDestructiveOpAllowed } = await import("@/config/destructive-ops");
    expect(() =>
      assertDestructiveOpAllowed("database_seed_wipe"),
    ).toThrow(/APP_ENV=production/);
  });

  it("refuses staging without dual confirm", async () => {
    vi.stubEnv("APP_ENV", "staging");
    vi.stubEnv("DATABASE_URL", "postgresql://u:p@staging:5432/rjgc_staging");
    const { assertDestructiveOpAllowed } = await import("@/config/destructive-ops");
    expect(() =>
      assertDestructiveOpAllowed("database_reset"),
    ).toThrow(/ALLOW_DESTRUCTIVE_OPS/);
  });
});

describe("email recipient isolation", () => {
  it("redirects non-allowlisted recipients outside production", async () => {
    const { resolveOutboundEmailAddress } = await import("@/config/isolation");
    const resolved = resolveOutboundEmailAddress("member@real.example", {
      APP_ENV: "development",
      EMAIL_REDIRECT_TO: "dev-inbox@rjgc.test",
      EMAIL_RECIPIENT_ALLOWLIST: "qa@rjgc.test",
    } as unknown as NodeJS.ProcessEnv);
    expect(resolved.to).toBe("dev-inbox@rjgc.test");
    expect(resolved.redirected).toBe(true);
  });

  it("allows production recipients unchanged", async () => {
    const { resolveOutboundEmailAddress } = await import("@/config/isolation");
    const resolved = resolveOutboundEmailAddress("member@real.example", {
      APP_ENV: "production",
    } as unknown as NodeJS.ProcessEnv);
    expect(resolved.to).toBe("member@real.example");
    expect(resolved.redirected).toBe(false);
  });
});
