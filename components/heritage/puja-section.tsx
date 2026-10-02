"use client";

import { ClipImageReveal, SlideIn } from "@/components/motion";
import { SiteContainer } from "@/components/public/site-container";
import type { PujaSectionBlock } from "@/content/heritage";
import { cn } from "@/lib/cn";
import { lineRevealVariants, transitionSlow } from "@/lib/motion";
import { motion, useReducedMotion } from "motion/react";
import { HeritageImage } from "./heritage-image";
import { ProvenanceBadge } from "./provenance-badge";

type PujaSectionProps = {
  section: PujaSectionBlock;
  id?: string;
  reverse?: boolean;
  tone?: "default" | "raised" | "inverse";
};

export function PujaSection({
  section,
  id,
  reverse = false,
  tone = "default",
}: PujaSectionProps) {
  const headingId = `${section.id}-heading`;
  const reduce = Boolean(useReducedMotion());

  return (
    <section
      id={id ?? section.id}
      aria-labelledby={headingId}
      className={cn(
        "py-16 sm:py-20",
        tone === "raised" && "bg-surface-raised",
        tone === "inverse" && "bg-ink-900 text-white",
        tone === "default" && "border-b border-border-subtle",
      )}
    >
      <SiteContainer>
        <div
          className={cn(
            "grid items-center gap-10 lg:grid-cols-2 lg:gap-14",
            reverse && "lg:[&>*:first-child]:order-2",
          )}
        >
          <motion.div
            className="min-w-0"
            initial={reduce ? false : "hidden"}
            whileInView="visible"
            viewport={{ once: true, margin: "-12%" }}
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.1 } },
            }}
          >
            <motion.div variants={reduce ? undefined : lineRevealVariants} transition={transitionSlow}>
              <div className="flex flex-wrap items-center gap-2">
                <ProvenanceBadge provenance={section.provenance} />
              </div>
            </motion.div>
            <motion.h2
              id={headingId}
              variants={reduce ? undefined : lineRevealVariants}
              transition={transitionSlow}
              className={cn(
                "mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl",
                tone === "inverse" ? "text-white" : "text-ink-900",
              )}
            >
              {section.title}
            </motion.h2>
            <motion.div
              variants={reduce ? undefined : lineRevealVariants}
              transition={transitionSlow}
              className={cn(
                "mt-5 space-y-4 text-base leading-relaxed",
                tone === "inverse" ? "text-ink-200" : "text-ink-600",
              )}
            >
              {section.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </motion.div>
          </motion.div>
          {section.image ? (
            <SlideIn
              from={reverse ? "left" : "right"}
              className="mx-auto min-w-0 w-full max-w-sm lg:max-w-md"
            >
              <ClipImageReveal className="rounded-xl">
                <HeritageImage
                  image={section.image}
                  frameClassName="aspect-[4/3] rounded-xl"
                  sizes="(max-width: 1024px) 80vw, 380px"
                />
              </ClipImageReveal>
            </SlideIn>
          ) : null}
        </div>
      </SiteContainer>
    </section>
  );
}
