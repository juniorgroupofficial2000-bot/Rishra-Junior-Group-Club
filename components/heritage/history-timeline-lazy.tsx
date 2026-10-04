"use client";

import dynamic from "next/dynamic";
import type { TimelineEntry } from "@/content/heritage";

const InteractiveTimeline = dynamic(
  () =>
    import("@/components/heritage/interactive-timeline").then(
      (mod) => mod.InteractiveTimeline,
    ),
  {
    ssr: true,
    loading: () => (
      <div
        className="min-h-[28rem] animate-pulse rounded-xl border border-border-subtle bg-ink-50"
        aria-hidden
      />
    ),
  },
);

/** Code-splits the interactive timeline client bundle. */
export function HistoryTimelineLazy({
  entries,
}: {
  entries: TimelineEntry[];
}) {
  return <InteractiveTimeline entries={entries} />;
}
