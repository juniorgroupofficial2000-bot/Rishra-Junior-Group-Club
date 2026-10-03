import { ProvenanceBadge } from "@/components/heritage/provenance-badge";
import { FadeIn } from "@/components/motion/fade-in";
import { Badge } from "@/components/ui/badge";
import {
  announcementCategoryLabel,
  formatAnnouncementDate,
  type Announcement,
} from "@/content/announcements";
import { Pin } from "lucide-react";
import Link from "next/link";

export function AnnouncementDetail({
  announcement,
}: {
  announcement: Announcement;
}) {
  const title = announcement.title.replace(/^\[SAMPLE\]\s*/i, "");

  return (
    <article className="mx-auto max-w-3xl">
      <FadeIn>
        <div className="flex flex-wrap items-center gap-2">
          {announcement.pinned ? (
            <Badge variant="accent" className="gap-1">
              <Pin className="h-3 w-3" aria-hidden />
              Pinned
            </Badge>
          ) : null}
          <Badge variant="outline">
            {announcementCategoryLabel[announcement.category]}
          </Badge>
          <ProvenanceBadge provenance={announcement.provenance} />
        </div>
        <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl">
          {title}
        </h1>
        <p className="mt-3 text-base leading-relaxed text-ink-500">
          {announcement.summary}
        </p>
        <time
          dateTime={announcement.publishedAt}
          className="mt-4 block font-mono text-sm text-ink-400"
        >
          {formatAnnouncementDate(announcement.publishedAt)}
        </time>
        <div className="mt-8 space-y-4 text-base leading-relaxed text-ink-700">
          {announcement.body.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        <p className="mt-10">
          <Link
            href="/announcements"
            className="text-sm font-medium text-ink-800 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            ← All announcements
          </Link>
        </p>
      </FadeIn>
    </article>
  );
}
