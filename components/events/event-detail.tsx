import { ProvenanceBadge } from "@/components/heritage/provenance-badge";
import { OptimizedMedia } from "@/components/media/optimized-media";
import { FadeIn, Stagger, StaggerItem } from "@/components/motion/fade-in";
import {
  formatEventDateRange,
  getEventTemporalStatus,
  type ClubEvent,
} from "@/content/events";
import { CalendarDays, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function EventDetail({ event }: { event: ClubEvent }) {
  const status = getEventTemporalStatus(event);
  const cover = event.coverImage;
  const isSvg = cover?.src.endsWith(".svg");

  return (
    <article className="space-y-10">
      <FadeIn>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-sm bg-ink-100 px-2 py-0.5 text-xs font-medium uppercase tracking-wide text-ink-700">
            {status}
          </span>
          <ProvenanceBadge provenance={event.provenance} />
        </div>
        <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl">
          {event.title}
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-ink-500">
          {event.summary}
        </p>
        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="flex gap-3 text-sm text-ink-700">
            <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-ink-400" aria-hidden />
            <div>
              <dt className="font-medium text-ink-900">Date & time</dt>
              <dd>
                <time dateTime={event.startsAt}>{formatEventDateRange(event)}</time>
              </dd>
            </div>
          </div>
          <div className="flex gap-3 text-sm text-ink-700">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-ink-400" aria-hidden />
            <div>
              <dt className="font-medium text-ink-900">Venue</dt>
              <dd>
                <p>{event.venue.name}</p>
                {event.venue.addressLines.map((line) => (
                  <p key={line} className="text-ink-500">
                    {line}
                  </p>
                ))}
              </dd>
            </div>
          </div>
        </dl>
      </FadeIn>

      {cover ? (
        <FadeIn delay={0.05}>
          <div className="relative mx-auto aspect-[16/9] max-w-3xl overflow-hidden rounded-xl bg-ink-900">
            <Image
              src={cover.src}
              alt={cover.alt}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 768px"
              unoptimized={isSvg}
              className="object-cover"
            />
          </div>
        </FadeIn>
      ) : null}

      <FadeIn delay={0.08}>
        <div className="max-w-prose space-y-4 text-base leading-relaxed text-ink-600">
          {event.description.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </FadeIn>

      {event.gallery.length > 0 ? (
        <section aria-labelledby="event-gallery-heading">
          <h2
            id="event-gallery-heading"
            className="font-display text-2xl font-semibold text-ink-900"
          >
            Gallery
          </h2>
          <Stagger className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3">
            {event.gallery.map((media, index) => (
              <StaggerItem key={media.id}>
                <OptimizedMedia
                  media={media}
                  priority={index === 0}
                  sizes="(max-width: 768px) 50vw, 33vw"
                  className="overflow-hidden rounded-lg [&_div]:aspect-square"
                />
              </StaggerItem>
            ))}
          </Stagger>
        </section>
      ) : null}

      <aside className="rounded-2xl bg-ink-900 px-6 py-8 text-white sm:px-8">
        <h2 className="font-display text-2xl font-semibold tracking-tight">
          Registration
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-200">
          {event.registration.note ??
            "Use the official club channels to confirm attendance."}
        </p>
        <Link
          href={event.registration.href}
          className="mt-6 inline-flex min-h-12 items-center justify-center rounded-md bg-alta-500 px-5 text-sm font-medium text-white transition-colors hover:bg-alta-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marigold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-900"
        >
          {event.registration.label}
        </Link>
        {!event.registration.enabled ? (
          <p className="mt-3 text-xs text-ink-300">
            Online registration workflow is prepared for future CMS enablement.
          </p>
        ) : null}
      </aside>
    </article>
  );
}
