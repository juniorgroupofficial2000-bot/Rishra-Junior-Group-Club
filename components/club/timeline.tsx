import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

export type TimelineItem = {
  id: string;
  year: string;
  title: ReactNode;
  description?: ReactNode;
};

export type TimelineProps = {
  items: TimelineItem[];
  className?: string;
};

export function Timeline({ items, className }: TimelineProps) {
  return (
    <ol className={cn("relative space-y-0", className)}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <li key={item.id} className="relative flex gap-4 pb-10 last:pb-0 sm:gap-6">
            <div className="flex w-16 shrink-0 flex-col items-center sm:w-20">
              <span className="font-mono text-sm font-semibold tabular-nums text-alta-600">
                {item.year}
              </span>
              <span
                className="mt-2 h-2.5 w-2.5 rounded-full bg-ink-900 ring-4 ring-jasmine-50"
                aria-hidden
              />
              {!isLast ? (
                <span
                  className="mt-1 w-px flex-1 bg-border-default"
                  aria-hidden
                />
              ) : null}
            </div>
            <div className="min-w-0 flex-1 pt-0.5">
              <h3 className="font-display text-xl font-semibold tracking-tight text-ink-900">
                {item.title}
              </h3>
              {item.description ? (
                <p className="mt-2 text-sm leading-relaxed text-ink-500">
                  {item.description}
                </p>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
