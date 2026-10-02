import { ProvenanceBadge } from "@/components/heritage/provenance-badge";
import { FadeIn, Stagger, StaggerItem } from "@/components/motion/fade-in";
import { Badge } from "@/components/ui/badge";
import {
  announcementCategoryLabel,
  formatAnnouncementDate,
  type Announcement,
} from "@/content/announcements";
import { Pin } from "lucide-react";
import Link from "next/link";

export function AnnouncementList({ items }: { items: Announcement[] }) {
  if (items.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border-strong px-5 py-8 text-sm text-ink-500">
        No published announcements yet.
      </p>
    );
  }

  return (
    <Stagger className="divide-y divide-border-subtle border-y border-border-subtle">
      {items.map((item) => (
        <StaggerItem key={item.id}>
          <FadeIn>
            <article>
              <Link
                href={`/announcements/${item.slug}`}
                className="group flex flex-col gap-3 py-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:flex-row sm:items-start sm:justify-between sm:gap-8"
              >
                <div className="min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    {item.pinned ? (
                      <Badge variant="accent" className="gap-1">
                        <Pin className="h-3 w-3" aria-hidden />
                        Pinned
                      </Badge>
                    ) : null}
                    <Badge variant="outline">
                      {announcementCategoryLabel[item.category]}
                    </Badge>
                    <ProvenanceBadge provenance={item.provenance} />
                  </div>
                  <h2 className="font-display text-xl font-semibold tracking-tight text-ink-900 group-hover:text-alta-600">
                    {item.title}
                  </h2>
                  <p className="text-sm leading-relaxed text-ink-500">
                    {item.summary}
                  </p>
                </div>
                <time
                  dateTime={item.publishedAt}
                  className="shrink-0 font-mono text-xs text-ink-400 sm:pt-1 sm:text-sm"
                >
                  {formatAnnouncementDate(item.publishedAt)}
                </time>
              </Link>
            </article>
          </FadeIn>
        </StaggerItem>
      ))}
    </Stagger>
  );
}
