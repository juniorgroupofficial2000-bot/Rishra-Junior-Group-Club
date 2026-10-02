"use client";

import { SiteContainer } from "@/components/public/site-container";
import { homeContent } from "@/content/home";
import { cn } from "@/lib/cn";
import { transitionSlow } from "@/lib/motion";
import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import Link from "next/link";

const content = homeContent.hero;

export function HomeHero() {
  const reduceMotion = useReducedMotion();
  const isSvg = content.image.src.endsWith(".svg");

  return (
    <section
      aria-labelledby="home-hero-heading"
      className="relative isolate min-h-[88dvh] overflow-hidden bg-ink-950 text-white"
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
          className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/70 to-ink-950/35"
          aria-hidden
        />
      </div>

      <SiteContainer className="relative flex min-h-[88dvh] flex-col justify-end pb-14 pt-28 sm:pb-20 sm:pt-32">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={transitionSlow}
          className="max-w-3xl"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-marigold-400">
            {content.established}
          </p>
          <h1
            id="home-hero-heading"
            className="mt-4 font-display text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl"
          >
            {content.headline}
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-100 sm:text-xl">
            {content.support}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            {content.ctas.map((cta) => (
              <Link
                key={cta.href + cta.label}
                href={cta.href}
                className={cn(
                  "inline-flex min-h-12 items-center justify-center rounded-md px-5 text-sm font-medium transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marigold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950",
                  cta.variant === "primary" &&
                    "bg-alta-500 text-white hover:bg-alta-600",
                  cta.variant === "secondary" &&
                    "border border-white/35 text-white hover:bg-white/10",
                  cta.variant === "ghost" &&
                    "text-ink-100 underline-offset-4 hover:underline",
                )}
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
