import { cn } from "@/lib/cn";

export function CatalogFilterBar({
  action,
  query,
  category,
  categories,
  className,
}: {
  action: string;
  query?: string;
  category?: string;
  categories?: Array<{ value: string; label: string }>;
  className?: string;
}) {
  return (
    <form
      method="get"
      action={action}
      className={cn(
        "flex flex-col gap-3 border-y border-border-subtle py-4 sm:flex-row sm:items-end",
        className,
      )}
    >
      <label className="min-w-0 flex-1 text-sm">
        <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-400">
          Search
        </span>
        <input
          type="search"
          name="q"
          defaultValue={query ?? ""}
          placeholder="Search…"
          className="min-h-11 w-full rounded-md border border-border-default bg-white px-3 text-sm text-ink-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </label>
      {categories ? (
        <label className="w-full text-sm sm:w-48">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-400">
            Category
          </span>
          <select
            name="category"
            defaultValue={category ?? ""}
            className="min-h-11 w-full rounded-md border border-border-default bg-white px-3 text-sm text-ink-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">All</option>
            {categories.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      <button
        type="submit"
        className="inline-flex min-h-11 items-center justify-center rounded-md bg-ink-900 px-4 text-sm font-medium text-white hover:bg-ink-800"
      >
        Apply
      </button>
    </form>
  );
}
