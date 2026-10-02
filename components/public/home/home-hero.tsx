"use client";

import { SiteContainer } from "@/components/public/site-container";
import { homeContent } from "@/content/home";
import { siteMedia } from "@/content/site-media";
import { cn } from "@/lib/cn";
import {
  heroStaggerVariants,
  textRevealVariants,
  transitionCinematic,
  transitionNormal,
  transitionSlow,
} from "@/lib/motion";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";

const content = homeContent.hero;
const media = siteMedia.hero;

export function HomeHero() {
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);
  const isSvg = media.src.endsWith(".svg");

  return (
    <section
      ref={sectionRef}
      aria-labelledby="home-hero-heading"
      className="relative isolate -mt-16 min-h-[92dvh] overflow-hidden bg-ink-950 text-white sm:-mt-[4.5rem]"
    >
      <motion.div
        className="absolute inset-0"
        initial={reduceMotion ? false : { opacity: 0, scale: 1.06 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={transitionCinematic}
        style={reduceMotion ? undefined : { y: imageY }}
      >
        <Image
          src={media.src}
          alt={media.alt}
          fill
          priority
          sizes="100vw"
          unoptimized={isSvg}
          className="object-cover"
          style={{ objectPosition: media.objectPosition }}
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/72 to-ink-950/30"
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(196,154,26,0.18),transparent_55%)]"
          aria-hidden
        />
      </motion.div>

      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-marigold-400/50 to-transparent"
        aria-hidden
      />

      <SiteContainer className="relative flex min-h-[92dvh] flex-col justify-end pb-16 pt-32 sm:pb-24 sm:pt-36">
        <motion.div
          className="max-w-3xl"
          variants={reduceMotion ? undefined : heroStaggerVariants}
          initial={reduceMotion ? false : "hidden"}
          animate="visible"
        >
          <motion.p
            variants={reduceMotion ? undefined : textRevealVariants}
            transition={transitionSlow}
            className="type-caption text-marigold-400"
          >
            {content.established}
          </motion.p>

          <div className="mt-5 overflow-hidden">
            <motion.h1
              id="home-hero-heading"
              variants={reduceMotion ? undefined : textRevealVariants}
              transition={{ ...transitionCinematic, delay: 0.05 }}
              className="type-display text-balance text-white"
            >
              {content.headline}
            </motion.h1>
          </div>

          <motion.p
            variants={reduceMotion ? undefined : textRevealVariants}
            transition={transitionSlow}
            className="mt-6 max-w-xl type-body-large text-ink-100"
          >
            {content.support}
          </motion.p>

          <motion.div
            variants={reduceMotion ? undefined : textRevealVariants}
            transition={transitionNormal}
            className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap"
          >
            {content.ctas.map((cta) => (
              <Link
                key={cta.href + cta.label}
                href={cta.href}
                className={cn(
                  "group inline-flex min-h-12 items-center justify-center rounded-md px-5 type-button transition-[transform,background-color,border-color,color] duration-300",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marigold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950",
                  "hover:-translate-y-0.5",
                  cta.variant === "primary" &&
                    "bg-alta-500 text-white hover:bg-alta-600",
                  cta.variant === "secondary" &&
                    "border border-white/40 text-white hover:bg-white/10",
                  cta.variant === "ghost" &&
                    "text-ink-100 underline-offset-4 hover:underline",
                )}
              >
                {cta.label}
              </Link>
            ))}
          </motion.div>
        </motion.div>

        <div
          className="mt-14 h-px w-full max-w-md ornament-rule opacity-70"
          aria-hidden
        />
      </SiteContainer>
    </section>
  );
}
