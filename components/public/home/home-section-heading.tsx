"use client";

import { OrnamentLine } from "@/components/motion";
import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

type HomeSectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  align?: "start" | "center";
  tone?: "default" | "inverse";
  className?: string;
  titleId?: string;
};

export function HomeSectionHeading({
  eyebrow,
  title,
  description,
  actions,
  align = "start",
  tone = "default",
  className,
  titleId,
}: HomeSectionHeadingProps) {
  const inverse = tone === "inverse";

  return (
    <div
      className={cn(
        "flex flex-col gap-5",
        align === "center" && "items-center text-center",
        align === "start" && "sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className={cn("max-w-2xl space-y-3", align === "center" && "mx-auto")}>
        {eyebrow ? (
          <p
            className={cn(
              "type-caption",
              inverse ? "text-marigold-400" : "text-alta-600",
            )}
          >
            {eyebrow}
          </p>
        ) : null}
        <h2
          id={titleId}
          className={cn(
            "type-h2 text-balance",
            inverse ? "text-white" : "text-ink-900",
          )}
        >
          {title}
        </h2>
        <OrnamentLine
          className={cn(
            "w-20",
            inverse && "from-marigold-400 to-transparent",
            align === "center" && "mx-auto origin-center",
          )}
        />
        {description ? (
          <p
            className={cn(
              "type-body-large",
              inverse ? "text-ink-200" : "text-ink-500",
            )}
          >
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}
