import { getCommitteePortrait } from "@/content/site-media";
import type { CommitteeMember } from "@/content/committee";
import { cn } from "@/lib/cn";
import Image from "next/image";

export type CommitteeMemberCardProps = {
  member: CommitteeMember;
  featured?: boolean;
  description?: string;
  tenureLabel?: string;
  className?: string;
};

export function CommitteeMemberCard({
  member,
  featured = false,
  description,
  tenureLabel,
  className,
}: CommitteeMemberCardProps) {
  const portrait = getCommitteePortrait(member.id);
  const isSvg = portrait.src.endsWith(".svg");

  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border-subtle bg-surface-raised shadow-sm",
        "transition-[transform,box-shadow,border-color] duration-400 ease-[cubic-bezier(0.22,1,0.36,1)]",
        "hover:-translate-y-1 hover:border-marigold-400/50 hover:shadow-md",
        featured ? "md:col-span-2 lg:col-span-1" : "",
        className,
      )}
    >
      <div
        className={cn(
          "relative overflow-hidden bg-ink-900",
          featured ? "aspect-[4/5] sm:aspect-[5/6]" : "aspect-[4/5]",
        )}
      >
        <Image
          src={portrait.src}
          alt={portrait.alt}
          fill
          sizes={
            featured
              ? "(max-width: 768px) 100vw, 420px"
              : "(max-width: 768px) 100vw, 280px"
          }
          unoptimized={isSvg}
          className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
          style={{ objectPosition: portrait.objectPosition ?? "center 20%" }}
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-ink-950/85 via-ink-950/15 to-transparent"
          aria-hidden
        />
        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
          <p className="type-caption text-marigold-400">{member.role}</p>
          <h3
            className={cn(
              "mt-2 font-display font-semibold tracking-tight text-white",
              featured ? "text-2xl sm:text-3xl" : "text-xl",
            )}
          >
            {member.displayName}
          </h3>
          {tenureLabel ? (
            <p className="mt-1 text-sm text-white/70">{tenureLabel}</p>
          ) : null}
        </div>
      </div>
      {description ? (
        <div className="border-t border-border-subtle px-5 py-4 sm:px-6">
          <p className="type-body-small leading-relaxed text-ink-600">
            {description}
          </p>
        </div>
      ) : null}
    </article>
  );
}
