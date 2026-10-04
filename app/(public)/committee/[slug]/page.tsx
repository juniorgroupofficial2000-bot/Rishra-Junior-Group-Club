import { CommitteeSeatCard } from "@/components/committee/committee-seat-card";
import { Reveal } from "@/components/motion";
import { EditorialPageHero } from "@/components/public/editorial-page-hero";
import { EmptyState } from "@/components/public/empty-state";
import { SiteContainer } from "@/components/public/site-container";
import { standingCommitteePageCopy } from "@/content/standing-committees";
import { JsonLd } from "@/lib/json-ld";
import { buildMetadata } from "@/lib/seo/metadata";
import { webPageJsonLd } from "@/lib/seo/structured-data";
import {
  loadPublishedCommitteeBySlug,
  loadPublishedCommittees,
} from "@/server/content/public-loaders";
import Link from "next/link";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
  try {
    const committees = await loadPublishedCommittees();
    return committees.map((committee) => ({ slug: committee.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const committee = await loadPublishedCommitteeBySlug(slug);
  if (!committee) {
    return buildMetadata({
      title: "Committee",
      description: standingCommitteePageCopy.description,
      path: `/committee/${slug}`,
      noIndex: true,
    });
  }

  return buildMetadata({
    title: `${committee.name} | Rishra Junior Group Club`,
    absoluteTitle: true,
    description:
      committee.description ??
      committee.summary ??
      standingCommitteePageCopy.description,
    path: `/committee/${committee.slug}`,
    image: committee.imageSrc
      ? {
          url: committee.imageSrc,
          alt: committee.imageAlt ?? committee.name,
        }
      : undefined,
  });
}

export default async function CommitteeDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const committee = await loadPublishedCommitteeBySlug(slug);
  if (!committee) notFound();

  const leadership = [committee.chairperson, committee.convenor].filter(
    Boolean,
  );
  const memberSeats = committee.seats.filter(
    (seat) =>
      seat.designation !== "chairperson" && seat.designation !== "convenor",
  );
  // Executive detail: show all seats in hierarchy-friendly grids without
  // splitting chair/convenor which may not apply.
  const showLeadershipBlock =
    committee.kind === "SUB" && leadership.length > 0;
  const bodySeats =
    committee.kind === "EXECUTIVE" ? committee.seats : memberSeats;

  return (
    <>
      <JsonLd
        data={webPageJsonLd({
          path: `/committee/${committee.slug}`,
          name: `${committee.name} · Rishra Junior Group Club`,
          description:
            committee.description ??
            committee.summary ??
            standingCommitteePageCopy.description,
          breadcrumbs: [
            { name: "Home", path: "/" },
            { name: "Leadership & Committees", path: "/committee" },
            { name: committee.name, path: `/committee/${committee.slug}` },
          ],
        })}
      />
      <EditorialPageHero
        layout={committee.imageSrc ? "overlay" : "band"}
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Committees", href: "/committee" },
          { label: committee.name },
        ]}
        eyebrow={
          committee.kind === "EXECUTIVE"
            ? "Executive leadership"
            : "Standing committee"
        }
        title={committee.name}
        description={committee.description ?? committee.summary}
        media={
          committee.imageSrc
            ? {
                id: `committee-${committee.slug}`,
                src: committee.imageSrc,
                alt: committee.imageAlt ?? committee.name,
                width: 1600,
                height: 1000,
              }
            : undefined
        }
      />

      <SiteContainer className="space-y-20 pb-20 pt-14 sm:space-y-24 sm:pb-28 sm:pt-20">
        {showLeadershipBlock ? (
          <section aria-labelledby="leadership-heading">
            <Reveal>
              <p className="type-caption text-alta-600">Leadership</p>
              <h2
                id="leadership-heading"
                className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink-900"
              >
                Chairperson &amp; Convenor
              </h2>
            </Reveal>
            <div className="mt-10 grid gap-10 sm:grid-cols-2">
              {leadership.map((seat, index) =>
                seat ? (
                  <CommitteeSeatCard
                    key={seat.id}
                    seat={seat}
                    index={index}
                    featured
                  />
                ) : null,
              )}
            </div>
          </section>
        ) : null}

        <section aria-labelledby="members-heading">
          <Reveal>
            <p className="type-caption text-ink-400">People</p>
            <h2
              id="members-heading"
              className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink-900"
            >
              Members
            </h2>
          </Reveal>
          {bodySeats.length === 0 ? (
            <div className="mt-8">
              <EmptyState
                title={standingCommitteePageCopy.emptyMembers}
                description="Published assignments from the admin portal will appear here."
              />
            </div>
          ) : (
            <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
              {bodySeats.map((seat, index) => (
                <CommitteeSeatCard key={seat.id} seat={seat} index={index} />
              ))}
            </div>
          )}
        </section>

        {committee.responsibilities ? (
          <section aria-labelledby="responsibilities-heading">
            <Reveal>
              <p className="type-caption text-ink-400">Mandate</p>
              <h2
                id="responsibilities-heading"
                className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink-900"
              >
                Committee responsibilities
              </h2>
              <p className="mt-5 max-w-3xl whitespace-pre-line text-base leading-relaxed text-ink-600">
                {committee.responsibilities}
              </p>
            </Reveal>
          </section>
        ) : null}

        {committee.events.length > 0 || committee.announcements.length > 0 ? (
          <section aria-labelledby="activity-heading" className="space-y-8">
            <Reveal>
              <p className="type-caption text-ink-400">Connected work</p>
              <h2
                id="activity-heading"
                className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink-900"
              >
                Committee activity
              </h2>
            </Reveal>
            <div className="grid gap-10 lg:grid-cols-2">
              {committee.events.length > 0 ? (
                <div>
                  <h3 className="font-display text-xl font-semibold text-ink-900">
                    Events
                  </h3>
                  <ul className="mt-4 divide-y divide-border-subtle border-y border-border-subtle">
                    {committee.events.map((event) => (
                      <li key={event.id}>
                        <Link
                          href={`/events/${event.slug}`}
                          className="flex flex-col gap-1 py-4 hover:bg-ink-50/50 sm:flex-row sm:justify-between"
                        >
                          <span className="font-medium text-ink-900">
                            {event.title}
                          </span>
                          <span className="font-mono text-xs text-ink-400">
                            {event.startsAt.slice(0, 10)}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {committee.announcements.length > 0 ? (
                <div>
                  <h3 className="font-display text-xl font-semibold text-ink-900">
                    Announcements
                  </h3>
                  <ul className="mt-4 divide-y divide-border-subtle border-y border-border-subtle">
                    {committee.announcements.map((item) => (
                      <li key={item.id}>
                        <Link
                          href={`/announcements/${item.slug}`}
                          className="block py-4 font-medium text-ink-900 hover:bg-ink-50/50"
                        >
                          {item.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </section>
        ) : null}

        <p className="text-sm text-ink-500">
          <Link href="/committee" className="underline-offset-4 hover:underline">
            ← Back to Leadership &amp; Committees
          </Link>
        </p>
      </SiteContainer>
    </>
  );
}
