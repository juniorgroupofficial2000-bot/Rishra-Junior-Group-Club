"use client";

import { ClipImageReveal } from "@/components/motion";
import type { CommitteeMember } from "@/content/committee";
import { getCommitteePortrait } from "@/content/site-media";
import { cn } from "@/lib/cn";
import { cardRevealVariants, transitionSlow } from "@/lib/motion";
import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";

export type CommitteeMemberCardProps = {
  member: CommitteeMember;
  /** large | secondary | grid */
  variant?: "featured" | "secondary" | "grid";
  featured?: boolean;
  description?: string;
  tenureLabel?: string;
  className?: string;
  index?: number;
};

export function CommitteeMemberCard({
  member,
  variant,
  featured = false,
  description,
  tenureLabel,
  className,
  index = 0,
}: CommitteeMemberCardProps) {
  const layout = variant ?? (featured ? "featured" : "grid");
  const fallback = getCommitteePortrait(member.id);
  const portrait = {
    src: member.portraitSrc ?? fallback.src,
    alt: member.portraitAlt ?? fallback.alt,
    objectPosition: fallback.objectPosition,
  };
  const isSvg = portrait.src.endsWith(".svg");
  const reduce = Boolean(useReducedMotion());

  if (layout === "featured") {
    return (
      <motion.article
        className={cn(
          "grid items-end gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-12",
          className,
        )}
        initial={reduce ? false : { opacity: 0, y: 36 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-10% 0px" }}
        transition={transitionSlow}
      >
        <ClipImageReveal className="relative aspect-[4/5] overflow-hidden bg-ink-900 sm:aspect-[5/6]">
          <Image
            src={portrait.src}
            alt={portrait.alt}
            fill
            sizes="(max-width: 1024px) 92vw, 520px"
            priority
            unoptimized={isSvg}
            className="object-cover"
            style={{ objectPosition: portrait.objectPosition ?? "center 18%" }}
          />
        </ClipImageReveal>
        <div className="min-w-0 pb-2 lg:pb-8">
          <p className="type-caption text-alta-600">{member.role}</p>
          <h3 className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl lg:text-5xl">
            {member.displayName}
          </h3>
          {tenureLabel ? (
            <p className="mt-2 font-mono text-sm text-ink-400">{tenureLabel}</p>
          ) : null}
          {description ? (
            <p className="mt-5 max-w-md type-body-large text-ink-600">
              {description}
            </p>
          ) : null}
          <div className="editorial-rule mt-8" aria-hidden />
        </div>
      </motion.article>
    );
  }

  if (layout === "secondary") {
    return (
      <motion.article
        className={cn("group min-w-0", className)}
        variants={reduce ? undefined : cardRevealVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-12% 0px" }}
        transition={{ ...transitionSlow, delay: index * 0.08 }}
      >
        <ClipImageReveal
          className="relative aspect-[3/4] overflow-hidden bg-ink-900"
          delay={index * 0.04}
        >
          <Image
            src={portrait.src}
            alt={portrait.alt}
            fill
            sizes="(max-width: 768px) 45vw, 280px"
            unoptimized={isSvg}
            className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
            style={{ objectPosition: portrait.objectPosition ?? "center 18%" }}
          />
        </ClipImageReveal>
        <div className="mt-4 border-t border-ink-200 pt-3">
          <p className="type-caption text-ink-400">{member.role}</p>
          <h3 className="mt-1 font-display text-xl font-semibold tracking-tight text-ink-900 sm:text-2xl">
            {member.displayName}
          </h3>
          {tenureLabel ? (
            <p className="mt-1 font-mono text-xs text-ink-400">{tenureLabel}</p>
          ) : null}
          {description ? (
            <p className="mt-2 type-body-small leading-relaxed text-ink-600">
              {description}
            </p>
          ) : null}
        </div>
      </motion.article>
    );
  }

  return (
    <motion.article
      className={cn("group min-w-0", className)}
      variants={reduce ? undefined : cardRevealVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-12% 0px" }}
      transition={{ ...transitionSlow, delay: index * 0.06 }}
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-ink-100">
        <Image
          src={portrait.src}
          alt={portrait.alt}
          fill
          sizes="(max-width: 768px) 40vw, 200px"
          unoptimized={isSvg}
          className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
          style={{ objectPosition: portrait.objectPosition ?? "center 18%" }}
        />
      </div>
      <div className="mt-3">
        <p className="type-caption text-ink-400">{member.role}</p>
        <h3 className="mt-1 font-display text-lg font-semibold tracking-tight text-ink-900">
          {member.displayName}
        </h3>
        {tenureLabel ? (
          <p className="mt-0.5 font-mono text-xs text-ink-400">{tenureLabel}</p>
        ) : null}
      </div>
    </motion.article>
  );
}
