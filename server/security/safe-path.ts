/**
 * Restrict post-login redirects to same-origin relative app paths.
 * Blocks protocol-relative URLs, backslashes, and non-portal destinations.
 */
export function safeInternalPath(
  value: string | undefined | null,
  fallback = "/member/dashboard",
): string {
  if (!value) return fallback;

  let path = value.trim();
  try {
    path = decodeURIComponent(path);
  } catch {
    return fallback;
  }

  if (!path.startsWith("/")) return fallback;
  if (path.startsWith("//") || path.includes("\\") || path.includes("://")) {
    return fallback;
  }
  // Block control characters / CRLF injection into Location headers.
  if (/[\u0000-\u001f\u007f]/.test(path)) return fallback;

  if (
    path === "/" ||
    path.startsWith("/member") ||
    path.startsWith("/admin")
  ) {
    return path;
  }

  return fallback;
}
