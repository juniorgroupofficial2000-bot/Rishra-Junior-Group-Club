import { getSiteUrl } from "@/lib/seo/config";
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl();
  let host: string | undefined;
  try {
    host = new URL(base).host;
  } catch {
    host = undefined;
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/member/", "/api/", "/login", "/design-system"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    ...(host ? { host } : {}),
  };
}
