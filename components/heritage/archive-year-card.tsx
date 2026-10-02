import type { PujaArchiveYear } from "@/content/heritage";
import { cn } from "@/lib/cn";
import Image from "next/image";
import Link from "next/link";
import { ProvenanceBadge } from "./provenance-badge";

type ArchiveYearCardProps = {
  year: PujaArchiveYear;
  className?: string;
};

export function ArchiveYearCard({ year, className }: ArchiveYearCardProps) {
  const isSvg = year.coverImage?.src.endsWith(".svg");
  const inner = (
    <>
      <div className="relative aspect-[4/3] overflow-hidden bg-ink-900">
        {year.coverImage ? (
          <Image
            src={year.coverImage.src}
            alt={year.coverImage.alt}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            unoptimized={isSvg}
            className="object-cover transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-safe:group-hover:scale-[1.03]"
          />
        ) : (
          <div className="absolute inset-0 bg-ink-800" />
        )}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink-950/80 to-transparent p-4">
          <p className="font-mono text-sm font-semibold text-marigold-400">
            {year.year}
          </p>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-display text-xl font-semibold tracking-tight text-ink-900">
            {year.title}
          </h3>
          <ProvenanceBadge provenance={year.provenance} />
        </div>
        <p className="text-sm leading-relaxed text-ink-500">{year.summary}</p>
        {year.highlights?.length ? (
          <ul className="mt-2 space-y-1 text-sm text-ink-600">
            {year.highlights.map((item) => (
              <li key={item} className="flex gap-2">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-alta-500" aria-hidden />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </>
  );

  const sharedClass = cn(
    "group flex h-full flex-col overflow-hidden rounded-xl border border-border-subtle bg-surface-raised shadow-xs",
    className,
  );

  if (year.href) {
    return (
      <Link
        href={year.href}
        className={cn(
          sharedClass,
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        )}
      >
        {inner}
      </Link>
    );
  }

  return <article className={sharedClass}>{inner}</article>;
}
