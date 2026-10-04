"use client";

import type { HeritageMedia } from "@/content/heritage";
import { cn } from "@/lib/cn";
import { usePrefersStaticMotion } from "@/lib/hooks/use-media-query";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type TouchEvent,
} from "react";

type GalleryItem = HeritageMedia & { year?: number };

export function PujaMasonryGallery({
  items,
  title = "Gallery",
  description,
  enableYearFilter = false,
}: {
  items: GalleryItem[];
  title?: string;
  description?: string;
  enableYearFilter?: boolean;
}) {
  const reduceMotion = useReducedMotion();
  const prefersStatic = usePrefersStaticMotion();
  const [category, setCategory] = useState<string>("all");
  const [year, setYear] = useState<string>("all");
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const item of items) {
      if (item.category?.trim()) set.add(item.category.trim());
    }
    return [...set].sort();
  }, [items]);

  const years = useMemo(() => {
    const set = new Set<number>();
    for (const item of items) {
      if (typeof item.year === "number") set.add(item.year);
    }
    return [...set].sort((a, b) => b - a);
  }, [items]);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      if (category !== "all" && item.category !== category) return false;
      if (year !== "all" && String(item.year) !== year) return false;
      return true;
    });
  }, [items, category, year]);

  const close = useCallback(() => setActiveIndex(null), []);
  const showPrev = useCallback(() => {
    setActiveIndex((current) =>
      current == null ? current : (current - 1 + filtered.length) % filtered.length,
    );
  }, [filtered.length]);
  const showNext = useCallback(() => {
    setActiveIndex((current) =>
      current == null ? current : (current + 1) % filtered.length,
    );
  }, [filtered.length]);

  useEffect(() => {
    if (activeIndex == null) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") close();
      if (event.key === "ArrowLeft") showPrev();
      if (event.key === "ArrowRight") showNext();
    }
    window.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [activeIndex, close, showNext, showPrev]);

  if (items.length === 0) return null;

  const active = activeIndex != null ? filtered[activeIndex] : null;

  function onTouchStart(event: TouchEvent) {
    setTouchStartX(event.changedTouches[0]?.clientX ?? null);
  }
  function onTouchEnd(event: TouchEvent) {
    if (touchStartX == null) return;
    const endX = event.changedTouches[0]?.clientX ?? touchStartX;
    const delta = endX - touchStartX;
    if (Math.abs(delta) > 40) {
      if (delta > 0) showPrev();
      else showNext();
    }
    setTouchStartX(null);
  }

  return (
    <section aria-labelledby="puja-gallery-heading" className="space-y-6">
      <div>
        <p className="type-caption text-alta-600">Photographs</p>
        <h2
          id="puja-gallery-heading"
          className="type-h2 mt-2 text-balance text-ink-900"
        >
          {title}
        </h2>
        {description ? (
          <p className="mt-3 max-w-2xl type-body text-ink-600">{description}</p>
        ) : null}
      </div>

      {(categories.length > 0 || (enableYearFilter && years.length > 1)) && (
        <div className="flex flex-wrap gap-2">
          <FilterChip
            active={category === "all"}
            onClick={() => setCategory("all")}
            label="All"
          />
          {categories.map((value) => (
            <FilterChip
              key={value}
              active={category === value}
              onClick={() => setCategory(value)}
              label={value}
            />
          ))}
          {enableYearFilter
            ? years.map((value) => (
                <FilterChip
                  key={value}
                  active={year === String(value)}
                  onClick={() =>
                    setYear((current) =>
                      current === String(value) ? "all" : String(value),
                    )
                  }
                  label={String(value)}
                />
              ))
            : null}
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border-subtle px-4 py-8 text-sm text-ink-500">
          No photographs match these filters yet.
        </p>
      ) : (
        <ul className="columns-2 gap-3 sm:columns-3 sm:gap-4 lg:columns-4">
          {filtered.map((item, index) => {
            const isSvg = item.src.endsWith(".svg");
            return (
              <li key={item.id} className="mb-3 break-inside-avoid sm:mb-4">
                <button
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className="group relative block w-full overflow-hidden rounded-xl bg-ink-100 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-alta-500"
                >
                  <Image
                    src={item.src}
                    alt={item.alt}
                    width={item.width}
                    height={item.height}
                    unoptimized={isSvg}
                    className={cn(
                      "h-auto w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]",
                      !reduceMotion && !prefersStatic
                        ? "group-hover:scale-[1.04]"
                        : "",
                    )}
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                  {(item.caption || item.year) && (
                    <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink-950/80 to-transparent px-3 pb-3 pt-8 text-xs text-white opacity-100 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100">
                      {item.caption ?? `Saraswati Puja ${item.year}`}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <AnimatePresence>
        {active ? (
          <motion.div
            className="fixed inset-0 z-[80] flex items-center justify-center bg-ink-950/92 p-3 sm:p-6"
            role="dialog"
            aria-modal="true"
            aria-label={active.alt}
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0 }}
            onClick={close}
          >
            <button
              type="button"
              onClick={close}
              className="absolute right-3 top-3 z-10 inline-flex min-h-11 min-w-11 items-center justify-center rounded-md bg-white/10 text-white hover:bg-white/20"
              aria-label="Close gallery"
            >
              ✕
            </button>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                showPrev();
              }}
              className="absolute left-2 top-1/2 z-10 hidden min-h-11 min-w-11 -translate-y-1/2 items-center justify-center rounded-md bg-white/10 text-white hover:bg-white/20 sm:inline-flex"
              aria-label="Previous photograph"
            >
              ←
            </button>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                showNext();
              }}
              className="absolute right-2 top-1/2 z-10 hidden min-h-11 min-w-11 -translate-y-1/2 items-center justify-center rounded-md bg-white/10 text-white hover:bg-white/20 sm:inline-flex"
              aria-label="Next photograph"
            >
              →
            </button>
            <motion.figure
              className="relative max-h-[85dvh] w-full max-w-5xl"
              initial={reduceMotion ? false : { y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={reduceMotion ? undefined : { y: 16, opacity: 0 }}
              onClick={(event) => event.stopPropagation()}
              onTouchStart={onTouchStart}
              onTouchEnd={onTouchEnd}
            >
              <Image
                src={active.src}
                alt={active.alt}
                width={active.width}
                height={active.height}
                unoptimized={active.src.endsWith(".svg")}
                className="mx-auto max-h-[72dvh] w-auto rounded-lg object-contain"
                sizes="100vw"
                priority
              />
              <figcaption className="mt-4 text-center text-sm text-ink-100">
                {active.caption ?? active.alt}
                {active.year ? ` · ${active.year}` : ""}
              </figcaption>
              <p className="mt-2 text-center text-xs text-ink-300 sm:hidden">
                Swipe left or right to browse
              </p>
            </motion.figure>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex min-h-10 items-center rounded-full border px-3 text-xs font-medium transition-colors",
        active
          ? "border-ink-900 bg-ink-900 text-white"
          : "border-border-default bg-surface-raised text-ink-700 hover:bg-ink-50",
      )}
    >
      {label}
    </button>
  );
}
