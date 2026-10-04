import "server-only";

/**
 * Detect missing Vercel env vars without relying on instrumentation module
 * singletons (Next may isolate those from the App Router bundle).
 */
export function getDeploymentSetupError(
  source: NodeJS.ProcessEnv = process.env,
): string | null {
  const missing: string[] = [];

  if (!source.DATABASE_URL?.trim()) {
    missing.push("DATABASE_URL");
  }
  if (!source.AUTH_SECRET || source.AUTH_SECRET.trim().length < 32) {
    missing.push("AUTH_SECRET (≥32 characters)");
  }
  if (!source.CRON_SECRET || source.CRON_SECRET.trim().length < 32) {
    missing.push("CRON_SECRET (≥32 characters)");
  }

  const appUrl =
    source.APP_URL?.trim() ||
    source.NEXT_PUBLIC_APP_URL?.trim() ||
    source.SITE_URL?.trim() ||
    (source.VERCEL_URL?.trim()
      ? source.VERCEL_URL.startsWith("http")
        ? source.VERCEL_URL
        : `https://${source.VERCEL_URL}`
      : "");
  if (!appUrl) {
    missing.push("APP_URL (or rely on VERCEL_URL)");
  }

  if (missing.length === 0) return null;

  return `Missing required environment variables: ${missing.join(", ")}.`;
}
