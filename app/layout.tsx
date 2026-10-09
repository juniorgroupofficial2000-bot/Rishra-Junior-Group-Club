import { EnvSetupPanel } from "@/components/errors/env-setup-panel";
import { RegisterServiceWorker } from "@/components/pwa/register-service-worker";
import { getBootConfigError } from "@/config/boot-status";
import { getDeploymentSetupError } from "@/config/deployment-setup";
import { seoDefaults, getSiteUrl } from "@/lib/seo/config";
import type { Metadata, Viewport } from "next";
import { Nunito } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";

/**
 * Typography (English-only product):
 * Nunito for headings and body. Rounded forms match the club mark.
 * Scale utilities: `.type-display` … `.type-caption` in globals.css
 */
const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "600", "700", "800"],
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
  appleWebApp: {
    capable: true,
    title: seoDefaults.shortName,
    statusBarStyle: "default",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
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
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const setupError = getDeploymentSetupError() ?? getBootConfigError();

  return (
    <html
      lang={seoDefaults.htmlLang}
      className={`${nunito.variable} min-h-dvh antialiased`}
    >
      <body className="flex min-h-dvh min-w-0 flex-col overflow-x-clip font-sans">
        {setupError ? <EnvSetupPanel message={setupError} /> : children}
        <RegisterServiceWorker />
      </body>
    </html>
  );
}
