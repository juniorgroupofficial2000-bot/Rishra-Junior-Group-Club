"use client";

import { ProvenanceBadge } from "@/components/heritage/provenance-badge";
import { StaggerChildren, StaggerItem } from "@/components/motion";
import { EmptyState } from "@/components/public/empty-state";
import { Badge } from "@/components/ui/badge";
import {
  announcementCategoryLabel,
  announcementPriorityLabel,
  formatAnnouncementDate,
  type Announcement,
} from "@/content/announcements";
import { Pin } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";

export function AnnouncementList({ items }: { items: Announcement[] }) {
  const reduce = Boolean(useReducedMotion());

  if (items.length === 0) {
    return (
      <EmptyState
        title="No announcements yet"
        description="Official notices appear here when the committee publishes them."
        action={{ label: "Contact the club", href: "/contact" }}
      />
    );
  }

  return (
    <StaggerChildren className="divide-y divide-border-subtle border-y border-border-subtle">
      {items.map((item) => (
        <StaggerItem key={item.id}>
          <article>
            <Link
              href={`/announcements/${item.slug}`}
              className="group grid gap-4 py-8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:grid-cols-[7.5rem_1fr] sm:gap-10"
            >
              <time
                dateTime={item.publishedAt}
                className="font-mono text-xs text-ink-400 sm:pt-1 sm:text-sm"
              >
                {formatAnnouncementDate(item.publishedAt)}
              </time>
              <div className="min-w-0 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  {item.pinned ? (
                    <Badge variant="accent" className="gap-1">
                      <motion.span
                        aria-hidden
                        initial={reduce ? false : { scale: 0.7, opacity: 0 }}
                        whileInView={{ scale: 1, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{
                          type: "spring",
                          stiffness: 280,
                          damping: 16,
                        }}
                        className="inline-flex"
                      >
                        <Pin className="h-3 w-3" />
                      </motion.span>
                      Pinned
                    </Badge>
                  ) : null}
                  <Badge variant="outline">
                    {announcementCategoryLabel[item.category]}
                  </Badge>
                  {item.priority !== "NORMAL" ? (
                    <Badge variant="accent">
                      {announcementPriorityLabel[item.priority]}
                    </Badge>
                  ) : null}
                  <ProvenanceBadge provenance={item.provenance} />
                </div>
                <h2 className="font-display text-2xl font-semibold tracking-tight text-ink-900 transition-colors group-hover:text-alta-600">
                  {item.title}
                </h2>
                <p className="max-w-2xl text-sm leading-relaxed text-ink-500 sm:text-base">
                  {item.summary}
                </p>
              </div>
            </Link>
          </article>
        </StaggerItem>
      ))}
    </StaggerChildren>
  );
}
