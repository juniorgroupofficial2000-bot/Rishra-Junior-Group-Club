export default function MemberLoading() {
  return (
    <div className="space-y-4 p-6" role="status" aria-live="polite" aria-busy="true">
      <div className="h-8 w-48 animate-pulse rounded bg-ink-100" />
      <div className="h-4 w-72 animate-pulse rounded bg-ink-100" />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-xl bg-ink-100" />
        ))}
      </div>
      <span className="sr-only">Loading member portal</span>
    </div>
  );
}
