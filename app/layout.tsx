import { seoDefaults, getSiteUrl } from "@/lib/seo/config";
import { ToastProvider } from "@/components/ui/toast";
import type { Metadata, Viewport } from "next";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  display: "swap",
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
    { media: "(prefers-color-scheme: light)", color: "#F7F2E8" },
    { media: "(prefers-color-scheme: dark)", color: "#141A22" },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${plusJakarta.variable} h-full antialiased`}
    >
      <body className="flex min-h-full min-w-0 flex-col overflow-x-clip font-sans">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
