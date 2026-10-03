"use client";

import { AnimatedCounter } from "@/components/motion";
import { SiteContainer } from "@/components/public/site-container";
import { homeContent, type HomeContent } from "@/content/home";
import { siteConfig } from "@/content/site";
import { cn } from "@/lib/cn";
import { usePrefersStaticMotion } from "@/lib/hooks/use-media-query";
import { cardRevealVariants, premiumEase, transitionSlow } from "@/lib/motion";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import { useRef } from "react";
import { HomeLink } from "./home-link";
import { HomeSectionHeading } from "./home-section-heading";

/** Derived from the verified founding year — never invent member/payment totals. */
const yearsOfPuja = Math.max(
  1,
  new Date().getFullYear() - siteConfig.establishedYear,
);

export function HomeHeritage({
  content = homeContent.heritage,
}: {
  content?: HomeContent["heritage"];
} = {}) {
  const reduce = Boolean(useReducedMotion());
  const staticMotion = usePrefersStaticMotion();
  const scrollFx = !reduce && !staticMotion;
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 75%", "end 35%"],
  });
  const smooth = useSpring(scrollYProgress, {
    stiffness: 60,
    damping: 20,
  });
  const lineScale = useTransform(smooth, [0, 1], [0, 1]);

  return (
    <section
      ref={sectionRef}
      aria-labelledby="home-heritage-heading"
      className="relative border-b border-border-subtle bg-surface-raised py-20 sm:py-28"
    >
      <SiteContainer>
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={transitionSlow}
        >
          <HomeSectionHeading
            eyebrow={content.eyebrow}
            title={content.title}
            description={content.description}
            titleId="home-heritage-heading"
            actions={<HomeLink {...content.cta} appearance="outline" />}
          />
        </motion.div>

        {/* Verified founding facts only — never invent member counts or dues totals. */}
        <div className="mt-12 grid grid-cols-2 gap-6 border-y border-border-subtle py-8 sm:max-w-lg">
          <div>
            <p className="font-display text-4xl font-semibold text-alta-600 sm:text-5xl">
              <AnimatedCounter value={siteConfig.establishedYear} />
            </p>
            <p className="mt-1 type-caption text-ink-500">Year Saraswati Puja began</p>
          </div>
          <div>
            <p className="font-display text-4xl font-semibold text-alta-600 sm:text-5xl">
              <AnimatedCounter value={yearsOfPuja} suffix="+" />
            </p>
            <p className="mt-1 type-caption text-ink-500">
              Years organizing Saraswati Puja
            </p>
          </div>
        </div>

        <div className="relative mt-14">
          <div
            className="absolute left-[0.85rem] top-2 bottom-2 w-px overflow-hidden bg-ink-200 sm:left-1/2 sm:-translate-x-px"
            aria-hidden
          >
            <motion.div
              className="origin-top h-full w-full bg-gradient-to-b from-alta-500 via-marigold-400 to-lotus-500"
              style={scrollFx ? { scaleY: lineScale } : { scaleY: 1 }}
            />
          </div>

          <ol className="space-y-12">
            {content.items.map((item, index) => (
              <motion.li
                key={item.id}
                variants={reduce ? undefined : cardRevealVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-15% 0px" }}
                transition={{ ...transitionSlow, delay: index * 0.08 }}
              >
                <div
                  className={cn(
                    "relative grid gap-4 sm:grid-cols-2 sm:gap-10",
                    index % 2 === 1 && "sm:[&>*:first-child]:order-2",
                  )}
                >
                  <div
                    className={cn(
                      "pl-10 sm:pl-0",
                      index % 2 === 0 ? "sm:pr-12 sm:text-right" : "sm:pl-12",
                    )}
                  >
                    <motion.p
                      className="font-display text-3xl font-semibold tabular-nums text-alta-600 sm:text-4xl"
                      initial={reduce ? false : { opacity: 0.35, scale: 0.95, x: index % 2 === 0 ? 12 : -12 }}
                      whileInView={{ opacity: 1, scale: 1, x: 0 }}
                      viewport={{ once: true, margin: "-20%" }}
                      transition={{ duration: 0.55, ease: premiumEase }}
                    >
                      {item.year}
                    </motion.p>
                    <h3 className="type-h3 mt-2 text-ink-900">{item.title}</h3>
                    <p className="mt-2 type-body text-ink-500">{item.description}</p>
                  </div>
                  <div className="hidden sm:block" aria-hidden />
                  <motion.span
                    className="absolute left-2 top-2 h-3 w-3 rounded-full border-2 border-marigold-400 bg-surface-raised shadow-sm sm:left-1/2 sm:-translate-x-1/2"
                    initial={reduce ? false : { scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ type: "spring", stiffness: 260, damping: 18 }}
                    aria-hidden
                  />
                </div>
              </motion.li>
            ))}
          </ol>
        </div>
      </SiteContainer>
    </section>
  );
}
