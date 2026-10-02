import {
  CursorHintProvider,
  IntroOverlay,
  ScrollProgress,
} from "@/components/motion";
import {
  PageTransition,
  SiteFooter,
  SiteHeader,
  SkipLink,
} from "@/components/public";
import { JsonLd } from "@/lib/json-ld";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo/structured-data";
import type { ReactNode } from "react";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh min-w-0 flex-col overflow-x-clip overflow-y-visible bg-heritage-grain">
      <JsonLd data={[organizationJsonLd(), websiteJsonLd()]} />
      <SkipLink />
      <ScrollProgress />
      <IntroOverlay />
      <CursorHintProvider>
        <SiteHeader />
        <PageTransition>
          <main
            id="main-content"
            tabIndex={-1}
            className="min-w-0 flex-1 outline-none"
          >
            {children}
          </main>
        </PageTransition>
        <SiteFooter />
      </CursorHintProvider>
    </div>
  );
}
