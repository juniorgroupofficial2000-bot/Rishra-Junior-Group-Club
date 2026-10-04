"use client";

import { Reveal } from "@/components/motion";
import type { PublicCommitteeCard } from "@/content/org-committees";
import { cn } from "@/lib/cn";
import { isManagedMediaSrc } from "@/lib/media/variant";
import { ArrowUpRight, Landmark, Megaphone, PawPrint, Trophy } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import Link from "next/link";

const ICON_MAP = {
  "paw-print": PawPrint,
  megaphone: Megaphone,
  trophy: Trophy,
  landmark: Landmark,
} as const;

function CommitteeIcon({ iconKey }: { iconKey?: string }) {
  const Icon =
    (iconKey && iconKey in ICON_MAP
      ? ICON_MAP[iconKey as keyof typeof ICON_MAP]
      : null) ?? Landmark;
  return <Icon className="h-5 w-5" aria-hidden />;
}

export function SubCommitteeCard({
  committee,
  index = 0,
  size = "regular",
}: {
  committee: PublicCommitteeCard;
  index?: number;
  size?: "regular" | "large" | "compact";
}) {
  const reduce = Boolean(useReducedMotion());
  const imageSrc = committee.imageSrc ?? committee.coverSrc;
  const imageAlt =
    committee.imageAlt ?? committee.coverAlt ?? `${committee.name} committee`;
  const unoptimized = imageSrc ? !isManagedMediaSrc(imageSrc) : true;

  return (
    <Reveal delay={index * 0.06} as="article" className="h-full">
      <Link
        href={`/committee/${committee.slug}`}
        className={cn(
          "group relative flex h-full flex-col overflow-hidden bg-ink-900 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marigold-400",
          size === "large" && "min-h-[28rem] sm:min-h-[32rem]",
          size === "regular" && "min-h-[24rem]",
          size === "compact" && "min-h-[20rem]",
        )}
      >
        <div className="absolute inset-0">
          {imageSrc ? (
            <motion.div
              className="absolute inset-0"
              whileHover={reduce ? undefined : { scale: 1.05 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <Image
                src={imageSrc}
                alt={imageAlt}
                fill
                sizes="(max-width: 768px) 100vw, 40vw"
                unoptimized={unoptimized}
                className="object-cover opacity-70 transition-opacity duration-500 group-hover:opacity-80"
              />
            </motion.div>
          ) : (
            <div
              className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(212,160,74,0.35),transparent_45%),linear-gradient(160deg,#1a1510_0%,#3a2a18_55%,#0f0d0b_100%)]"
              aria-hidden
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/55 to-ink-950/20" />
        </div>

        <div className="relative flex h-full flex-col justify-end p-6 sm:p-8">
          <div className="mb-auto flex items-start justify-between gap-3 pt-1">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-white/10 text-marigold-300 backdrop-blur-sm">
              <CommitteeIcon iconKey={committee.iconKey} />
            </span>
            <motion.span
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/5"
              aria-hidden
              whileHover={reduce ? undefined : { x: 3, y: -3 }}
            >
              <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </motion.span>
          </div>

          <p className="type-caption text-marigold-300/90">
            {committee.memberCount}{" "}
            {committee.memberCount === 1 ? "Member" : "Members"}
          </p>
          <h3 className="mt-2 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            {committee.name}
          </h3>
          {committee.summary ? (
            <p className="mt-2 max-w-md text-sm leading-relaxed text-white/75 sm:text-base">
              {committee.summary}
            </p>
          ) : null}
          <p className="mt-5 text-sm font-medium text-white/90">
            View committee
            <span className="ml-1 inline-block transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </p>
        </div>
      </Link>
    </Reveal>
  );
}
