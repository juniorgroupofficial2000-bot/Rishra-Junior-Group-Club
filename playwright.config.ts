import { defineConfig, devices } from "@playwright/test";

// Must match AUTH_URL / SITE_URL host (cookie + Auth.js trustHost).
const baseURL = process.env.E2E_BASE_URL ?? "http://localhost:3000";

/**
 * End-to-end suite against a running Next.js app (sandbox / local).
 * Starts `next dev` when no server is already listening.
 */
export default defineConfig({
  testDir: "e2e",
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  timeout: 90_000,
  expect: { timeout: 15_000 },
  reporter: [["list"], ["html", { open: "never", outputFolder: "playwright-report" }]],
  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npm run dev -- --hostname localhost --port 3000",
    url: baseURL,
    // Always start with E2E_TEST=1 so auth rate limits do not flake.
    reuseExistingServer: false,
    timeout: 180_000,
    env: {
      ...process.env,
      E2E_TEST: "1",
    },
  },
});
