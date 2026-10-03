/**
 * Client-safe structured error reporting (browser console JSON).
 * Never include passwords, tokens, or payment secrets.
 */

export type ClientErrorReport = {
  ts: string;
  level: "error";
  scope: "client";
  event: string;
  service: "rjgc";
  digest?: string;
  message?: string;
  name?: string;
  path?: string;
  portal?: "public" | "member" | "admin" | "root";
};

export function reportClientError(
  error: Error & { digest?: string },
  context?: {
    event?: string;
    portal?: ClientErrorReport["portal"];
    path?: string;
  },
) {
  const entry: ClientErrorReport = {
    ts: new Date().toISOString(),
    level: "error",
    scope: "client",
    event: context?.event ?? "route_error_boundary",
    service: "rjgc",
    digest: error.digest,
    // Production Server Component errors are already generic; keep message short.
    message: error.message?.slice(0, 200),
    name: error.name,
    path: context?.path ?? (typeof window !== "undefined" ? window.location.pathname : undefined),
    portal: context?.portal,
  };

  console.error(JSON.stringify(entry));
}
