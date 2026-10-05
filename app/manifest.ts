import { seoDefaults } from "@/lib/seo/config";
import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: seoDefaults.siteName,
    short_name: seoDefaults.shortName,
    description: seoDefaults.defaultDescription,
    start_url: "/",
    scope: "/",
    display: "standalone",
    display_override: ["standalone", "browser"],
    orientation: "portrait-primary",
    background_color: "#F2F0EC",
    theme_color: "#F2F0EC",
    lang: seoDefaults.htmlLang,
    dir: "ltr",
    categories: ["community", "lifestyle", "social"],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Saraswati Puja",
        short_name: "Puja",
        description: "Open the Saraswati Puja archive",
        url: "/saraswati-puja",
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }],
      },
      {
        name: "Gallery",
        short_name: "Gallery",
        description: "Browse club photo albums",
        url: "/gallery",
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }],
      },
      {
        name: "Member login",
        short_name: "Login",
        description: "Sign in to the member or admin portal",
        url: "/login",
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }],
      },
    ],
  };
}
