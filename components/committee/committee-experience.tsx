"use client";

import { CommitteeDirectory } from "@/components/committee/committee-directory";
import { SubCommitteeCard } from "@/components/committee/sub-committee-card";
import { Reveal } from "@/components/motion";
import type { CommitteeMember } from "@/content/committee";
import type {
  CommitteeSearchHit,
  PublicCommitteeCard,
} from "@/content/org-committees";
import { standingCommitteePageCopy } from "@/content/standing-committees";
import { EmptyState } from "@/components/public/empty-state";
import { cn } from "@/lib/cn";
import { Search, X } from "lucide-react";
import { useDeferredValue, useMemo, useState } from "react";

export function CommitteeExperience({
  executiveMembers,
  committees,
  searchIndex,
}: {
  executiveMembers: CommitteeMember[];
  committees: PublicCommitteeCard[];
  searchIndex: CommitteeSearchHit[];
}) {
  const [filter, setFilter] = useState<string>("all");
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const subCommittees = useMemo(
    () => committees.filter((c) => c.kind === "SUB"),
    [committees],
  );
  const executiveCommittee = committees.find((c) => c.kind === "EXECUTIVE");

  const filters = useMemo(() => {
    const items = [
      { key: "all", label: "All" },
      {
        key: "executive",
        label: executiveCommittee?.name ?? "Executive Committee",
      },
      ...subCommittees.map((c) => ({ key: c.slug, label: c.name })),
    ];
    return items;
  }, [executiveCommittee?.name, subCommittees]);

  const searchResults = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();
    if (!q) return [];
    return searchIndex.filter(
      (hit) =>
        hit.displayName.toLowerCase().includes(q) ||
        hit.role.toLowerCase().includes(q) ||
        hit.committeeName.toLowerCase().includes(q),
    );
  }, [deferredQuery, searchIndex]);

  const showExecutive =
    filter === "all" || filter === "executive" || filter === "executive-committee";
  const showSubs = filter === "all" || subCommittees.some((c) => c.slug === filter);
  const filteredSubs =
    filter === "all"
      ? subCommittees
      : subCommittees.filter((c) => c.slug === filter);

  const hasAnyContent =
    executiveMembers.length > 0 || subCommittees.length > 0;

  if (!hasAnyContent) {
    return (
      <EmptyState
        title="Committees will appear here"
        description={standingCommitteePageCopy.emptyCommittees}
        action={{ label: "Contact the club", href: "/contact" }}
      />
    );
  }

  return (
    <div className="space-y-16 sm:space-y-24">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div
          className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          role="tablist"
          aria-label="Committee filters"
        >
          {filters.map((item) => {
            const active = filter === item.key;
            return (
              <button
                key={item.key}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setFilter(item.key)}
                className={cn(
                  "min-h-11 shrink-0 rounded-full border px-4 text-sm font-medium transition-colors",
                  active
                    ? "border-ink-900 bg-ink-900 text-white"
                    : "border-border-default bg-surface-raised text-ink-700 hover:bg-ink-50",
                )}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        <div className="hidden min-w-[16rem] sm:block sm:max-w-sm sm:flex-1 lg:max-w-md">
          <label className="relative block">
            <span className="sr-only">
              {standingCommitteePageCopy.searchPlaceholder}
            </span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={standingCommitteePageCopy.searchPlaceholder}
              className="min-h-11 w-full rounded-full border border-border-default bg-surface-raised pl-10 pr-4 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </label>
        </div>

        <button
          type="button"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-border-default px-4 text-sm font-medium sm:hidden"
          onClick={() => setMobileSearchOpen((open) => !open)}
          aria-expanded={mobileSearchOpen}
        >
          {mobileSearchOpen ? (
            <X className="h-4 w-4" />
          ) : (
            <Search className="h-4 w-4" />
          )}
          Search
        </button>
      </div>

      {mobileSearchOpen ? (
        <div className="sm:hidden">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={standingCommitteePageCopy.searchPlaceholder}
            className="min-h-12 w-full rounded-xl border border-border-default bg-surface-raised px-4 text-base outline-none focus-visible:ring-2 focus-visible:ring-ring"
            autoFocus
          />
        </div>
      ) : null}

      {deferredQuery.trim() ? (
        <section aria-live="polite" className="space-y-4">
          <Reveal>
            <h2 className="font-display text-2xl font-semibold text-ink-900">
              Search results
            </h2>
          </Reveal>
          {searchResults.length === 0 ? (
            <p className="text-sm text-ink-500">No matches for “{query}”.</p>
          ) : (
            <ul className="divide-y divide-border-subtle border-y border-border-subtle">
              {searchResults.map((hit) => (
                <li key={hit.id}>
                  <a
                    href={`/committee/${hit.committeeSlug}`}
                    className="flex flex-col gap-1 py-4 transition-colors hover:bg-ink-50/60 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
                  >
                    <span className="font-display text-lg font-semibold text-ink-900">
                      {hit.displayName}
                    </span>
                    <span className="text-sm text-ink-500">
                      {hit.role} · {hit.committeeName}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : (
        <>
          {showExecutive ? (
            <section aria-labelledby="executive-heading">
              <Reveal>
                <p className="type-caption text-alta-600">Leadership</p>
                <h2
                  id="executive-heading"
                  className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl"
                >
                  {executiveCommittee?.name ?? "Executive Committee"}
                </h2>
                <p className="mt-3 max-w-2xl text-base leading-relaxed text-ink-600">
                  {executiveCommittee?.description ??
                    "Primary leadership guiding programmes, membership, and community life."}
                </p>
              </Reveal>
              <div className="mt-10">
                <CommitteeDirectory
                  members={executiveMembers}
                  showPrivacyNote={false}
                />
              </div>
            </section>
          ) : null}

          {showSubs && filteredSubs.length > 0 ? (
            <section aria-labelledby="subcommittees-heading" className="space-y-10">
              <Reveal>
                <p className="type-caption text-ink-400">Standing committees</p>
                <h2
                  id="subcommittees-heading"
                  className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl"
                >
                  {standingCommitteePageCopy.subCommitteesTitle}
                </h2>
                <p className="mt-3 max-w-2xl text-base leading-relaxed text-ink-600">
                  {standingCommitteePageCopy.subCommitteesDescription}
                </p>
              </Reveal>

              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-12">
                {filteredSubs.map((committee, index) => {
                  const size =
                    filter !== "all"
                      ? "large"
                      : index % 5 === 0
                        ? "large"
                        : index % 3 === 0
                          ? "compact"
                          : "regular";
                  return (
                    <div
                      key={committee.id}
                      className={cn(
                        size === "large" && "md:col-span-2 xl:col-span-7",
                        size === "regular" && "xl:col-span-5",
                        size === "compact" && "xl:col-span-4",
                        size !== "large" &&
                          size !== "compact" &&
                          "md:col-span-1",
                      )}
                    >
                      <SubCommitteeCard
                        committee={committee}
                        index={index}
                        size={size}
                      />
                    </div>
                  );
                })}
              </div>
            </section>
          ) : null}

          {showSubs && filteredSubs.length === 0 && filter !== "all" ? (
            <EmptyState
              title="No members published for this filter"
              description={standingCommitteePageCopy.emptyMembers}
            />
          ) : null}
        </>
      )}
    </div>
  );
}
