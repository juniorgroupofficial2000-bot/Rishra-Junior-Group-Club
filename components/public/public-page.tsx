import type { PublicPageKey } from "@/content/pages";
import type { ReactNode } from "react";
import { AnimatedPageShell } from "./animated-page-shell";

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

/** Shared chrome for interior public pages: animated breadcrumbs + header + content. */
export function PublicPageShell({ pageKey, children }: PublicPageShellProps) {
  return (
    <AnimatedPageShell pageKey={pageKey}>
      {children ?? <ContentPlaceholder />}
    </AnimatedPageShell>
  );
}
