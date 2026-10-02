"use client";

import { ClipImageReveal } from "@/components/motion";
import { getCommitteePortrait } from "@/content/site-media";
import type { CommitteeMember } from "@/content/committee";
import { cn } from "@/lib/cn";
import { cardRevealVariants, transitionSlow } from "@/lib/motion";
import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";

export type CommitteeMemberCardProps = {
  member: CommitteeMember;
  featured?: boolean;
  description?: string;
  tenureLabel?: string;
  className?: string;
  index?: number;
};

export function CommitteeMemberCard({
  member,
  featured = false,
  description,
  tenureLabel,
  className,
  index = 0,
}: CommitteeMemberCardProps) {
  const portrait = getCommitteePortrait(member.id);
  const isSvg = portrait.src.endsWith(".svg");
  const reduce = Boolean(useReducedMotion());

  return (
    <motion.article
      className={cn(
        "group relative overflow-hidden rounded-xl border border-border-subtle bg-surface-raised shadow-sm",
        className,
      )}
      variants={reduce ? undefined : cardRevealVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-12% 0px" }}
      transition={{ ...transitionSlow, delay: index * 0.1 }}
      whileHover={
        reduce
          ? undefined
          : { y: -8, transition: { duration: 0.32 } }
      }
    >
      <ClipImageReveal className="relative aspect-[3/4] bg-ink-900" delay={index * 0.05}>
        <Image
          src={portrait.src}
          alt={portrait.alt}
          fill
          sizes="(max-width: 768px) 45vw, 220px"
          unoptimized={isSvg}
          className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
          style={{ objectPosition: portrait.objectPosition ?? "center 20%" }}
          data-cursor-label="VIEW"
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-ink-950/90 via-ink-950/20 to-transparent transition-opacity duration-400 group-hover:opacity-100"
          aria-hidden
        />
        <div className="absolute inset-x-0 bottom-0 p-3.5 sm:p-4">
          <motion.p
            className="type-caption text-marigold-400 transition-transform duration-300 group-hover:-translate-y-0.5"
            initial={reduce ? false : { opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 + index * 0.08, duration: 0.45 }}
          >
            {member.role}
          </motion.p>
          <motion.h3
            className={cn(
              "mt-1 font-display font-semibold tracking-tight text-white",
              featured ? "text-lg sm:text-xl" : "text-base sm:text-lg",
            )}
            initial={reduce ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.25 + index * 0.08, duration: 0.45 }}
          >
            {member.displayName}
          </motion.h3>
          {tenureLabel ? (
            <p className="mt-0.5 text-xs text-white/70 sm:text-sm">{tenureLabel}</p>
          ) : null}
        </div>
      </ClipImageReveal>
      {description ? (
        <motion.div
          className="border-t border-border-subtle px-3.5 py-3 sm:px-4"
          initial={reduce ? false : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.35 + index * 0.08 }}
        >
          <p className="type-body-small leading-relaxed text-ink-600">
            {description}
          </p>
        </motion.div>
      ) : null}
    </motion.article>
  );
}
