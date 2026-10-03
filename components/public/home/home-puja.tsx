"use client";

import { ClipImageReveal } from "@/components/motion";
import { SiteContainer } from "@/components/public/site-container";
import { homeContent, type HomeContent } from "@/content/home";
import { siteMedia } from "@/content/site-media";
import { usePrefersStaticMotion } from "@/lib/hooks/use-media-query";
import { lineRevealVariants, transitionSlow } from "@/lib/motion";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import Image from "next/image";
import { useRef } from "react";
import { HomeLink } from "./home-link";
import { HomeSectionHeading } from "./home-section-heading";

const media = siteMedia.puja;
const isSvg = media.src.endsWith(".svg");

export function HomePuja({
  content = homeContent.puja,
}: {
  content?: HomeContent["puja"];
} = {}) {
  const reduce = Boolean(useReducedMotion());
  const staticMotion = usePrefersStaticMotion();
  const scrollFx = !reduce && !staticMotion;
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const smooth = useSpring(scrollYProgress, { stiffness: 70, damping: 22 });
  const imageScale = useTransform(smooth, [0, 1], [1.08, 1]);
  const imageY = useTransform(smooth, [0, 1], ["8%", "-6%"]);
  const textX = useTransform(smooth, [0.15, 0.55], [-40, 0]);
  const mediaX = useTransform(smooth, [0.15, 0.55], [48, 0]);
  const motifRotate = useTransform(smooth, [0, 1], [0, 18]);

  return (
    <section
      ref={sectionRef}
      aria-labelledby="home-puja-heading"
      className="relative isolate overflow-hidden bg-ink-900 py-20 text-white sm:py-28"
    >
      <div className="absolute inset-0" aria-hidden>
        <Image
          src={media.src}
          alt=""
          fill
          sizes="100vw"
          unoptimized={isSvg}
          className="object-cover opacity-35"
          style={{ objectPosition: media.objectPosition }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink-950 via-ink-950/90 to-ink-950/55" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_20%,rgba(196,154,26,0.28),transparent_50%)]" />
      </div>

      {scrollFx ? (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -right-16 top-10 h-56 w-56 rounded-full border border-marigold-400/25"
          style={{ rotate: motifRotate }}
        />
      ) : null}

      <SiteContainer className="relative">
        <div className="grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <motion.div
            style={scrollFx ? { x: textX } : undefined}
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
                tone="inverse"
                eyebrow={content.eyebrow}
                title={content.title}
                description={content.description}
                titleId="home-puja-heading"
              />
            </motion.div>
            <motion.p
              variants={reduce ? undefined : lineRevealVariants}
              transition={transitionSlow}
              className="mt-6 max-w-xl type-body-large text-ink-100"
            >
              {content.body}
            </motion.p>
            <motion.div
              variants={reduce ? undefined : lineRevealVariants}
              transition={transitionSlow}
              className="mt-9"
            >
              <HomeLink
                {...content.cta}
                className="group bg-alta-500 text-white hover:bg-alta-600 focus-visible:ring-marigold-400 focus-visible:ring-offset-ink-900"
              />
            </motion.div>
          </motion.div>

          <motion.div style={scrollFx ? { x: mediaX } : undefined} className="mx-auto w-full max-w-sm">
            <ClipImageReveal className="rounded-xl ring-1 ring-white/15 shadow-lg">
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl">
                <motion.div
                  className="absolute inset-0"
                  style={scrollFx ? { scale: imageScale, y: imageY } : undefined}
                >
                  <Image
                    src={media.src}
                    alt={media.alt}
                    fill
                    sizes="(max-width: 1024px) 80vw, 340px"
                    unoptimized={isSvg}
                    className="object-cover"
                    style={{ objectPosition: media.objectPosition }}
                    data-cursor-label="VIEW"
                  />
                </motion.div>
              </div>
            </ClipImageReveal>
          </motion.div>
        </div>
      </SiteContainer>
    </section>
  );
}
