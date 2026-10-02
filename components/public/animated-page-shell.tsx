"use client";

import { OrnamentLine, Reveal, StaggerChildren, StaggerItem } from "@/components/motion";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import {
  breadcrumbsForPage,
  publicPages,
  type PublicPageKey,
} from "@/content/pages";
import { lineRevealVariants, transitionSlow } from "@/lib/motion";
import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { SiteContainer } from "./site-container";

type AnimatedPageShellProps = {
  pageKey: Exclude<PublicPageKey, "home">;
  children?: ReactNode;
};

/**
 * Interior public pages: cinematic header entrance + staggered content.
 */
export function AnimatedPageShell({ pageKey, children }: AnimatedPageShellProps) {
  const page = publicPages[pageKey];
  const crumbs = breadcrumbsForPage(pageKey);
  const reduce = Boolean(useReducedMotion());

  return (
    <>
      <SiteContainer as="header" className="pb-6 pt-8 sm:pb-8 sm:pt-10">
        <Reveal>
          <Breadcrumbs items={crumbs} className="mb-5" />
        </Reveal>
        <motion.div
          initial={reduce ? false : "hidden"}
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
          }}
        >
          {page.eyebrow ? (
            <motion.p
              variants={reduce ? undefined : lineRevealVariants}
              transition={transitionSlow}
              className="type-caption text-alta-600"
            >
              {page.eyebrow}
            </motion.p>
          ) : null}
          <div className="mt-3 overflow-hidden">
            <motion.h1
              variants={reduce ? undefined : lineRevealVariants}
              transition={transitionSlow}
              className="type-h1 text-balance text-ink-900"
            >
              {page.title}
            </motion.h1>
          </div>
          <OrnamentLine className="mt-4 w-20" />
          {page.description ? (
            <motion.p
              variants={reduce ? undefined : lineRevealVariants}
              transition={transitionSlow}
              className="mt-4 max-w-2xl type-body-large text-ink-500"
            >
              {page.description}
            </motion.p>
          ) : null}
        </motion.div>
      </SiteContainer>
      <SiteContainer className="min-w-0 pb-16 sm:pb-20">
        <StaggerChildren className="min-w-0">
          <StaggerItem>{children}</StaggerItem>
        </StaggerChildren>
      </SiteContainer>
    </>
  );
}
