import { cn } from "@/lib/cn";
import type { ElementType, HTMLAttributes, ReactNode } from "react";

type ContainerWidth = "sm" | "md" | "lg" | "xl" | "2xl" | "prose" | "full";

const widthClass: Record<ContainerWidth, string> = {
  sm: "max-w-[var(--container-sm)]",
  md: "max-w-[var(--container-md)]",
  lg: "max-w-[var(--container-lg)]",
  xl: "max-w-[var(--container-xl)]",
  "2xl": "max-w-[var(--container-2xl)]",
  prose: "max-w-[var(--container-prose)]",
  full: "max-w-none",
};

export type SiteContainerProps = HTMLAttributes<HTMLElement> & {
  as?: ElementType;
  width?: ContainerWidth;
  children: ReactNode;
};

/** Responsive horizontal padding + max-width. Mobile-first, no bleed overflow. */
export function SiteContainer({
  as: Tag = "div",
  width = "xl",
  className,
  children,
  ...props
}: SiteContainerProps) {
  return (
    <Tag
      className={cn(
        "mx-auto w-full min-w-0 px-4 sm:px-6 lg:px-8",
        widthClass[width],
        className,
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}
