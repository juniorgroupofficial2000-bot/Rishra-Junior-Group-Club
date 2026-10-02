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
        "flex flex-col gap-4",
        align === "center" && "items-center text-center",
        align === "start" && "sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
      {...props}
    >
      <div className={cn("max-w-2xl space-y-2", align === "center" && "mx-auto")}>
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-alta-600">
            {eyebrow}
          </p>
        ) : null}
        <TitleTag className="font-display text-3xl font-semibold tracking-tight text-ink-900 text-balance sm:text-4xl">
          {title}
        </TitleTag>
        {description ? (
          <p className="text-base text-ink-500 leading-relaxed">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
    </header>
  );
}
