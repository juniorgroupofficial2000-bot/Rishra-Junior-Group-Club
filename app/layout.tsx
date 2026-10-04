import { EnvSetupPanel } from "@/components/errors/env-setup-panel";
import { getBootConfigError } from "@/config/boot-status";
import { getDeploymentSetupError } from "@/config/deployment-setup";
import { seoDefaults, getSiteUrl } from "@/lib/seo/config";
import type { Metadata, Viewport } from "next";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";

/**
 * Typography (English-only product):
 * - Playfair Display → heritage headings (`--font-display`)
 * - Plus Jakarta Sans → UI / body (`--font-sans`)
 * Scale utilities: `.type-display` … `.type-caption` in globals.css
 */
const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "600", "700"],
  adjustFontFallback: true,
  preload: true,
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
  adjustFontFallback: true,
  preload: true,
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: seoDefaults.defaultTitle,
    template: `%s · ${seoDefaults.siteName}`,
  },
  description: seoDefaults.defaultDescription,
  applicationName: seoDefaults.shortName,
  authors: [{ name: seoDefaults.siteName }],
  creator: seoDefaults.siteName,
  publisher: seoDefaults.siteName,
  // English-only product: do not advertise alternate languages.
  alternates: {
    languages: {
      "en-IN": "/",
      en: "/",
    },
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: seoDefaults.locale,
    siteName: seoDefaults.siteName,
    title: seoDefaults.defaultTitle,
    description: seoDefaults.defaultDescription,
    images: [
      {
        url: seoDefaults.defaultOgImagePath,
        width: 1200,
        height: 630,
        alt: seoDefaults.siteName,
      },
    ],
  },
  twitter: {
    card: seoDefaults.twitterCard,
    title: seoDefaults.defaultTitle,
    description: seoDefaults.defaultDescription,
    images: [seoDefaults.defaultOgImagePath],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F2F0EC" },
    { media: "(prefers-color-scheme: dark)", color: "#141A22" },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const setupError = getDeploymentSetupError() ?? getBootConfigError();

  return (
    <html
      lang={seoDefaults.htmlLang}
      className={`${playfair.variable} ${plusJakarta.variable} min-h-dvh antialiased`}
    >
      <body className="flex min-h-dvh min-w-0 flex-col overflow-x-clip font-sans">
        {setupError ? <EnvSetupPanel message={setupError} /> : children}
      </body>
    </html>
  );
}
