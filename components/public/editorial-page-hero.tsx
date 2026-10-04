"use client";

import { ClipImageReveal, OrnamentLine, Reveal } from "@/components/motion";
import { SiteContainer } from "@/components/public/site-container";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import type { SiteMediaSlot } from "@/content/site-media";
import { lineRevealVariants, transitionSlow } from "@/lib/motion";
import { cn } from "@/lib/cn";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import Image from "next/image";
import { useRef, type ReactNode } from "react";

type Crumb = { label: string; href?: string };

/**
 * Page-specific hero compositions. Avoid the generic “title + cards” shell.
 */
export function EditorialPageHero({
  crumbs,
  eyebrow,
  title,
  description,
  media,
  layout = "split",
  actions,
  className,
}: {
  crumbs: Crumb[];
  eyebrow?: string;
  title: string;
  description?: string;
  media?: SiteMediaSlot;
  layout?: "split" | "band" | "plain" | "overlay";
  actions?: ReactNode;
  className?: string;
}) {
  const reduce = Boolean(useReducedMotion());
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 48]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, reduce ? 1 : 1.06]);

  if (layout === "overlay" && media) {
    const isSvg = media.src.endsWith(".svg");
    return (
      <header
        ref={ref}
        className={cn("relative min-h-[58vh] overflow-hidden bg-ink-900 text-white", className)}
      >
        <motion.div className="absolute inset-0" style={{ y, scale }}>
          <Image
            src={media.src}
            alt={media.alt}
            fill
            priority
            sizes="100vw"
            unoptimized={isSvg}
            className="object-cover opacity-70"
            style={{ objectPosition: media.objectPosition }}
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/50 to-ink-950/25" />
        <SiteContainer className="relative flex min-h-[58vh] flex-col justify-end pb-12 pt-24 sm:pb-16">
          <Breadcrumbs
            items={crumbs}
            className="mb-6 text-white/70 [&_a]:text-white/80"
          />
          {eyebrow ? (
            <p className="type-caption text-marigold-400">{eyebrow}</p>
          ) : null}
          <h1 className="mt-3 max-w-3xl font-display text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
            {title}
          </h1>
          {description ? (
            <p className="mt-4 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg">
              {description}
            </p>
          ) : null}
          {actions ? <div className="mt-8 flex flex-wrap gap-3">{actions}</div> : null}
        </SiteContainer>
      </header>
    );
  }

  if (layout === "band") {
    return (
      <header ref={ref} className={cn("bg-ink-900 text-white", className)}>
        <SiteContainer className="pb-14 pt-10 sm:pb-20 sm:pt-14">
          <Reveal>
            <Breadcrumbs
              items={crumbs}
              className="mb-8 text-white/60 [&_a]:text-white/75"
            />
          </Reveal>
          <motion.div
            initial={reduce ? false : "hidden"}
            animate="visible"
            variants={{
              hidden: {},
              visible: {
                transition: { staggerChildren: 0.12, delayChildren: 0.04 },
              },
            }}
          >
            {eyebrow ? (
              <motion.p
                variants={reduce ? undefined : lineRevealVariants}
                transition={transitionSlow}
                className="type-caption text-marigold-400"
              >
                {eyebrow}
              </motion.p>
            ) : null}
            <motion.h1
              variants={reduce ? undefined : lineRevealVariants}
              transition={transitionSlow}
              className="mt-3 max-w-4xl font-display text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl"
            >
              {title}
            </motion.h1>
            {description ? (
              <motion.p
                variants={reduce ? undefined : lineRevealVariants}
                transition={transitionSlow}
                className="mt-5 max-w-2xl text-base leading-relaxed text-white/75 sm:text-lg"
              >
                {description}
              </motion.p>
            ) : null}
            {actions ? (
              <motion.div
                variants={reduce ? undefined : lineRevealVariants}
                transition={transitionSlow}
                className="mt-8 flex flex-wrap gap-3"
              >
                {actions}
              </motion.div>
            ) : null}
          </motion.div>
        </SiteContainer>
      </header>
    );
  }

  if (layout === "split" && media) {
    const isSvg = media.src.endsWith(".svg");
    return (
      <header ref={ref} className={cn("border-b border-border-subtle", className)}>
        <SiteContainer className="grid items-end gap-10 pb-12 pt-8 lg:grid-cols-2 lg:gap-14 lg:pb-16 lg:pt-12">
          <div>
            <Reveal>
              <Breadcrumbs items={crumbs} className="mb-6" />
            </Reveal>
            {eyebrow ? (
              <p className="type-caption text-alta-600">{eyebrow}</p>
            ) : null}
            <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-ink-900 sm:text-5xl">
              {title}
            </h1>
            <OrnamentLine className="mt-5 w-16" />
            {description ? (
              <p className="mt-5 max-w-xl type-body-large text-ink-500">
                {description}
              </p>
            ) : null}
            {actions ? <div className="mt-8 flex flex-wrap gap-3">{actions}</div> : null}
          </div>
          <ClipImageReveal className="relative aspect-[4/3] overflow-hidden bg-ink-100 lg:aspect-[5/4]">
            <Image
              src={media.src}
              alt={media.alt}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              unoptimized={isSvg}
              className="object-cover"
              style={{ objectPosition: media.objectPosition }}
            />
          </ClipImageReveal>
        </SiteContainer>
      </header>
    );
  }

  return (
    <header ref={ref} className={cn(className)}>
      <SiteContainer className="pb-8 pt-8 sm:pb-10 sm:pt-12">
        <Reveal>
          <Breadcrumbs items={crumbs} className="mb-6" />
        </Reveal>
        {eyebrow ? (
          <p className="type-caption text-alta-600">{eyebrow}</p>
        ) : null}
        <h1 className="mt-3 max-w-3xl font-display text-4xl font-semibold tracking-tight text-ink-900 sm:text-5xl">
          {title}
        </h1>
        <div className="editorial-rule mt-5" aria-hidden />
        {description ? (
          <p className="mt-5 max-w-2xl type-body-large text-ink-500">
            {description}
          </p>
        ) : null}
        {actions ? <div className="mt-8 flex flex-wrap gap-3">{actions}</div> : null}
      </SiteContainer>
    </header>
  );
}
