import { seoDefaults, getSiteUrl } from "@/lib/seo/config";
import { ToastProvider } from "@/components/ui/toast";
import type { Metadata, Viewport } from "next";
import {
  Fraunces,
  IBM_Plex_Mono,
  Source_Sans_3,
} from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
});

const sourceSans = Source_Sans_3({
  variable: "--font-source-sans",
  subsets: ["latin"],
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600"],
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
  },
  twitter: {
    card: seoDefaults.twitterCard,
    title: seoDefaults.defaultTitle,
    description: seoDefaults.defaultDescription,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafaf9" },
    { media: "(prefers-color-scheme: dark)", color: "#1c1917" },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${sourceSans.variable} ${ibmPlexMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full min-w-0 flex-col overflow-x-clip font-sans">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
