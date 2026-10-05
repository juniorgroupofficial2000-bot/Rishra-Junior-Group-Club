import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { NextConfig } from "next";

const mediaCdnOrigin = process.env.MEDIA_PUBLIC_BASE_URL?.replace(/\/$/, "");

function readPackageVersion(): string {
  try {
    const raw = readFileSync(join(__dirname, "package.json"), "utf8");
    return (JSON.parse(raw) as { version?: string }).version?.trim() || "0.0.0";
  } catch {
    return "0.0.0";
  }
}

const buildVersion = process.env.APP_VERSION || readPackageVersion();
const buildCommit =
  process.env.GIT_COMMIT_SHA ||
  process.env.VERCEL_GIT_COMMIT_SHA ||
  process.env.GITHUB_SHA ||
  "";
const buildTimestamp =
  process.env.BUILD_TIMESTAMP || new Date().toISOString();

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "X-DNS-Prefetch-Control", value: "off" },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "object-src 'none'",
      `img-src 'self' data: blob:${mediaCdnOrigin ? ` ${mediaCdnOrigin}` : ""}`,
      "font-src 'self' data:",
      // Next.js requires inline styles; tighten further when a nonce pipeline exists.
      "style-src 'self' 'unsafe-inline'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "connect-src 'self'",
      // Home / contact location embeds.
      "frame-src 'self' https://www.google.com https://maps.google.com",
    ].join("; "),
  },
  ...(process.env.SITE_URL?.startsWith("https://")
    ? [
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains; preload",
        },
      ]
    : []),
];

const nextConfig: NextConfig = {
  env: {
    APP_VERSION: buildVersion,
    NEXT_PUBLIC_APP_VERSION: buildVersion,
    GIT_COMMIT_SHA: buildCommit,
    NEXT_PUBLIC_GIT_COMMIT_SHA: buildCommit,
    BUILD_TIMESTAMP: buildTimestamp,
    NEXT_PUBLIC_BUILD_TIMESTAMP: buildTimestamp,
    API_VERSION: process.env.API_VERSION || "v1",
  },
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [320, 375, 390, 430, 640, 750, 768, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    // Must include every `quality` value passed to next/image (optimizer 400s otherwise).
    qualities: [75, 80],
    // Next.js 16 requires explicit localPatterns for src values with ?query.
    // Managed media uses `/api/media/:id?v=thumb|sm|md|lg`.
    localPatterns: [
      { pathname: "/api/media/**" },
      { pathname: "/api/admin/media/**" },
      { pathname: "/images/**" },
      { pathname: "/brand/**" },
      { pathname: "/*.svg" },
      { pathname: "/*.png" },
      { pathname: "/*.jpg" },
      { pathname: "/*.jpeg" },
      { pathname: "/*.webp" },
    ],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    contentDispositionType: "inline",
  },
  // Prefer modern compression for production responses.
  compress: true,
  poweredByHeader: false,
  experimental: {
    optimizePackageImports: ["lucide-react", "motion"],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
