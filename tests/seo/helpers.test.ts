import { afterEach, describe, expect, it } from "vitest";
import {
  absoluteUrl,
  getSiteUrl,
  isLocalSiteUrl,
  seoDefaults,
} from "@/lib/seo/config";
import { buildMetadata, privatePageMetadata } from "@/lib/seo/metadata";
import { robotsDisallowPaths, seoRouteRules } from "@/lib/seo/routes";
import { eventJsonLd, faqPageJsonLd } from "@/lib/seo/structured-data";
import type { ClubEvent } from "@/content/events";

import {
  resetPublicEnvCacheForTests,
  resetServerEnvCacheForTests,
} from "@/config";

const originalSiteUrl = process.env.SITE_URL;

afterEach(() => {
  if (originalSiteUrl === undefined) {
    delete process.env.SITE_URL;
  } else {
    process.env.SITE_URL = originalSiteUrl;
  }
  delete process.env.APP_URL;
  delete process.env.NEXT_PUBLIC_APP_URL;
  resetPublicEnvCacheForTests();
  resetServerEnvCacheForTests();
});

describe("SEO helpers", () => {
  it("builds absolute URLs from SITE_URL without trailing-slash duplication", () => {
    process.env.SITE_URL = "https://example.org/";
    resetPublicEnvCacheForTests();
    expect(getSiteUrl()).toBe("https://example.org");
    expect(absoluteUrl("/")).toBe("https://example.org/");
    expect(absoluteUrl("/events")).toBe("https://example.org/events");
    expect(absoluteUrl("contact")).toBe("https://example.org/contact");
    expect(isLocalSiteUrl()).toBe(false);
  });

  it("detects localhost origins", () => {
    expect(isLocalSiteUrl("http://localhost:3000")).toBe(true);
    expect(isLocalSiteUrl("https://rjgc.example")).toBe(false);
  });

  it("emits canonical + index robots for public pages", () => {
    process.env.SITE_URL = "https://example.org";
    resetPublicEnvCacheForTests();
    const meta = buildMetadata({
      title: "Events",
      description: "Club events",
      path: "/events",
    });
    expect(meta.alternates?.canonical).toBe("/events");
    expect(meta.robots).toMatchObject({ index: true, follow: true });
    expect(meta.openGraph?.url).toBe("https://example.org/events");
    expect(meta.openGraph?.locale).toBe(seoDefaults.locale);
  });

  it("noindexes private pages without a public canonical", () => {
    const meta = privatePageMetadata("Member portal");
    expect(meta.robots).toMatchObject({ index: false, follow: false });
    expect(meta.alternates).toBeUndefined();
  });

  it("skips Event JSON-LD for SAMPLE content", () => {
    const sample = {
      provenance: "sample",
      title: "[SAMPLE] Demo",
      summary: "Demo",
      slug: "demo",
      startsAt: "2026-01-01T00:00:00+05:30",
      venue: { name: "Club", addressLines: [] },
    } as unknown as ClubEvent;
    expect(eventJsonLd(sample)).toBeNull();
  });

  it("builds FAQPage JSON-LD only when FAQs exist", () => {
    expect(faqPageJsonLd([])).toBeNull();
    const ld = faqPageJsonLd([
      { question: "When did puja begin?", answer: "1 February 2000." },
    ]);
    expect(ld?.["@type"]).toBe("FAQPage");
  });

  it("keeps private portals out of robots allowlist and sitemap rules", () => {
    expect(robotsDisallowPaths).toEqual(
      expect.arrayContaining(["/admin/", "/member/", "/api/", "/login"]),
    );
    const member = seoRouteRules.find((r) => r.pattern === "/member/*");
    expect(member?.policy).toBe("noindex");
    expect(member?.inSitemap).toBe(false);
  });

  it("documents English-only language strategy", () => {
    expect(seoDefaults.htmlLang).toBe("en-IN");
    expect(seoDefaults.inLanguage).toBe("en-IN");
  });
});
