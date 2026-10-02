import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const statuses = ["ACTIVE", "PENDING", "INACTIVE", "SUSPENDED"] as const;

export function MemberFilters({
  query,
  status,
}: {
  query?: string;
  status?: string;
}) {
  return (
    <form
      method="get"
      className="grid gap-3 rounded-xl border border-border-subtle bg-surface-raised p-4 shadow-xs sm:grid-cols-[1fr_12rem_auto]"
    >
      <Input
        id="member-query"
        name="query"
        label="Search"
        defaultValue={query ?? ""}
        placeholder="Name, email, membership number…"
      />
      <div className="flex flex-col gap-1.5">
        <label htmlFor="member-status" className="text-sm font-medium text-ink-800">
          Status
        </label>
        <select
          id="member-status"
          name="status"
          defaultValue={status ?? ""}
          className="h-11 rounded-md border border-border-default bg-surface-raised px-3 text-sm text-ink-900 shadow-xs focus-visible:border-border-focus focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
        >
          <option value="">All statuses</option>
          {statuses.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-end">
        <Button type="submit" className="w-full sm:w-auto">
          Apply filters
        </Button>
      </div>
    </form>
  );
}
