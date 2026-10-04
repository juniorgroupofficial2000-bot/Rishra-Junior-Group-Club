"use client";

import { INTRO_DONE_EVENT } from "@/components/motion/intro-overlay";
import { SiteContainer } from "@/components/public/site-container";
import { homeContent, type HomeContent } from "@/content/home";
import { cn } from "@/lib/cn";
import {
  heroStaggerVariants,
  lineRevealVariants,
  transitionCinematic,
  transitionNormal,
  transitionSlow,
} from "@/lib/motion";
import { HeroLcpImage } from "@/components/media/hero-lcp-image";
import { usePrefersStaticMotion } from "@/lib/hooks/use-media-query";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

/** English brand lines — no non-English copy. */
const HEADLINE_LINES = ["RISHRA", "JUNIOR GROUP", "CLUB"] as const;
const TAGLINE = "Community · Tradition · Togetherness";

const emptySubscribe = () => () => {};

export function HomeHero({
  content = homeContent.hero,
}: {
  content?: HomeContent["hero"];
} = {}) {
  const media = content.image;
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!mounted) return;

    // Reduced motion: show content immediately.
    if (reduceMotion) {
      const t = window.setTimeout(() => setReady(true), 0);
      return () => window.clearTimeout(t);
    }

    // Always run a visible hero entrance. Wait for intro on first visit;
    // on return visits, still delay briefly so the wipe + text stagger read.
    let introPending = false;
    try {
      introPending = sessionStorage.getItem("rjgc-intro-seen") !== "1";
    } catch {
      introPending = true;
    }

    if (!introPending) {
      const t = window.setTimeout(() => setReady(true), 220);
      return () => window.clearTimeout(t);
    }

    const onDone = () => setReady(true);
    window.addEventListener(INTRO_DONE_EVENT, onDone);
    const fallback = window.setTimeout(onDone, 1800);
    return () => {
      window.removeEventListener(INTRO_DONE_EVENT, onDone);
      window.clearTimeout(fallback);
    };
  }, [mounted, reduceMotion]);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const smooth = useSpring(scrollYProgress, {
    stiffness: 70,
    damping: 24,
    restDelta: 0.001,
  });

  const imageY = useTransform(smooth, [0, 1], ["0%", "22%"]);
  const imageScale = useTransform(smooth, [0, 1], [1, 1.14]);
  const imageOpacity = useTransform(smooth, [0, 0.8], [1, 0.25]);
  const textY = useTransform(smooth, [0, 1], ["0%", "-28%"]);
  const textOpacity = useTransform(smooth, [0, 0.5], [1, 0]);
  const textScale = useTransform(smooth, [0, 0.65], [1, 0.92]);
  const overlayOpacity = useTransform(smooth, [0, 1], [0.5, 0.9]);

  const prefersStatic = usePrefersStaticMotion();
  // Keep entrance stagger; skip scroll-linked parallax on mobile/touch.
  const motionOn = mounted && !reduceMotion;
  const parallaxOn = motionOn && !prefersStatic;
  const play = motionOn && ready;

  return (
    <section
      ref={sectionRef}
      aria-labelledby="home-hero-heading"
      className="relative isolate -mt-16 min-h-[82dvh] overflow-hidden bg-ink-950 text-white sm:-mt-[4.5rem] sm:min-h-[90dvh]"
    >
      {/*
        Hero image stays fully painted for LCP. Parallax may run after mount;
        intro only gates text/CTA reveal — never the LCP image itself.
      */}
      <motion.div
        className="absolute inset-0"
        style={
          parallaxOn
            ? { y: imageY, scale: imageScale, opacity: imageOpacity }
            : undefined
        }
      >
        <div className="absolute inset-0">
          <HeroLcpImage media={media} />
        </div>
        <motion.div
          className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/72 to-ink-950/30"
          style={parallaxOn ? { opacity: overlayOpacity } : undefined}
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(196,154,26,0.26),transparent_55%)]"
          aria-hidden
        />
      </motion.div>

      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-marigold-400/50 to-transparent"
        aria-hidden
      />

      <SiteContainer className="relative flex min-h-[82dvh] flex-col justify-end pb-14 pt-32 sm:min-h-[90dvh] sm:pb-24 sm:pt-36">
        <motion.div
          className="max-w-3xl"
          style={
            parallaxOn
              ? { y: textY, opacity: textOpacity, scale: textScale }
              : undefined
          }
          variants={play ? heroStaggerVariants : undefined}
          initial={play ? "hidden" : false}
          animate={play ? "visible" : reduceMotion || !motionOn ? "visible" : "hidden"}
        >
          <motion.p
            variants={lineRevealVariants}
            transition={transitionSlow}
            className="type-caption tracking-[0.22em] text-marigold-400"
          >
            ESTABLISHED · 2000
          </motion.p>

          <h1
            id="home-hero-heading"
            className="mt-5 font-display text-[clamp(2.5rem,7.5vw,5rem)] font-semibold leading-[0.95] tracking-tight text-white"
          >
            {HEADLINE_LINES.map((line) => (
              <span key={line} className="block overflow-hidden py-0.5">
                <motion.span
                  className="block"
                  variants={lineRevealVariants}
                  transition={transitionCinematic}
                >
                  {line}
                </motion.span>
              </span>
            ))}
          </h1>

          <motion.p
            variants={lineRevealVariants}
            transition={transitionSlow}
            className="mt-5 font-display text-xl text-marigold-300/95 sm:text-2xl"
          >
            {TAGLINE}
          </motion.p>

          <motion.p
            variants={lineRevealVariants}
            transition={transitionSlow}
            className="mt-5 max-w-xl type-body-large text-ink-100"
          >
            {content.support}
          </motion.p>

          <motion.div
            variants={lineRevealVariants}
            transition={transitionNormal}
            className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap"
          >
            {content.ctas.map((cta) => (
              <Link
                key={cta.href + cta.label}
                href={cta.href}
                className={cn(
                  "group inline-flex min-h-12 items-center justify-center gap-2 rounded-md px-5 type-button transition-[transform,background-color,border-color,color,box-shadow] duration-300",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marigold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950",
                  "hover:-translate-y-1 hover:shadow-md",
                  cta.variant === "primary" &&
                    "bg-alta-500 text-white hover:bg-alta-600",
                  cta.variant === "secondary" &&
                    "border border-white/40 text-white hover:bg-white/10",
                  cta.variant === "ghost" &&
                    "text-ink-100 underline-offset-4 hover:underline",
                )}
              >
                {cta.label}
                {cta.variant === "primary" ? (
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

        <div className="mt-12 flex flex-col items-start gap-2">
          <motion.div
            className="h-px max-w-md origin-left bg-gradient-to-r from-marigold-400/80 to-transparent"
            initial={false}
            animate={play ? { scaleX: 1, opacity: 0.8 } : { scaleX: 0, opacity: 0 }}
            transition={{ ...transitionSlow, delay: 0.5 }}
            style={{ width: "100%" }}
            aria-hidden
          />
          {motionOn ? (
            <motion.div
              className="mt-5 flex items-center gap-3 text-xs tracking-[0.22em] text-white/60 uppercase"
              initial={{ opacity: 0, y: 8 }}
              animate={
                play
                  ? { opacity: 1, y: [0, 8, 0] }
                  : { opacity: 0, y: 8 }
              }
              transition={{
                opacity: { delay: 1.05, duration: 0.45 },
                y: {
                  delay: 1.05,
                  duration: 1.7,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
              }}
            >
              <span className="block h-10 w-px bg-marigold-400" aria-hidden />
              Scroll
            </motion.div>
          ) : null}
        </div>
      </SiteContainer>

      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-ivory-50 via-ivory-50/40 to-transparent"
        aria-hidden
      />
    </section>
  );
}
