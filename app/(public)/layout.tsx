import { SiteChrome } from "@/components/public/site-chrome";
import { JsonLd } from "@/lib/json-ld";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo/structured-data";
import type { ReactNode } from "react";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd data={[organizationJsonLd(), websiteJsonLd()]} />
      <SiteChrome>{children}</SiteChrome>
    </>
  );
}
