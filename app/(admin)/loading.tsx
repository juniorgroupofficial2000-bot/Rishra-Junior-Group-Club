export default function AdminLoading() {
  return (
    <div className="space-y-4 p-4 sm:p-6 lg:p-8" aria-busy="true">
      <div className="h-8 w-48 animate-pulse rounded-md bg-ink-100" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="h-28 animate-pulse rounded-xl border border-border-subtle bg-ink-50"
          />
        ))}
      </div>
      <div className="h-64 animate-pulse rounded-xl border border-border-subtle bg-ink-50" />
    </div>
  );
}
