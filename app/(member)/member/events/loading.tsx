export default function MemberEventsLoading() {
  return (
    <div
      className="space-y-3 p-4 sm:p-6 lg:p-8"
      role="status"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="h-8 w-40 animate-pulse rounded-md bg-ink-100" />
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="h-28 animate-pulse rounded-xl border border-border-subtle bg-ink-50"
        />
      ))}
      <span className="sr-only">Loading events</span>
    </div>
  );
}
