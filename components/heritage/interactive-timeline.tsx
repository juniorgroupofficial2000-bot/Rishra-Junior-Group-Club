"use client";

import { Reveal } from "@/components/motion";
import type { TimelineEntry } from "@/content/heritage";
import { cn } from "@/lib/cn";
import { transitionNormal } from "@/lib/motion";
import { ChevronDown, Images } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { useMemo, useState } from "react";
import { HeritageImage } from "./heritage-image";
import { ProvenanceBadge } from "./provenance-badge";

type InteractiveTimelineProps = {
  entries: TimelineEntry[];
  className?: string;
};

export function InteractiveTimeline({
  entries,
  className,
}: InteractiveTimelineProps) {
  const [activeId, setActiveId] = useState(entries[0]?.id ?? "");
  const [openGalleryId, setOpenGalleryId] = useState<string | null>(null);
  const reduceMotion = useReducedMotion();

  const active = useMemo(
    () => entries.find((entry) => entry.id === activeId) ?? entries[0],
    [activeId, entries],
  );

  if (entries.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border-strong bg-surface-raised px-5 py-8 text-sm text-ink-500">
        No published timeline entries yet.
      </p>
    );
  }

  return (
    <div className={cn("grid gap-10 lg:grid-cols-[14rem_1fr] lg:gap-12", className)}>
      <nav aria-label="Timeline years" className="lg:sticky lg:top-24 lg:self-start">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-ink-400">
          Jump to year
        </p>
        <ul className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
          {entries.map((entry) => {
            const selected = entry.id === active?.id;
            return (
              <li key={entry.id} className="shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setActiveId(entry.id);
                    document
                      .getElementById(`timeline-entry-${entry.id}`)
                      ?.scrollIntoView({
                        behavior: reduceMotion ? "auto" : "smooth",
                        block: "nearest",
                      });
                  }}
                  aria-current={selected ? "true" : undefined}
                  className={cn(
                    "inline-flex min-h-11 min-w-[4.5rem] items-center justify-center rounded-md px-3 text-sm font-medium transition-colors lg:w-full lg:justify-start",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    selected
                      ? "bg-ink-900 text-white"
                      : "bg-surface-raised text-ink-700 ring-1 ring-border-subtle hover:bg-ink-50",
                  )}
                >
                  <span className="font-mono tabular-nums">{entry.year}</span>
                  {entry.milestone ? (
                    <span className="ml-2 hidden text-[0.65rem] uppercase tracking-wide text-marigold-400 lg:inline">
                      Milestone
                    </span>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <ol className="relative space-y-0">
        {entries.map((entry, index) => {
          const isLast = index === entries.length - 1;
          const isActive = entry.id === active?.id;
          const galleryOpen = openGalleryId === entry.id;
          const hasGallery = Boolean(entry.gallery?.length);

          return (
            <li
              key={entry.id}
              id={`timeline-entry-${entry.id}`}
              className="relative flex gap-4 pb-12 last:pb-0 sm:gap-6"
            >
              <div className="flex w-14 shrink-0 flex-col items-center sm:w-16">
                <span
                  className={cn(
                    "font-mono text-sm font-semibold tabular-nums",
                    entry.milestone ? "text-alta-600" : "text-ink-500",
                  )}
                >
                  {entry.year}
                </span>
                <span
                  className={cn(
                    "mt-2 h-3 w-3 rounded-full ring-4 ring-jasmine-50 transition-colors",
                    isActive || entry.milestone ? "bg-ink-900" : "bg-ink-300",
                  )}
                  aria-hidden
                />
                {!isLast ? (
                  <span className="mt-1 w-px flex-1 bg-border-default" aria-hidden />
                ) : null}
              </div>

              <Reveal className="min-w-0 flex-1">
                <article
                  className={cn(
                    "rounded-xl border bg-surface-raised p-4 shadow-xs transition-[border-color,box-shadow] sm:p-6",
                    isActive
                      ? "border-ink-300 shadow-sm"
                      : "border-border-subtle",
                  )}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    {entry.milestone ? (
                      <span className="text-xs font-semibold uppercase tracking-[0.12em] text-alta-600">
                        Milestone
                      </span>
                    ) : null}
                    <ProvenanceBadge provenance={entry.provenance} />
                  </div>
                  <h3 className="mt-2 font-display text-2xl font-semibold tracking-tight text-ink-900">
                    {entry.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-ink-600 sm:text-base">
                    {entry.description}
                  </p>

                  {entry.image ? (
                    <div className="mt-5">
                      <HeritageImage
                        image={entry.image}
                        sizes="(max-width: 1024px) 100vw, 60vw"
                      />
                    </div>
                  ) : null}

                  {hasGallery ? (
                    <div className="mt-4">
                      <button
                        type="button"
                        className="inline-flex min-h-11 items-center gap-2 rounded-md px-3 text-sm font-medium text-ink-800 ring-1 ring-border-default transition-colors hover:bg-ink-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        aria-expanded={galleryOpen}
                        onClick={() =>
                          setOpenGalleryId(galleryOpen ? null : entry.id)
                        }
                      >
                        <Images className="h-4 w-4" aria-hidden />
                        {galleryOpen ? "Hide gallery" : "View gallery"}
                        <ChevronDown
                          className={cn(
                            "h-4 w-4 transition-transform",
                            galleryOpen && "rotate-180",
                          )}
                          aria-hidden
                        />
                      </button>
                      <AnimatePresence initial={false}>
                        {galleryOpen ? (
                          <motion.ul
                            initial={reduceMotion ? false : { height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={reduceMotion ? undefined : { height: 0, opacity: 0 }}
                            transition={transitionNormal}
                            className="mt-4 grid grid-cols-2 gap-2 overflow-hidden sm:grid-cols-3"
                          >
                            {entry.gallery!.map((media) => {
                              const isSvg = media.src.endsWith(".svg");
                              return (
                                <li
                                  key={media.id}
                                  className="relative aspect-square overflow-hidden rounded-lg bg-ink-900"
                                >
                                  <Image
                                    src={media.src}
                                    alt={media.alt}
                                    fill
                                    sizes="(max-width: 640px) 50vw, 20vw"
                                    unoptimized={isSvg}
                                    className="object-cover"
                                  />
                                </li>
                              );
                            })}
                          </motion.ul>
                        ) : null}
                      </AnimatePresence>
                    </div>
                  ) : null}
                </article>
              </Reveal>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
