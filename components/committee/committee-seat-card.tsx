"use client";

import type { PublicCommitteeSeat } from "@/content/org-committees";
import { cn } from "@/lib/cn";
import { isManagedMediaSrc } from "@/lib/media/variant";
import { cardRevealVariants, transitionSlow } from "@/lib/motion";
import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";

export function CommitteeSeatCard({
  seat,
  index = 0,
  featured = false,
}: {
  seat: PublicCommitteeSeat;
  index?: number;
  featured?: boolean;
}) {
  const reduce = Boolean(useReducedMotion());
  const src = seat.portraitSrc;
  const unoptimized = src ? !isManagedMediaSrc(src) : true;

  return (
    <motion.article
      className={cn("group min-w-0", featured && "sm:col-span-2")}
      variants={reduce ? undefined : cardRevealVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-12% 0px" }}
      transition={{ ...transitionSlow, delay: index * 0.06 }}
    >
      <div
        className={cn(
          "relative overflow-hidden bg-ink-100",
          featured ? "aspect-[4/5] sm:aspect-[5/4]" : "aspect-[3/4]",
        )}
      >
        {src ? (
          <Image
            src={src}
            alt={seat.portraitAlt ?? seat.displayName}
            fill
            sizes={featured ? "(max-width: 768px) 90vw, 480px" : "220px"}
            unoptimized={unoptimized}
            className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
            style={{ objectPosition: "center 18%" }}
          />
        ) : (
          <div
            className="absolute inset-0 bg-[linear-gradient(145deg,#e8dfd2,#cbb89a_45%,#8a7355)]"
            aria-hidden
          />
        )}
      </div>
      <div className="mt-3 border-t border-ink-200 pt-3">
        <p className="type-caption text-ink-400">{seat.role}</p>
        <h3
          className={cn(
            "mt-1 font-display font-semibold tracking-tight text-ink-900",
            featured ? "text-2xl sm:text-3xl" : "text-lg sm:text-xl",
          )}
        >
          {seat.displayName}
        </h3>
        {seat.termYear ? (
          <p className="mt-1 font-mono text-xs text-ink-400">
            Term {seat.termYear}
          </p>
        ) : null}
        {seat.shortBio ? (
          <p className="mt-2 text-sm leading-relaxed text-ink-600">
            {seat.shortBio}
          </p>
        ) : null}
      </div>
    </motion.article>
  );
}
