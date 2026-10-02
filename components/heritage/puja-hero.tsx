"use client";

import { SiteContainer } from "@/components/public/site-container";
import { saraswatiPujaContent } from "@/content/heritage";
import { siteMedia } from "@/content/site-media";
import {
  heroStaggerVariants,
  lineRevealVariants,
  premiumEase,
  transitionCinematic,
  transitionNormal,
  transitionSlow,
} from "@/lib/motion";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

const content = saraswatiPujaContent.hero;
const media = siteMedia.pujaHero;
const emptySubscribe = () => () => {};

export function PujaHero() {
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!mounted) return;
    const t = window.setTimeout(() => setReady(true), reduceMotion ? 0 : 180);
    return () => window.clearTimeout(t);
  }, [mounted, reduceMotion]);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const smooth = useSpring(scrollYProgress, {
    stiffness: 70,
    damping: 24,
  });
  const imageY = useTransform(smooth, [0, 1], ["0%", "18%"]);
  const imageScale = useTransform(smooth, [0, 1], [1, 1.12]);
  const textY = useTransform(smooth, [0, 1], ["0%", "-18%"]);
  const textOpacity = useTransform(smooth, [0, 0.55], [1, 0]);
  const isSvg = media.src.endsWith(".svg");
  const motionOn = mounted && !reduceMotion;
  const play = motionOn && ready;

  return (
    <section
      ref={sectionRef}
      aria-labelledby="puja-hero-heading"
      className="relative isolate -mt-16 min-h-[72dvh] overflow-hidden bg-ink-950 text-white sm:-mt-[4.5rem] sm:min-h-[80dvh]"
    >
      <motion.div
        className="absolute inset-0"
        style={motionOn ? { y: imageY, scale: imageScale } : undefined}
      >
        <motion.div
          className="absolute inset-0"
          initial={false}
          animate={
            play
              ? { clipPath: "inset(0% 0% 0% 0%)", scale: 1, opacity: 1 }
              : motionOn
                ? { clipPath: "inset(10% 24% 10% 24%)", scale: 1.16, opacity: 0.4 }
                : { clipPath: "inset(0% 0% 0% 0%)", scale: 1, opacity: 1 }
          }
          transition={{ duration: 1.2, ease: premiumEase }}
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
        </motion.div>
        <div
          className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/78 to-ink-950/35"
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(194,58,34,0.22),transparent_55%)]"
          aria-hidden
        />
      </motion.div>

      <SiteContainer className="relative flex min-h-[72dvh] flex-col justify-end pb-14 pt-32 sm:min-h-[80dvh] sm:pb-24 sm:pt-36">
        <motion.div
          className="max-w-3xl"
          style={motionOn ? { y: textY, opacity: textOpacity } : undefined}
          variants={play ? heroStaggerVariants : undefined}
          initial={play ? "hidden" : false}
          animate={play ? "visible" : reduceMotion || !motionOn ? "visible" : "hidden"}
        >
          <motion.p
            variants={lineRevealVariants}
            transition={transitionSlow}
            className="type-caption text-marigold-400"
          >
            {content.eyebrow}
          </motion.p>
          <motion.h1
            id="puja-hero-heading"
            variants={lineRevealVariants}
            transition={transitionCinematic}
            className="type-display mt-4 text-balance"
          >
            {content.title}
          </motion.h1>
          <motion.p
            variants={lineRevealVariants}
            transition={transitionSlow}
            className="mt-6 max-w-2xl type-body-large text-ink-100"
          >
            {content.support}
          </motion.p>
          <motion.div
            variants={lineRevealVariants}
            transition={transitionNormal}
            className="mt-10 flex flex-col gap-3 sm:flex-row"
          >
            {content.ctas.map((cta, index) => (
              <Link
                key={cta.href}
                href={cta.href}
                className={
                  index === 0
                    ? "group inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-alta-500 px-5 type-button text-white transition-[transform,background-color] duration-300 hover:-translate-y-1 hover:bg-alta-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marigold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950"
                    : "inline-flex min-h-12 items-center justify-center rounded-md border border-white/40 px-5 type-button text-white transition-[transform,background-color] duration-300 hover:-translate-y-1 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marigold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950"
                }
              >
                {cta.label}
                {index === 0 ? (
                  <span
                    aria-hidden
                    className="inline-block transition-transform duration-300 group-hover:translate-x-1.5"
                  >
                    →
                  </span>
                ) : null}
              </Link>
            ))}
          </motion.div>
        </motion.div>
      </SiteContainer>
    </section>
  );
}
