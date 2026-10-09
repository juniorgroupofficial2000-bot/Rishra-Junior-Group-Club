import { EnvironmentRibbon } from "@/components/env/environment-badge";
import { SkipLink } from "@/components/public";
import { ClubFooter } from "@/components/public/club-footer";
import { ClubHeader } from "@/components/public/club-header";
import { PageTransition } from "@/components/public/page-transition";
import { PublicMotionChrome } from "@/components/public/public-motion-chrome";
import { EventCountdown } from "@/components/public/event-countdown";
import { SiteContainer } from "@/components/public/site-container";
import { getPublicEnv } from "@/config/public";
import { siteConfig } from "@/content/site";
import { loadPublicChromeContext } from "@/server/services/public-chrome-service";
import type { ReactNode } from "react";

export async function SiteChrome({ children }: { children: ReactNode }) {
  const chrome = await loadPublicChromeContext();
  const { appEnv, appName } = getPublicEnv();

  return (
    <div className="flex min-h-dvh min-w-0 flex-col overflow-x-clip bg-heritage-grain">
      <SkipLink />
      <EnvironmentRibbon
        appEnv={appEnv}
        brandName={(appName || siteConfig.name).toUpperCase()}
      />
      <PublicMotionChrome>
        <ClubHeader />
        {chrome.nextEvent ? (
          <div className="border-b border-border-subtle bg-surface-raised/80">
            <SiteContainer className="py-2.5">
              <EventCountdown
                compact
                title={chrome.nextEvent.title}
                href={`/events/${chrome.nextEvent.slug}`}
                startsAt={chrome.nextEvent.startsAt}
                endsAt={chrome.nextEvent.endsAt}
                nextEventLabel
              />
            </SiteContainer>
          </div>
        ) : null}
        <PageTransition>
          <main
            id="main-content"
            tabIndex={-1}
            className="min-w-0 flex-1 outline-none"
          >
            {children}
          </main>
        </PageTransition>
        <ClubFooter />
      </PublicMotionChrome>
    </div>
  );
}
