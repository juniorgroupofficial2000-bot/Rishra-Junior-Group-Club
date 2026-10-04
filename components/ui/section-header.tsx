import { cn } from "@/lib/cn";
import type { HTMLAttributes, ReactNode } from "react";

export type SectionHeaderProps = HTMLAttributes<HTMLElement> & {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  titleAs?: "h1" | "h2" | "h3";
  actions?: ReactNode;
  align?: "start" | "center";
};

export function SectionHeader({
  eyebrow,
  title,
  description,
  actions,
  align = "start",
  titleAs: TitleTag = "h2",
  className,
  ...props
}: SectionHeaderProps) {
  return (
    <header
      className={cn(
        "flex flex-col gap-5",
        align === "center" && "items-center text-center",
        align === "start" && "sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
      {...props}
    >
      <div className={cn("max-w-2xl space-y-3", align === "center" && "mx-auto")}>
        {eyebrow ? (
          <p className="type-caption text-alta-600">{eyebrow}</p>
        ) : null}
        <TitleTag className="type-h2 text-ink-900 text-balance">
          {title}
        </TitleTag>
        <div
          className="h-px w-16 bg-gradient-to-r from-alta-500 to-marigold-400"
          aria-hidden
        />
        {description ? (
          <p className="type-body-large text-ink-500">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
    </header>
  );
}
