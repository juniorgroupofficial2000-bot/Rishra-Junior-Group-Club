import { PujaStatusBadge } from "@/components/heritage/puja-status-badge";
import { SiteContainer } from "@/components/public/site-container";
import type { PujaArchiveYear } from "@/content/heritage";
import { Reveal } from "@/components/motion";
import Link from "next/link";

function formatRange(startsOn?: string, endsOn?: string) {
  if (!startsOn) return null;
  const start = new Date(startsOn);
  const end = endsOn ? new Date(endsOn) : null;
  const startLabel = start.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  if (!end) return startLabel;
  const endLabel = end.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return startLabel === endLabel ? startLabel : `${startLabel} – ${endLabel}`;
}

export function PujaSpotlight({ year }: { year: PujaArchiveYear | null }) {
  if (!year) {
    return (
      <section className="border-y border-border-subtle bg-surface-raised/70 py-14 sm:py-16">
        <SiteContainer>
          <Reveal>
            <p className="type-caption text-alta-600">Current celebration</p>
            <h2 className="type-h2 mt-2 text-ink-900">
              Dates will appear when published
            </h2>
            <p className="mt-4 max-w-2xl type-body text-ink-600">
              Important dates, location, and the programme for the next
              Saraswati Puja will be shown here once the committee publishes a
              year record.
            </p>
            <Link
              href="/contact"
              className="mt-6 inline-flex min-h-11 items-center text-sm font-medium text-ink-800 underline-offset-4 hover:underline"
            >
              Contact the club
            </Link>
          </Reveal>
        </SiteContainer>
      </section>
    );
  }

  const dates = formatRange(year.startsOn, year.endsOn);
  const href = year.href ?? `/saraswati-puja/${year.year}`;

  return (
    <section
      id="upcoming"
      aria-labelledby="puja-spotlight-heading"
      className="relative overflow-hidden border-y border-border-subtle bg-[linear-gradient(180deg,rgba(247,242,232,0.95),rgba(239,232,218,0.9))] py-14 sm:py-20"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, #F02000 0.8px, transparent 1px), radial-gradient(circle at 80% 60%, #F87018 0.8px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
        aria-hidden
      />
      <SiteContainer className="relative">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-end">
          <Reveal>
            <div className="flex flex-wrap items-center gap-3">
              <p className="type-caption text-alta-600">
                {year.liveStatus === "completed"
                  ? "Recent celebration"
                  : "Current celebration"}
              </p>
              <PujaStatusBadge status={year.liveStatus} />
            </div>
            <h2
              id="puja-spotlight-heading"
              className="type-display mt-3 text-balance text-ink-900"
            >
              {year.title}
            </h2>
            {year.theme ? (
              <p className="mt-3 font-display text-xl text-ink-700 sm:text-2xl">
                {year.theme}
              </p>
            ) : null}
            <p className="mt-5 max-w-2xl type-body-large text-ink-600">
              {year.summary}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href={href}
                className="inline-flex min-h-12 items-center justify-center rounded-md bg-ink-900 px-5 type-button text-white transition-transform hover:-translate-y-0.5 hover:bg-ink-800"
              >
                Open year archive
              </Link>
              {year.schedule?.length ? (
                <a
                  href="#puja-schedule"
                  className="inline-flex min-h-12 items-center justify-center rounded-md border border-ink-300 px-5 type-button text-ink-800 hover:bg-white/60"
                >
                  View schedule
                </a>
              ) : null}
            </div>
          </Reveal>

          <Reveal>
            <dl className="grid gap-4 rounded-2xl border border-border-subtle bg-surface-raised/90 p-5 shadow-sm sm:p-6">
              {dates ? (
                <div>
                  <dt className="type-caption text-ink-400">Important dates</dt>
                  <dd className="mt-1 text-base font-medium text-ink-900">
                    {dates}
                  </dd>
                </div>
              ) : null}
              {year.locationLabel || year.locationDetail ? (
                <div>
                  <dt className="type-caption text-ink-400">Location</dt>
                  <dd className="mt-1 text-base font-medium text-ink-900">
                    {year.locationLabel}
                    {year.locationDetail ? (
                      <span className="mt-1 block text-sm font-normal text-ink-600">
                        {year.locationDetail}
                      </span>
                    ) : null}
                  </dd>
                </div>
              ) : null}
              {year.highlights?.length ? (
                <div>
                  <dt className="type-caption text-ink-400">Highlights</dt>
                  <dd className="mt-2 space-y-1.5">
                    {year.highlights.slice(0, 4).map((item) => (
                      <p key={item} className="text-sm text-ink-700">
                        {item}
                      </p>
                    ))}
                  </dd>
                </div>
              ) : null}
            </dl>
          </Reveal>
        </div>
      </SiteContainer>
    </section>
  );
}
