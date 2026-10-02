"use client";

import { SiteContainer } from "@/components/public/site-container";
import { saraswatiPujaContent } from "@/content/heritage";
import { siteMedia } from "@/content/site-media";
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

const content = saraswatiPujaContent.hero;
const media = siteMedia.pujaHero;

export function PujaHero() {
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "10%"]);
  const isSvg = media.src.endsWith(".svg");

  return (
    <section
      ref={sectionRef}
      aria-labelledby="puja-hero-heading"
      className="relative isolate -mt-16 min-h-[86dvh] overflow-hidden bg-ink-950 text-white sm:-mt-[4.5rem]"
    >
      <motion.div
        className="absolute inset-0"
        initial={reduceMotion ? false : { opacity: 0, scale: 1.05 }}
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
          className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/78 to-ink-950/35"
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(194,58,34,0.18),transparent_55%)]"
          aria-hidden
        />
      </motion.div>

      <SiteContainer className="relative flex min-h-[86dvh] flex-col justify-end pb-16 pt-32 sm:pb-24">
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
            {content.eyebrow}
          </motion.p>
          <motion.h1
            id="puja-hero-heading"
            variants={reduceMotion ? undefined : textRevealVariants}
            transition={transitionCinematic}
            className="type-display mt-4 text-balance"
          >
            {content.title}
          </motion.h1>
          <motion.p
            variants={reduceMotion ? undefined : textRevealVariants}
            transition={transitionSlow}
            className="mt-6 max-w-2xl type-body-large text-ink-100"
          >
            {content.support}
          </motion.p>
          <motion.div
            variants={reduceMotion ? undefined : textRevealVariants}
            transition={transitionNormal}
            className="mt-10 flex flex-col gap-3 sm:flex-row"
          >
            {content.ctas.map((cta, index) => (
              <Link
                key={cta.href}
                href={cta.href}
                className={
                  index === 0
                    ? "inline-flex min-h-12 items-center justify-center rounded-md bg-alta-500 px-5 type-button text-white transition-[transform,background-color] duration-300 hover:-translate-y-0.5 hover:bg-alta-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marigold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950"
                    : "inline-flex min-h-12 items-center justify-center rounded-md border border-white/40 px-5 type-button text-white transition-[transform,background-color] duration-300 hover:-translate-y-0.5 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marigold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950"
                }
              >
                {cta.label}
              </Link>
            ))}
          </motion.div>
        </motion.div>
      </SiteContainer>
    </section>
  );
}
