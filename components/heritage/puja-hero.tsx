"use client";

import { SiteContainer } from "@/components/public/site-container";
import { saraswatiPujaContent } from "@/content/heritage";
import { transitionSlow } from "@/lib/motion";
import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import Link from "next/link";

const content = saraswatiPujaContent.hero;

export function PujaHero() {
  const reduceMotion = useReducedMotion();
  const isSvg = content.image.src.endsWith(".svg");

  return (
    <section
      aria-labelledby="puja-hero-heading"
      className="relative isolate min-h-[78dvh] overflow-hidden bg-ink-950 text-white"
    >
      <div className="absolute inset-0">
        <Image
          src={content.image.src}
          alt={content.image.alt}
          fill
          priority
          sizes="100vw"
          unoptimized={isSvg}
          className="object-cover"
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/75 to-ink-950/40"
          aria-hidden
        />
      </div>

      <SiteContainer className="relative flex min-h-[78dvh] flex-col justify-end pb-14 pt-28 sm:pb-20">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={transitionSlow}
          className="max-w-3xl"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-marigold-400">
            {content.eyebrow}
          </p>
          <h1
            id="puja-hero-heading"
            className="mt-4 font-display text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl"
          >
            {content.title}
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-100">
            {content.support}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            {content.ctas.map((cta, index) => (
              <Link
                key={cta.href}
                href={cta.href}
                className={
                  index === 0
                    ? "inline-flex min-h-12 items-center justify-center rounded-md bg-alta-500 px-5 text-sm font-medium text-white transition-colors hover:bg-alta-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marigold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950"
                    : "inline-flex min-h-12 items-center justify-center rounded-md border border-white/35 px-5 text-sm font-medium text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marigold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950"
                }
              >
                {cta.label}
              </Link>
            ))}
          </div>
        </motion.div>
      </SiteContainer>
    </section>
  );
}
