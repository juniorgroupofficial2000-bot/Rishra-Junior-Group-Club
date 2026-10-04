/**
 * Client-safe helpers for `/api/media/:id?v=` delivery URLs.
 * Prefer smaller variants in lists for faster paint.
 */

export type PublicMediaVariant = "thumb" | "sm" | "md" | "lg" | "original";

export function isManagedMediaSrc(src: string): boolean {
  return src.startsWith("/api/media/") || src.startsWith("/api/admin/media/");
}

export function withMediaVariant(
  src: string,
  variant: PublicMediaVariant,
): string {
  if (!isManagedMediaSrc(src)) return src;
  try {
    const url = new URL(src, "http://localhost");
    url.searchParams.set("v", variant);
    return `${url.pathname}?${url.searchParams.toString()}`;
  } catch {
    return src;
  }
}
