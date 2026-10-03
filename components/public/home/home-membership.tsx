"use client";

import { SiteContainer } from "@/components/public/site-container";
import { homeContent, type HomeContent } from "@/content/home";
import { usePrefersStaticMotion } from "@/lib/hooks/use-media-query";
import { lineRevealVariants, transitionSlow } from "@/lib/motion";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import { useRef } from "react";
import { HomeLink } from "./home-link";
import { HomeSectionHeading } from "./home-section-heading";

export function HomeMembership({
  content = homeContent.membership,
}: {
  content?: HomeContent["membership"];
} = {}) {
  const reduce = Boolean(useReducedMotion());
  const staticMotion = usePrefersStaticMotion();
  const scrollFx = !reduce && !staticMotion;
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const bgX = useTransform(scrollYProgress, [0, 1], ["0%", "8%"]);

  return (
    <section
      ref={ref}
      aria-labelledby="home-membership-heading"
      className="relative isolate overflow-hidden border-b border-border-subtle bg-surface-heritage-soft py-20 sm:py-28"
    >
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -inset-x-20 -inset-y-10 bg-[radial-gradient(ellipse_at_30%_40%,rgba(194,58,34,0.12),transparent_55%),radial-gradient(ellipse_at_80%_60%,rgba(196,154,26,0.16),transparent_50%)]"
        style={scrollFx ? { x: bgX } : undefined}
      />

      <SiteContainer className="relative">
        <motion.div
          className="mx-auto max-w-3xl text-center"
          initial={reduce ? false : "hidden"}
          whileInView="visible"
          viewport={{ once: true, margin: "-12%" }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.12 } },
          }}
        >
          <motion.div variants={reduce ? undefined : lineRevealVariants} transition={transitionSlow}>
            <HomeSectionHeading
              align="center"
              eyebrow={content.eyebrow}
              title="Be part of our journey"
              description={content.description}
              titleId="home-membership-heading"
            />
          </motion.div>
          <motion.p
            variants={reduce ? undefined : lineRevealVariants}
            transition={transitionSlow}
            className="mt-4 text-base leading-relaxed text-ink-600"
          >
            {content.body}
          </motion.p>
          <motion.div
            variants={reduce ? undefined : lineRevealVariants}
            transition={transitionSlow}
            className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center"
          >
            {content.ctas.map((cta) => (
              <HomeLink
                key={cta.label}
                {...cta}
                appearance={cta.variant === "primary" ? "solid" : "outline"}
                className="group sm:min-w-[12rem]"
              />
            ))}
          </motion.div>
        </motion.div>
      </SiteContainer>
    </section>
  );
}
