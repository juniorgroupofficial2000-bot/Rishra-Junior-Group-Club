"use client";

import { PujaStatusBadge } from "@/components/heritage/puja-status-badge";
import type { PujaScheduleItem } from "@/content/heritage";
import { Reveal } from "@/components/motion";
import { cn } from "@/lib/cn";

function formatWhen(iso?: string) {
  if (!iso) return null;
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function PujaScheduleTimeline({
  items,
  title = "Programme timeline",
  description,
}: {
  items: PujaScheduleItem[];
  title?: string;
  description?: string;
}) {
  if (items.length === 0) return null;

  return (
    <section aria-labelledby="puja-schedule-heading" className="space-y-8">
      <Reveal>
        <p className="type-caption text-alta-600">Schedule</p>
        <h2
          id="puja-schedule-heading"
          className="type-h2 mt-2 text-balance text-ink-900"
        >
          {title}
        </h2>
        {description ? (
          <p className="mt-3 max-w-2xl type-body text-ink-600">{description}</p>
        ) : null}
      </Reveal>

      <ol className="relative space-y-0 border-l border-ink-200/80 pl-6 sm:pl-8">
        {items.map((item, index) => {
          const when = [formatWhen(item.startsAt), formatWhen(item.endsAt)]
            .filter(Boolean)
            .join(" – ");
          return (
            <li
              key={item.id}
              className={cn(
                "relative pb-8 last:pb-0",
                index === 0 ? "pt-0" : "",
              )}
            >
              <span
                className={cn(
                  "absolute -left-[1.9rem] top-1.5 size-3 rounded-full border-2 border-ivory-50 sm:-left-[2.35rem]",
                  item.liveStatus === "live"
                    ? "bg-alta-500 shadow-[0_0_0_4px_rgba(194,58,34,0.18)]"
                    : item.liveStatus === "completed"
                      ? "bg-lotus-500"
                      : item.liveStatus === "today"
                        ? "bg-marigold-500"
                        : "bg-ink-300",
                )}
                aria-hidden
              />
              <div className="flex flex-wrap items-center gap-2">
                <p className="type-caption text-ink-400">{item.stageLabel}</p>
                <PujaStatusBadge status={item.liveStatus} />
              </div>
              <h3 className="mt-1 font-display text-xl text-ink-900 sm:text-2xl">
                {item.title}
              </h3>
              {when ? (
                <p className="mt-1 font-mono text-xs text-ink-500">{when}</p>
              ) : null}
              {item.description ? (
                <p className="mt-2 max-w-2xl type-body-small text-ink-600">
                  {item.description}
                </p>
              ) : null}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
