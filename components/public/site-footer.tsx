"use client";

import { BrandMark } from "@/components/brand/brand-mark";
import { Reveal } from "@/components/motion";
import { footerGroups } from "@/content/navigation";
import { formatAddressLines, siteConfig } from "@/content/site";
import Link from "next/link";
import { SiteContainer } from "./site-container";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-border-subtle bg-ink-900 text-ink-100">
      <SiteContainer className="py-12 sm:py-16">
        <Reveal>
          <div className="grid gap-10 lg:grid-cols-[1.2fr_2fr]">
            <div className="min-w-0 space-y-3">
              <div className="flex items-center gap-3">
                <BrandMark size={44} className="shrink-0" />
                <p className="font-display text-xl font-semibold tracking-tight text-white">
                  {siteConfig.name}
                </p>
              </div>
              <p className="text-sm text-ink-300">{siteConfig.establishedLabel}</p>
              <address className="not-italic text-sm leading-relaxed text-ink-300">
                {formatAddressLines().map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </address>
            </div>

            <div className="grid gap-8 sm:grid-cols-3">
              {(
                Object.entries(footerGroups) as Array<
                  [keyof typeof footerGroups, (typeof footerGroups)[keyof typeof footerGroups]]
                >
              ).map(([key, group]) => (
                <nav key={key} aria-label={group.title}>
                  <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-marigold-400">
                    {group.title}
                  </h2>
                  <ul className="mt-4 space-y-1">
                    {group.items.map((item) => (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className="inline-flex min-h-11 items-center rounded-sm text-sm text-ink-100 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marigold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-900"
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
              ))}
            </div>
          </div>

          <div className="mt-12 border-t border-ink-700 pt-6 text-sm text-ink-400">
            <p>
              © {year} {siteConfig.name}. All rights reserved.
            </p>
          </div>
        </Reveal>
      </SiteContainer>
    </footer>
  );
}
