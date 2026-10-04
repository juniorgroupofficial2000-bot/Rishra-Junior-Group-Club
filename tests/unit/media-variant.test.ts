import { describe, expect, it } from "vitest";
import { isManagedMediaSrc, withMediaVariant } from "@/lib/media/variant";

describe("media variant helpers", () => {
  it("detects managed media paths", () => {
    expect(isManagedMediaSrc("/api/media/abc123?v=md")).toBe(true);
    expect(isManagedMediaSrc("/images/home/hero.svg")).toBe(false);
  });

  it("rewrites variant query for managed media", () => {
    expect(withMediaVariant("/api/media/abc123?v=lg", "thumb")).toBe(
      "/api/media/abc123?v=thumb",
    );
    expect(withMediaVariant("/images/home/hero.svg", "thumb")).toBe(
      "/images/home/hero.svg",
    );
  });
});
