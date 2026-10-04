import { afterEach, describe, expect, it, vi } from "vitest";

describe("developer utilities availability", () => {
  afterEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  it("allows utilities outside production", async () => {
    const { allowsDeveloperUtilities, showsEnvironmentIndicator } =
      await import("@/config/app-env");
    expect(allowsDeveloperUtilities("local")).toBe(true);
    expect(allowsDeveloperUtilities("development")).toBe(true);
    expect(allowsDeveloperUtilities("staging")).toBe(true);
    expect(allowsDeveloperUtilities("production")).toBe(false);
    expect(showsEnvironmentIndicator("production")).toBe(false);
    expect(showsEnvironmentIndicator("staging")).toBe(true);
  });

  it("API guard returns 404 in production", async () => {
    vi.stubEnv("APP_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_APP_ENV", "production");
    const { developerUtilitiesNotFoundResponse } = await import(
      "@/server/dev/guard"
    );
    const response = developerUtilitiesNotFoundResponse();
    expect(response).not.toBeNull();
    expect(response?.status).toBe(404);
  });

  it("API guard allows non-production", async () => {
    vi.stubEnv("APP_ENV", "development");
    vi.stubEnv("NEXT_PUBLIC_APP_ENV", "development");
    const { developerUtilitiesNotFoundResponse } = await import(
      "@/server/dev/guard"
    );
    expect(developerUtilitiesNotFoundResponse()).toBeNull();
  });

  it("runtime diagnostics never include secret-like fields", async () => {
    vi.stubEnv("APP_ENV", "staging");
    vi.stubEnv("NEXT_PUBLIC_APP_ENV", "staging");
    vi.stubEnv("APP_URL", "https://staging.example.test");
    vi.stubEnv("DATABASE_URL", "postgresql://user:secret@db:5432/rjgc_staging");
    vi.stubEnv("AUTH_SECRET", "x".repeat(32));
    vi.stubEnv("PAYMENT_PROVIDER", "mock");
    vi.stubEnv("PAYMENT_MODE", "test");
    vi.stubEnv("RAZORPAY_KEY_SECRET", "should-never-appear");
    const { resetServerEnvCacheForTests, resetPublicEnvCacheForTests } =
      await import("@/config");
    resetServerEnvCacheForTests();
    resetPublicEnvCacheForTests();
    const { getAdminRuntimeDiagnostics } = await import(
      "@/server/ops/runtime-diagnostics"
    );
    const info = getAdminRuntimeDiagnostics();
    const serialized = JSON.stringify(info);
    expect(serialized).not.toMatch(/secret|RAZORPAY|postgresql:\/\/user/i);
    expect(info.databaseEnvironment).toContain("rjgc_staging");
    expect(info.paymentMode).toBe("TEST");
  });
});
