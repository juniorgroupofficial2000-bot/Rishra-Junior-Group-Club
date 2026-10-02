import {
  PageTransition,
  SiteFooter,
  SiteHeader,
  SkipLink,
} from "@/components/public";
import type { ReactNode } from "react";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh min-w-0 flex-col overflow-x-hidden bg-heritage-grain">
      <SkipLink />
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
    </div>
  );
}
