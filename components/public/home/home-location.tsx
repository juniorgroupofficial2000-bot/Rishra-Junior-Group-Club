"use client";

import { Reveal, SlideIn } from "@/components/motion";
import { SiteContainer } from "@/components/public/site-container";
import { homeContent, type HomeContent } from "@/content/home";
import { getGoogleMapsLinks } from "@/content/site";
import { ExternalLink } from "lucide-react";
import { HomeLink } from "./home-link";
import { HomeSectionHeading } from "./home-section-heading";

function isConfigured(value: string): boolean {
  const v = value.trim();
  if (!v) return false;
  if (v.startsWith("[") && v.endsWith("]")) return false;
  if (v.toLowerCase().includes("set contact_public")) return false;
  return true;
}

export function HomeLocation({
  content = homeContent.location,
}: {
  content?: HomeContent["location"];
} = {}) {
  const hasEmail = isConfigured(content.email);
  const hasPhone = isConfigured(content.phone);
  const hasHours = isConfigured(content.hours);
  const maps = getGoogleMapsLinks();

  return (
    <section
      aria-labelledby="home-location-heading"
      className="py-16 sm:py-24"
    >
      <SiteContainer>
        <div className="grid items-stretch gap-10 lg:grid-cols-2 lg:gap-14">
          <Reveal className="min-w-0">
            <HomeSectionHeading
              eyebrow={content.eyebrow}
              title={content.title}
              description={content.description}
              titleId="home-location-heading"
            />
            <address className="mt-8 not-italic">
              <p className="text-sm font-semibold uppercase tracking-[0.12em] text-ink-500">
                Address
              </p>
              <p className="mt-2 text-base leading-relaxed text-ink-800">
                {content.addressLines.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </p>
            </address>
            {hasEmail || hasPhone || hasHours ? (
              <dl className="mt-6 space-y-3 text-sm">
                {hasEmail ? (
                  <div>
                    <dt className="font-medium text-ink-800">Email</dt>
                    <dd className="text-ink-600">{content.email}</dd>
                  </div>
                ) : null}
                {hasPhone ? (
                  <div>
                    <dt className="font-medium text-ink-800">Phone</dt>
                    <dd className="text-ink-600">{content.phone}</dd>
                  </div>
                ) : null}
                {hasHours ? (
                  <div>
                    <dt className="font-medium text-ink-800">Hours</dt>
                    <dd className="text-ink-600">{content.hours}</dd>
                  </div>
                ) : null}
              </dl>
            ) : (
              <p className="mt-6 text-sm leading-relaxed text-ink-500">
                Public email and phone will be published when confirmed by the
                committee.
              </p>
            )}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <HomeLink {...content.cta} appearance="solid" className="group" />
              <a
                href={maps.openHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center gap-2 rounded-md border border-border-default px-4 text-sm font-medium text-ink-800 transition-colors hover:bg-ink-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Open in Google Maps
                <ExternalLink className="h-3.5 w-3.5" aria-hidden />
              </a>
            </div>
          </Reveal>

          <SlideIn from="right" className="min-w-0 w-full">
            <div className="overflow-hidden rounded-xl border border-border-subtle bg-ink-100 shadow-xs">
              <iframe
                title={`Map showing ${maps.query}`}
                src={maps.embedSrc}
                className="aspect-[4/3] h-full min-h-[16rem] w-full border-0 lg:min-h-[22rem]"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
          </SlideIn>
        </div>
      </SiteContainer>
    </section>
  );
}
