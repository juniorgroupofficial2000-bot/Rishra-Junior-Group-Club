import { afterEach, describe, expect, it, vi } from "vitest";

describe("resolveAppEnv", () => {
  afterEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  it("maps Vercel preview to development when APP_ENV is unset", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("VERCEL_ENV", "preview");
    vi.stubEnv("APP_ENV", "");
    vi.stubEnv("NEXT_PUBLIC_APP_ENV", "");

    const { resolveAppEnv } = await import("@/config/app-env");
    expect(resolveAppEnv(process.env)).toBe("development");
  });

  it("maps Vercel production to production when APP_ENV is unset", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("VERCEL_ENV", "production");
    vi.stubEnv("APP_ENV", "");
    vi.stubEnv("NEXT_PUBLIC_APP_ENV", "");

    const { resolveAppEnv } = await import("@/config/app-env");
    expect(resolveAppEnv(process.env)).toBe("production");
  });

  it("prefers explicit APP_ENV over VERCEL_ENV", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("VERCEL_ENV", "production");
    vi.stubEnv("APP_ENV", "development");

    const { resolveAppEnv } = await import("@/config/app-env");
    expect(resolveAppEnv(process.env)).toBe("development");
  });
});
