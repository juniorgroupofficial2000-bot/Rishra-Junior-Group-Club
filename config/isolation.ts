import type { AppEnv } from "@/config/app-env";

/**
 * Canonical object-storage bucket names per APP_ENV.
 * Enforced at boot when MEDIA_STORAGE_DRIVER=s3 so uploads cannot cross lanes.
 */
export const MEDIA_BUCKET_BY_APP_ENV: Record<
  Exclude<AppEnv, "local">,
  string
> = {
  development: "club-dev",
  staging: "club-staging",
  production: "club-production",
};

/** Default substrings that identify production resources in connection strings / URLs. */
export const DEFAULT_PRODUCTION_RESOURCE_MARKERS = [
  "club-production",
  "rjgc_production",
  "rjgc-prod",
  "rjgc-prod-media",
] as const;

export function expectedMediaBucket(appEnv: AppEnv): string | null {
  if (appEnv === "local") return null;
  return MEDIA_BUCKET_BY_APP_ENV[appEnv];
}

export function mergeProductionMarkers(
  configured: string | undefined,
): string[] {
  const fromEnv = (configured ?? "")
    .split(",")
    .map((part) => part.trim().toLowerCase())
    .filter(Boolean);
  const defaults = DEFAULT_PRODUCTION_RESOURCE_MARKERS.map((m) => m.toLowerCase());
  return Array.from(new Set([...defaults, ...fromEnv]));
}

export function looksLikeLocalDatabaseUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    const host =
      parsed.hostname === "localhost" ||
      parsed.hostname === "127.0.0.1" ||
      parsed.hostname === "::1" ||
      parsed.hostname.endsWith(".local");
    const name = /rjgc_local|[/._-]local([/?_]|$)/i.test(
      `${parsed.pathname}${parsed.search}`,
    );
    return host || name;
  } catch {
    return /localhost|127\.0\.0\.1|rjgc_local/i.test(url);
  }
}

/**
 * Parse EMAIL_RECIPIENT_ALLOWLIST — emails and @domains.
 * Example: `qa@example.com,@rjgc.test`
 */
export function parseRecipientAllowlist(
  raw: string | undefined,
): { emails: Set<string>; domains: Set<string> } {
  const emails = new Set<string>();
  const domains = new Set<string>();
  for (const part of (raw ?? "").split(",")) {
    const token = part.trim().toLowerCase();
    if (!token) continue;
    if (token.startsWith("@")) {
      domains.add(token.slice(1));
    } else if (token.includes("@")) {
      emails.add(token);
    }
  }
  return { emails, domains };
}

export function isRecipientAllowed(
  email: string,
  allowlist: { emails: Set<string>; domains: Set<string> },
): boolean {
  const normalized = email.trim().toLowerCase();
  if (allowlist.emails.has(normalized)) return true;
  const at = normalized.lastIndexOf("@");
  if (at < 0) return false;
  const domain = normalized.slice(at + 1);
  return allowlist.domains.has(domain);
}

/**
 * Resolve the actual delivery address for non-production isolation.
 * - production: original recipient
 * - allowlisted: original recipient
 * - else redirect to EMAIL_REDIRECT_TO when configured
 * - else block send
 */
export function resolveOutboundEmailAddress(
  intended: string,
  source: NodeJS.ProcessEnv = process.env,
): { to: string; redirected: boolean; blocked?: string } {
  const raw =
    source.APP_ENV?.trim().toLowerCase() ||
    source.NEXT_PUBLIC_APP_ENV?.trim().toLowerCase() ||
    "";
  const appEnv = raw || "local";

  if (appEnv === "production") {
    return { to: intended, redirected: false };
  }

  const allowlist = parseRecipientAllowlist(source.EMAIL_RECIPIENT_ALLOWLIST);
  if (isRecipientAllowed(intended, allowlist)) {
    return { to: intended, redirected: false };
  }

  const redirect = source.EMAIL_REDIRECT_TO?.trim();
  if (redirect) {
    return { to: redirect, redirected: true };
  }

  return {
    to: intended,
    redirected: false,
    blocked:
      "Recipient not allowlisted and EMAIL_REDIRECT_TO is unset — refusing outbound email outside production.",
  };
}
