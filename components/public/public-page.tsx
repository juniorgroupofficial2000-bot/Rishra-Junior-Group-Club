import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { SectionHeader } from "@/components/ui/section-header";
import {
  breadcrumbsForPage,
  publicPages,
  type PublicPageKey,
} from "@/content/pages";
import type { ReactNode } from "react";
import { SiteContainer } from "./site-container";

export type PublicPageShellProps = {
  pageKey: Exclude<PublicPageKey, "home">;
  children?: ReactNode;
};

export function ContentPlaceholder({
  title = "Content forthcoming",
  body = "This section is ready for verified club information. No details have been invented.",
}: {
  title?: string;
  body?: string;
}) {
  return (
    <div className="rounded-xl border border-dashed border-border-strong bg-surface-raised px-5 py-8 sm:px-8">
      <p className="font-display text-lg font-semibold text-ink-900">{title}</p>
      <p className="mt-2 max-w-prose text-sm leading-relaxed text-ink-500">{body}</p>
      <p className="mt-4 font-mono text-xs text-ink-400">[PLACEHOLDER]</p>
    </div>
  );
}

/** Shared chrome for interior public pages: breadcrumbs + header + content. */
export function PublicPageShell({ pageKey, children }: PublicPageShellProps) {
  const page = publicPages[pageKey];
  const crumbs = breadcrumbsForPage(pageKey);

  return (
    <>
      <SiteContainer as="header" className="pb-6 pt-8 sm:pb-8 sm:pt-10">
        <Breadcrumbs items={crumbs} className="mb-5" />
        <SectionHeader
          eyebrow={page.eyebrow}
          title={page.title}
          description={page.description}
          titleAs="h1"
        />
      </SiteContainer>
      <SiteContainer className="min-w-0 pb-16 sm:pb-20">
        {children ?? <ContentPlaceholder />}
      </SiteContainer>
    </>
  );
}
